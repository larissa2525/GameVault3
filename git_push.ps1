<#
Usage:
  .\git_push.ps1 -remoteUrl "https://github.com/username/repo.git" [-branch "main"] [-token "YOUR_PAT"]

This script will:
 - check for Git
 - initialize repo if needed
 - ensure branch exists
 - remove .env from the index (if present)
 - add, commit and push to the given remote

If you provide `-token`, the script temporarily uses it to push over HTTPS and then restores the remote URL.
#>

param(
  [string]$remoteUrl = "https://github.com/larissa2525/GameVault2.git",
  [string]$branch = "main",
  [string]$token = ""
)

function ExitWithError($msg, $code=1) {
  Write-Host $msg -ForegroundColor Red
  exit $code
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  ExitWithError "git not found. Install Git and re-run the script: https://git-scm.com/download/win"
}

Write-Host "Using remote: $remoteUrl" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
  git init
}

# create or switch to branch
try {
  git switch $branch 2>$null
} catch {
  git checkout -b $branch 2>$null
}

# ensure .env is not tracked
git rm --cached .env 2>$null | Out-Null

# add and commit
git add .
$commitResult = & git commit -m "chore: initial commit" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Commit may have no changes or failed:"
  Write-Host $commitResult
}

# handle remote with optional token
$remoteToUse = $remoteUrl
if ($token -ne "") {
  if ($remoteUrl -match '^https://') {
    $trimmed = $remoteUrl -replace '^https://',''
    $remoteToUse = "https://$token@$trimmed"
  } else {
    $remoteToUse = $remoteUrl
  }
}

git remote remove origin 2>$null | Out-Null
git remote add origin $remoteToUse

Write-Host "Pushing to origin/$branch..." -ForegroundColor Cyan
& git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
  ExitWithError "Push failed. Check credentials or provide a valid PAT via -token."
}

# if we used a token in the remote URL, restore the origin to the non-token URL
if ($token -ne "" -and $remoteUrl -match '^https://') {
  git remote set-url origin $remoteUrl
}

Write-Host "Push complete." -ForegroundColor Green
