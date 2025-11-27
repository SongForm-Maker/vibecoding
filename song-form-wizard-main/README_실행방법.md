# Song Form Maker - 로컬 실행 방법

## 🚀 개발 서버 시작하기

### 방법 1: 명령 프롬프트 사용

1. **Windows 탐색기**에서 이 폴더를 엽니다:
   ```
   D:\AI_레벨업\251127_song-form-maker\song-form-wizard-main
   ```

2. 폴더 주소창에 `cmd`를 입력하고 Enter를 누릅니다
   - 또는 폴더 안에서 `Shift + 우클릭` → "여기에 PowerShell 창 열기" 또는 "여기에 명령 프롬프트 창 열기"

3. 다음 명령어를 입력합니다:
   ```bash
   npm run dev
   ```

4. 서버가 시작되면 다음과 같은 메시지가 표시됩니다:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ➜  press h + enter to show help
   ```

5. 브라우저에서 http://localhost:5173/ 을 엽니다

### 방법 2: start-dev-server.bat 사용

1. Windows 탐색기에서 `song-form-wizard-main` 폴더를 엽니다

2. `start-dev-server.bat` 파일을 더블클릭합니다

3. 명령 프롬프트 창이 열리고 서버가 자동으로 시작됩니다

4. 브라우저에서 http://localhost:5173/ 을 엽니다

## ⚠️ 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 다른 포트 사용 (예: 3000)
npm run dev -- --port 3000
```

### node_modules가 없거나 오류가 발생하는 경우
```bash
# 의존성 재설치
npm install
```

### 캐시 문제
```bash
# 캐시 삭제 후 재시작
npm run dev -- --force
```

## 📂 올바른 경로 확인

반드시 **song-form-wizard-main** 폴더 안에서 명령어를 실행해야 합니다!

❌ 잘못된 경로: `D:\AI_레벨업\251127_song-form-maker`
✅ 올바른 경로: `D:\AI_레벨업\251127_song-form-maker\song-form-wizard-main`

## 🎵 프로젝트 사용 방법

1. **Index 페이지**: 노래 구조 입력 (intro, verse, chorus 등)
2. **Lyrics 페이지**: 각 섹션의 가사 입력
3. **FinalSong 페이지**: 완성된 노래 확인

즐거운 작곡 되세요! 🎶

