#!/usr/bin/env python3
"""ATAWI MUSIC official YouTube MV collection manager."""
from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import re
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK_DIR = Path(os.environ.get("ATAWI_MUSIC_WORK_DIR", Path.home() / "tmp"))
DEFAULT_DB = WORK_DIR / "atawi-music-youtube_mv.sqlite"
LOG_DIR = WORK_DIR
STATUSES = {"pending", "verified", "rejected"}
NEGATIVE_WORDS = ("cover", "covered by", "karaoke", "lyrics", "歌ってみた", "カバー", "reaction", "instrumental")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def setup_logging() -> None:
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stdout)]
    log_file = os.environ.get("ATAWI_MUSIC_LOG_FILE")
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        handlers.insert(0, logging.FileHandler(log_path, encoding="utf-8"))
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=handlers,
    )


def load_env() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS artist_master (
            artist_id TEXT PRIMARY KEY,
            artist_name TEXT NOT NULL,
            official_channel_name TEXT,
            official_channel_id TEXT,
            label_name TEXT,
            label_channel_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS song_master (
            song_id TEXT PRIMARY KEY,
            artist_id TEXT NOT NULL REFERENCES artist_master(artist_id),
            song_title TEXT NOT NULL,
            release_year INTEGER,
            decade TEXT,
            article_url TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS youtube_candidates (
            video_id TEXT PRIMARY KEY,
            song_id TEXT NOT NULL REFERENCES song_master(song_id),
            title TEXT NOT NULL,
            channel_name TEXT,
            channel_id TEXT,
            description TEXT,
            thumbnail_url TEXT,
            youtube_url TEXT NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            score_reasons TEXT NOT NULL DEFAULT '[]',
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
            source_query TEXT,
            published_at TEXT,
            fetched_at TEXT NOT NULL,
            reviewed_at TEXT,
            review_note TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_youtube_candidates_song_status ON youtube_candidates(song_id, status);
        CREATE TABLE IF NOT EXISTS run_logs (
            run_id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """
    )
    conn.commit()


def log_run(conn: sqlite3.Connection, action: str, message: str) -> None:
    conn.execute("INSERT INTO run_logs(action, message, created_at) VALUES (?, ?, ?)", (action, message, utc_now()))
    conn.commit()
    logging.info("%s: %s", action, message)


def empty_to_none(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def parse_int(value: object) -> int | None:
    try:
        return int(str(value).strip())
    except Exception:
        return None


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"https?://", "", value)
    value = re.sub(r"[^a-z0-9一-龥ぁ-んァ-ンー]+", "-", value)
    return value.strip("-") or "item"


def extract_video_id(url: str) -> str | None:
    if not url:
        return None
    parsed = urllib.parse.urlparse(url)
    if parsed.hostname in {"youtu.be", "www.youtu.be"}:
        return parsed.path.strip("/") or None
    qs = urllib.parse.parse_qs(parsed.query)
    if "v" in qs and qs["v"]:
        return qs["v"][0]
    match = re.search(r"(?:embed|shorts)/([A-Za-z0-9_-]{6,})", parsed.path)
    return match.group(1) if match else None


def import_csv(conn: sqlite3.Connection, csv_path: Path) -> None:
    now = utc_now()
    inserted_artists = inserted_songs = 0
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not {"artist_name", "song_title"}.issubset(reader.fieldnames or []):
            raise SystemExit("CSVには artist_name と song_title が必要です。")
        for row in reader:
            artist_name = (row.get("artist_name") or "").strip()
            song_title = (row.get("song_title") or "").strip()
            if not artist_name or not song_title:
                continue
            artist_id = (row.get("artist_id") or slugify(artist_name)).strip()
            song_id = (row.get("song_id") or f"{artist_id}-{slugify(song_title)}").strip()
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO artist_master
                (artist_id, artist_name, official_channel_name, official_channel_id, label_name, label_channel_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (artist_id, artist_name, empty_to_none(row.get("official_channel_name")), empty_to_none(row.get("official_channel_id")), empty_to_none(row.get("label_name")), empty_to_none(row.get("label_channel_id")), now, now),
            )
            inserted_artists += cur.rowcount
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO song_master
                (song_id, artist_id, song_title, release_year, decade, article_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (song_id, artist_id, song_title, parse_int(row.get("release_year")), empty_to_none(row.get("decade")), empty_to_none(row.get("article_url")), now, now),
            )
            inserted_songs += cur.rowcount
    conn.commit()
    log_run(conn, "import_csv", f"artists +{inserted_artists}, songs +{inserted_songs}")


def import_existing_songs(conn: sqlite3.Connection, songs_path: Path, artists_path: Path) -> None:
    artists = json.loads(artists_path.read_text(encoding="utf-8")) if artists_path.exists() else []
    artist_by_name = {a.get("name"): a for a in artists if a.get("name")}
    songs = json.loads(songs_path.read_text(encoding="utf-8"))
    now = utc_now()
    for song in songs:
        artist_name = song.get("artist")
        title = song.get("title")
        if not artist_name or not title:
            continue
        artist = artist_by_name.get(artist_name, {})
        artist_id = artist.get("id") or slugify(artist_name)
        song_id = song.get("id") or f"{artist_id}-{slugify(title)}"
        conn.execute("INSERT OR IGNORE INTO artist_master (artist_id, artist_name, created_at, updated_at) VALUES (?, ?, ?, ?)", (artist_id, artist_name, now, now))
        conn.execute(
            """
            INSERT OR IGNORE INTO song_master
            (song_id, artist_id, song_title, release_year, decade, article_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (song_id, artist_id, title, parse_int(song.get("release_year")), empty_to_none(song.get("decade")), empty_to_none(song.get("article_url")), now, now),
        )
        video_id = extract_video_id(song.get("youtube_url") or "")
        if video_id:
            conn.execute(
                """
                INSERT OR IGNORE INTO youtube_candidates
                (video_id, song_id, title, channel_name, channel_id, description, thumbnail_url, youtube_url, score, score_reasons, status, source_query, published_at, fetched_at, reviewed_at, review_note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (video_id, song_id, title, song.get("source_owner") or "", None, "", "", song.get("youtube_url"), 100, json.dumps(["既存公開データから移行"], ensure_ascii=False), "verified", "existing songs.json", None, now, now, "既存の公開曲として承認済み扱い"),
            )
    conn.commit()
    log_run(conn, "import_existing", f"{len(songs)} songs loaded from songs.json")


def search_queries(artist: str, title: str) -> list[str]:
    return [f"{artist} {title} official music video", f"{artist} {title} MV", f"{artist} {title} 公式"]


def youtube_api_get(params: dict[str, str], retries: int = 3) -> dict:
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        raise SystemExit(".env または環境変数に YOUTUBE_API_KEY がありません。")
    url = "https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode({**params, "key": api_key})
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(url, timeout=20) as res:
                return json.loads(res.read().decode("utf-8"))
        except Exception as exc:
            last_error = exc
            time.sleep(min(2**attempt, 10))
    raise RuntimeError(f"YouTube API failed: {last_error}")


def normalize(value: str) -> str:
    return re.sub(r"\s+", "", value or "").lower()


def score_candidate(row: sqlite3.Row, item: dict) -> tuple[int, list[str]]:
    snippet = item.get("snippet", {})
    title = snippet.get("title") or ""
    channel_title = snippet.get("channelTitle") or ""
    channel_id = snippet.get("channelId") or ""
    description = snippet.get("description") or ""
    score = 0
    reasons: list[str] = []
    if "official" in channel_title.lower() or "公式" in channel_title:
        score += 30; reasons.append("Official/公式チャンネル名 +30")
    if row["official_channel_id"] and channel_id == row["official_channel_id"]:
        score += 50; reasons.append("登録済み公式チャンネル +50")
    if row["label_channel_id"] and channel_id == row["label_channel_id"]:
        score += 40; reasons.append("登録済みレーベル公式 +40")
    if row["official_channel_name"] and row["official_channel_name"].lower() in channel_title.lower():
        score += 30; reasons.append("公式チャンネル名一致 +30")
    if row["label_name"] and row["label_name"].lower() in channel_title.lower():
        score += 40; reasons.append("レーベル名一致 +40")
    if normalize(row["song_title"]) and normalize(row["song_title"]) in normalize(title):
        score += 20; reasons.append("曲名一致 +20")
    if re.search(r"official\s*(music\s*)?video|official\s*mv|\bmv\b|公式", title, re.I):
        score += 20; reasons.append("Official Video/MV/公式表記 +20")
    if re.search(r"lnk\.to|linkco\.re|big-up\.style|orcd\.co|配信|streaming", description, re.I):
        score += 10; reasons.append("配信リンクらしき記載 +10")
    haystack = f"{title} {channel_title} {description}".lower()
    for word in NEGATIVE_WORDS:
        if word.lower() in haystack:
            score -= 50; reasons.append(f"{word} -50")
    return score, reasons


def search_youtube(conn: sqlite3.Connection, limit: int | None = None, song_id: str | None = None) -> None:
    sql = """
        SELECT s.*, a.artist_name, a.official_channel_name, a.official_channel_id, a.label_name, a.label_channel_id
        FROM song_master s JOIN artist_master a ON a.artist_id = s.artist_id
    """
    params: list[object] = []
    if song_id:
        sql += " WHERE s.song_id = ?"; params.append(song_id)
    sql += " ORDER BY s.created_at"
    if limit:
        sql += " LIMIT ?"; params.append(limit)
    songs = conn.execute(sql, params).fetchall()
    changed = 0
    for song in songs:
        for query in search_queries(song["artist_name"], song["song_title"]):
            data = youtube_api_get({"part": "snippet", "type": "video", "maxResults": "5", "q": query, "safeSearch": "none"})
            for item in data.get("items", []):
                video_id = item.get("id", {}).get("videoId")
                if not video_id:
                    continue
                snippet = item.get("snippet", {})
                score, reasons = score_candidate(song, item)
                thumbnail = (snippet.get("thumbnails", {}).get("medium") or {}).get("url") or ""
                conn.execute(
                    """
                    INSERT INTO youtube_candidates
                    (video_id, song_id, title, channel_name, channel_id, description, thumbnail_url, youtube_url, score, score_reasons, status, source_query, published_at, fetched_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(video_id) DO UPDATE SET score=excluded.score, score_reasons=excluded.score_reasons, fetched_at=excluded.fetched_at
                    """,
                    (video_id, song["song_id"], snippet.get("title") or "", snippet.get("channelTitle") or "", snippet.get("channelId") or "", snippet.get("description") or "", thumbnail, f"https://www.youtube.com/watch?v={video_id}", score, json.dumps(reasons, ensure_ascii=False), "pending", query, snippet.get("publishedAt"), utc_now()),
                )
                changed += 1
    conn.commit()
    log_run(conn, "search_youtube", f"{len(songs)} songs searched, candidates changed {changed}")


def set_status(conn: sqlite3.Connection, video_id: str, status: str, note: str = "") -> None:
    if status not in STATUSES:
        raise SystemExit(f"status must be one of {', '.join(sorted(STATUSES))}")
    conn.execute("UPDATE youtube_candidates SET status = ?, reviewed_at = ?, review_note = ? WHERE video_id = ?", (status, utc_now(), note, video_id))
    conn.commit()
    log_run(conn, "review", f"{video_id} -> {status}")


def export_verified(conn: sqlite3.Connection, out_path: Path) -> None:
    rows = conn.execute(
        """
        SELECT c.video_id, c.title, c.channel_name, c.channel_id, c.youtube_url, c.score, c.score_reasons, c.reviewed_at,
               s.song_id, s.song_title, s.release_year, s.decade, s.article_url, a.artist_id, a.artist_name
        FROM youtube_candidates c JOIN song_master s ON s.song_id = c.song_id JOIN artist_master a ON a.artist_id = s.artist_id
        WHERE c.status = 'verified' ORDER BY a.artist_name, s.song_title, c.score DESC
        """
    ).fetchall()
    out = []
    for r in rows:
        out.append({"song_id": r["song_id"], "artist_id": r["artist_id"], "artist": r["artist_name"], "title": r["song_title"], "release_year": r["release_year"], "decade": r["decade"], "article_url": r["article_url"], "youtube": {"video_id": r["video_id"], "url": r["youtube_url"], "title": r["title"], "channel_name": r["channel_name"], "channel_id": r["channel_id"], "score": r["score"], "score_reasons": json.loads(r["score_reasons"] or "[]"), "reviewed_at": r["reviewed_at"]}})
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log_run(conn, "export_verified", f"{len(out)} verified videos -> {out_path}")


def stats(conn: sqlite3.Connection) -> dict[str, int]:
    result = {}
    for table in ("artist_master", "song_master", "youtube_candidates"):
        result[table] = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    for status in sorted(STATUSES):
        result[f"status_{status}"] = conn.execute("SELECT COUNT(*) FROM youtube_candidates WHERE status = ?", (status,)).fetchone()[0]
    result["official_candidates_80_plus"] = conn.execute("SELECT COUNT(*) FROM youtube_candidates WHERE score >= 80").fetchone()[0]
    return result


def list_candidates(conn: sqlite3.Connection, status: str) -> list[sqlite3.Row]:
    where = "1=1" if status == "all" else "c.status = ?"
    params: tuple[object, ...] = () if status == "all" else (status,)
    return conn.execute(
        f"""
        SELECT c.video_id, c.title, c.channel_name, c.youtube_url, c.thumbnail_url, c.score, c.score_reasons, c.status, c.source_query, c.review_note,
               s.song_title, a.artist_name
        FROM youtube_candidates c JOIN song_master s ON s.song_id = c.song_id JOIN artist_master a ON a.artist_id = s.artist_id
        WHERE {where} ORDER BY c.score DESC, c.fetched_at DESC LIMIT 500
        """,
        params,
    ).fetchall()


class AdminHandler(BaseHTTPRequestHandler):
    conn: sqlite3.Connection
    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/":
            self.html_response(admin_page())
        elif parsed.path == "/api/candidates":
            status = urllib.parse.parse_qs(parsed.query).get("status", ["pending"])[0]
            self.json_response([dict(row) for row in list_candidates(self.conn, status)])
        elif parsed.path == "/api/stats":
            self.json_response(stats(self.conn))
        else:
            self.send_error(404)
    def do_POST(self) -> None:
        if urllib.parse.urlparse(self.path).path != "/api/status":
            self.send_error(404); return
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        set_status(self.conn, str(payload.get("video_id", "")), str(payload.get("status", "")), str(payload.get("note", "")))
        self.json_response({"ok": True})
    def json_response(self, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def html_response(self, payload: str) -> None:
        body = payload.encode("utf-8")
        self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self, fmt: str, *args: object) -> None:
        logging.info("admin %s", fmt % args)


def admin_page() -> str:
    return '''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATAWI MUSIC YouTube MV管理</title><style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f7f8;color:#1f2933}header{position:sticky;top:0;background:#fff;border-bottom:1px solid #d8dde3;padding:14px 18px;z-index:2}h1{font-size:18px;margin:0 0 8px}.tabs{display:flex;gap:8px;flex-wrap:wrap}.tabs button,.actions button{border:1px solid #b9c2cc;background:#fff;border-radius:6px;padding:8px 10px;cursor:pointer}.tabs button.active{background:#1f2933;color:#fff}.stats{font-size:13px;color:#5b6673;margin-top:8px}main{max-width:1180px;margin:18px auto;padding:0 14px;display:grid;gap:12px}.card{display:grid;grid-template-columns:160px 1fr;gap:14px;background:#fff;border:1px solid #d8dde3;border-radius:8px;padding:12px}img{width:160px;aspect-ratio:16/9;object-fit:cover;background:#e5e9ee}.meta{display:grid;gap:7px}.title{font-weight:700}.sub{color:#53606d;font-size:14px}.score{font-weight:700}.reasons{font-size:13px;color:#53606d}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}a{color:#0f5f9e}@media(max-width:700px){.card{grid-template-columns:1fr}img{width:100%}}</style></head><body><header><h1>ATAWI MUSIC YouTube公式MV候補</h1><div class="tabs"><button data-status="pending" class="active">保留</button><button data-status="verified">承認済み</button><button data-status="rejected">除外</button><button data-status="all">全件</button></div><div class="stats" id="stats"></div></header><main id="list"></main><script>const list=document.querySelector("#list"),stats=document.querySelector("#stats");let current="pending";document.querySelectorAll(".tabs button").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));btn.classList.add("active");current=btn.dataset.status;load();});async function load(){const [rows,st]=await Promise.all([fetch(`/api/candidates?status=${encodeURIComponent(current)}`).then(r=>r.json()),fetch("/api/stats").then(r=>r.json())]);stats.textContent=`候補 ${st.youtube_candidates} / 保留 ${st.status_pending} / 承認 ${st.status_verified} / 除外 ${st.status_rejected} / 80点以上 ${st.official_candidates_80_plus}`;list.innerHTML=rows.map(row=>card(row)).join("")||"<p>該当候補はありません。</p>";}function esc(v){return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));}function card(row){const reasons=JSON.parse(row.score_reasons||"[]").map(esc).join(" / ");return `<article class="card"><img src="${esc(row.thumbnail_url)}" alt=""><div class="meta"><div class="title">${esc(row.artist_name)} - ${esc(row.song_title)}</div><div>${esc(row.title)}</div><div class="sub">${esc(row.channel_name)} / query: ${esc(row.source_query)}</div><div class="score">score: ${esc(row.score)} / ${esc(row.status)}</div><div class="reasons">${reasons}</div><a href="${esc(row.youtube_url)}" target="_blank" rel="noopener">YouTubeで確認</a><div class="actions"><button onclick="setStatus('${esc(row.video_id)}','verified')">承認</button><button onclick="setStatus('${esc(row.video_id)}','pending')">保留</button><button onclick="setStatus('${esc(row.video_id)}','rejected')">除外</button></div></div></article>`;}async function setStatus(video_id,status){await fetch("/api/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({video_id,status})});load();}load();</script></body></html>'''


def serve_admin(conn: sqlite3.Connection, host: str, port: int) -> None:
    AdminHandler.conn = conn
    server = ThreadingHTTPServer((host, port), AdminHandler)
    log_run(conn, "serve_admin", f"http://{host}:{port}")
    server.serve_forever()


def main() -> None:
    setup_logging(); load_env()
    parser = argparse.ArgumentParser(description="ATAWI MUSIC YouTube official MV manager")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init-db")
    p_import = sub.add_parser("import-csv"); p_import.add_argument("csv_path", type=Path)
    p_existing = sub.add_parser("import-existing"); p_existing.add_argument("--songs", type=Path, default=ROOT / "data" / "songs.json"); p_existing.add_argument("--artists", type=Path, default=ROOT / "data" / "artists.json")
    p_search = sub.add_parser("search"); p_search.add_argument("--limit", type=int); p_search.add_argument("--song-id")
    p_review = sub.add_parser("review"); p_review.add_argument("video_id"); p_review.add_argument("status", choices=sorted(STATUSES)); p_review.add_argument("--note", default="")
    p_export = sub.add_parser("export-verified"); p_export.add_argument("--out", type=Path, default=ROOT / "data" / "youtube-official-mv.json")
    p_serve = sub.add_parser("serve-admin"); p_serve.add_argument("--host", default="127.0.0.1"); p_serve.add_argument("--port", type=int, default=8765)
    sub.add_parser("stats")
    args = parser.parse_args()
    with connect(args.db) as conn:
        init_db(conn)
        if args.cmd == "init-db": log_run(conn, "init_db", f"ready: {args.db}")
        elif args.cmd == "import-csv": import_csv(conn, args.csv_path)
        elif args.cmd == "import-existing": import_existing_songs(conn, args.songs, args.artists)
        elif args.cmd == "search": search_youtube(conn, args.limit, args.song_id)
        elif args.cmd == "review": set_status(conn, args.video_id, args.status, args.note)
        elif args.cmd == "export-verified": export_verified(conn, args.out)
        elif args.cmd == "serve-admin": serve_admin(conn, args.host, args.port)
        elif args.cmd == "stats": print(json.dumps(stats(conn), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

