# 자동 커밋 스크립트
# 변경된 파일을 감지하고 한글로 커밋 메시지를 생성하여 자동 커밋합니다

param(
    [switch]$Watch = $false,
    [int]$Interval = 5
)

# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Git 사용자 정보 확인
function Check-GitConfig {
    $name = git config user.name
    $email = git config user.email
    
    if (-not $name -or -not $email) {
        Write-Host "⚠️  Git 사용자 정보가 설정되지 않았습니다." -ForegroundColor Yellow
        Write-Host "다음 명령어로 설정하세요:" -ForegroundColor Yellow
        Write-Host "  git config user.name `"JY`"" -ForegroundColor Cyan
        Write-Host "  git config user.email `"ji0eon11@naver.com`"" -ForegroundColor Cyan
        return $false
    }
    return $true
}

# 변경된 파일 분석하여 한글 커밋 메시지 생성
function Get-CommitMessage {
    $changedFiles = git diff --cached --name-only
    if ($changedFiles.Count -eq 0) {
        $changedFiles = git diff --name-only
    }
    
    if ($changedFiles.Count -eq 0) {
        return $null
    }
    
    $categories = @{
        "페이지" = @("src/pages/", "pages/")
        "컴포넌트" = @("src/components/", "components/")
        "스타일" = @("src/index.css", "src/App.css", "tailwind.config", "*.css")
        "설정" = @("package.json", "tsconfig", "vite.config", "eslint.config", ".gitignore")
        "라우팅" = @("src/App.tsx", "src/main.tsx")
        "문서" = @("README", "*.md")
        "빌드" = @("dist/", "build/")
    }
    
    $messages = @()
    $fileTypes = @{}
    
    foreach ($file in $changedFiles) {
        $category = "기타"
        $fileType = "파일"
        
        # 카테고리 분류
        foreach ($cat in $categories.Keys) {
            $patterns = $categories[$cat]
            foreach ($pattern in $patterns) {
                if ($file -like "*$pattern*") {
                    $category = $cat
                    break
                }
            }
            if ($category -ne "기타") { break }
        }
        
        # 파일 타입 분류
        if ($file -match "\.(tsx?|jsx?)$") { $fileType = "코드" }
        elseif ($file -match "\.(css|scss)$") { $fileType = "스타일" }
        elseif ($file -match "\.(json|config)$") { $fileType = "설정" }
        elseif ($file -match "\.(md|txt)$") { $fileType = "문서" }
        
        # 파일명에서 의미 추출
        $fileName = Split-Path $file -Leaf
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
        
        # 특정 파일명 매핑
        $fileNames = @{
            "Index" = "메인 페이지"
            "Lyrics" = "가사 입력 페이지"
            "FinalSong" = "최종 노래 페이지"
            "NotFound" = "404 페이지"
            "App" = "앱 메인"
            "main" = "진입점"
        }
        
        $displayName = if ($fileNames.ContainsKey($baseName)) {
            $fileNames[$baseName]
        } else {
            $baseName
        }
        
        if (-not $fileTypes.ContainsKey($category)) {
            $fileTypes[$category] = @()
        }
        $fileTypes[$category] += $displayName
    }
    
    # 커밋 메시지 생성
    if ($fileTypes.Count -eq 1) {
        $cat = $fileTypes.Keys[0]
        $files = $fileTypes[$cat] | Select-Object -Unique
        if ($files.Count -eq 1) {
            $messages += "$cat`: $($files[0]) 수정"
        } else {
            $messages += "$cat`: $($files.Count)개 항목 수정"
        }
    } else {
        $mainCategory = ($fileTypes.Keys | Sort-Object | Select-Object -First 1)
        $totalFiles = ($fileTypes.Values | Measure-Object -Sum).Count
        $messages += "$mainCategory 외 $($fileTypes.Count - 1)개 카테고리: 총 $totalFiles개 파일 수정"
    }
    
    # 변경 내용 요약 추가
    $added = (git diff --cached --numstat 2>$null | Measure-Object).Count
    $modified = (git diff --cached --shortstat 2>$null)
    
    if ($added -gt 0 -or $modified) {
        $messages += "변경된 파일: $($changedFiles.Count)개"
    }
    
    return $messages -join " | "
}

# 자동 커밋 수행
function Invoke-AutoCommit {
    Write-Host "`n🔍 변경사항 확인 중..." -ForegroundColor Cyan
    
    # 변경된 파일 확인
    git add -A
    $status = git status --porcelain
    
    if (-not $status) {
        Write-Host "✅ 커밋할 변경사항이 없습니다." -ForegroundColor Green
        return $false
    }
    
    # 커밋 메시지 생성
    $commitMessage = Get-CommitMessage
    if (-not $commitMessage) {
        $commitMessage = "파일 변경사항 커밋"
    }
    
    Write-Host "📝 커밋 메시지: $commitMessage" -ForegroundColor Yellow
    
    # 커밋 실행
    try {
        git commit -m $commitMessage
        Write-Host "✅ 커밋 완료: $commitMessage" -ForegroundColor Green
        
        # 커밋 정보 표시
        $commitHash = (git log -1 --pretty=format:"%h")
        $commitDate = (git log -1 --pretty=format:"%cd" --date=format:"%Y-%m-%d %H:%M:%S")
        Write-Host "   커밋 해시: $commitHash" -ForegroundColor Gray
        Write-Host "   커밋 시간: $commitDate" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "❌ 커밋 실패: $_" -ForegroundColor Red
        return $false
    }
}

# 파일 감시 모드
function Start-WatchMode {
    Write-Host "`n👀 파일 감시 모드 시작 (간격: ${Interval}초)" -ForegroundColor Cyan
    Write-Host "종료하려면 Ctrl+C를 누르세요.`n" -ForegroundColor Yellow
    
    $lastCommit = git log -1 --pretty=format:"%H" 2>$null
    
    while ($true) {
        Start-Sleep -Seconds $Interval
        
        $currentCommit = git log -1 --pretty=format:"%H" 2>$null
        $hasChanges = git diff --quiet 2>$null; $hasChanges = -not $?
        $hasStaged = git diff --cached --quiet 2>$null; $hasStaged = -not $?
        
        if ($hasChanges -or $hasStaged) {
            Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] 변경사항 감지됨" -ForegroundColor Magenta
            Invoke-AutoCommit | Out-Null
        }
    }
}

# 메인 실행
Write-Host "`n🚀 자동 커밋 스크립트 시작`n" -ForegroundColor Green

if (-not (Check-GitConfig)) {
    exit 1
}

if ($Watch) {
    Start-WatchMode
} else {
    Invoke-AutoCommit
}

