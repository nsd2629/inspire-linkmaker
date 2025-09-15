# Cloudflare Pages Pipeline
- PR마다 CI 빌드, Preview URL 자동 생성
- main 머지 시 dist/ 자동 배포 (Build: npm run build)

## 설정
- Pages: Production branch=main, Build= npm run build, Output= dist
- 환경변수는 Pages 대시보드에서 관리
