$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$errors = New-Object System.Collections.Generic.List[string]

function Add-ErrorMessage {
  param([string]$Message)
  [void]$errors.Add($Message)
}

git -C $root fetch --quiet origin main

$head = (git -C $root rev-parse HEAD).Trim()
$origin = (git -C $root rev-parse origin/main).Trim()
if ($head -ne $origin) {
  Add-ErrorMessage "HEAD is not origin/main. Push the exact commit first, then deploy."
}

$status = git -C $root status --porcelain=v1
if ($status) {
  Add-ErrorMessage "Working tree is dirty. Commit or discard changes before deploy."
}

$htmlFiles = Get-ChildItem -LiteralPath $root -Recurse -File -Filter "*.html" |
  Where-Object {
    $_.FullName -notmatch "\\\.git\\" -and
    $_.FullName -notmatch "\\\.wrangler\\" -and
    $_.FullName -notmatch "\\node_modules\\"
  }

$directRandomHeader = @()
foreach ($file in $htmlFiles) {
  $html = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  if ($html.Contains('<a class="header-random-encounter" href="/?random=1">')) {
    $directRandomHeader += $file.FullName.Substring($root.Path.Length + 1)
  }
}
if ($directRandomHeader.Count -gt 0) {
  Add-ErrorMessage "Old direct random header link remains in $($directRandomHeader.Count) HTML file(s)."
}

$footerPath = Join-Path $root "assets\partials\footer.html"
if (-not (Test-Path -LiteralPath $footerPath)) {
  Add-ErrorMessage "Managed footer partial is missing."
} else {
  $footer = Get-Content -LiteralPath $footerPath -Raw -Encoding UTF8
  if (-not $footer.Contains("managed-footer:start")) {
    Add-ErrorMessage "Managed footer partial marker is missing."
  }
}

$cssPath = Join-Path $root "assets\css\style.css"
$css = Get-Content -LiteralPath $cssPath -Raw -Encoding UTF8
if (-not $css.Contains("Stable restore guards")) {
  Add-ErrorMessage "Stable restore CSS guard is missing."
}

$footerJsPath = Join-Path $root "assets\js\footer.js"
$footerJs = Get-Content -LiteralPath $footerJsPath -Raw -Encoding UTF8
if (-not $footerJs.Contains('.site-header .header-random-encounter')) {
  Add-ErrorMessage "Header duplicate-prevention guard is missing from footer.js."
}

if ($errors.Count -gt 0) {
  Write-Error "Predeploy check failed:"
  foreach ($message in $errors) {
    Write-Error "- $message"
  }
  exit 1
}

Write-Host "Predeploy check passed: clean latest commit, no old header link, footer and layout guards present."
