# AI 포춘 - 운세 서비스

인공지능을 활용한 운세 및 부적 생성 서비스입니다.

## 주요 기능

- 사용자 프로필 기반 운세 제공
- AI 상담을 통한 고민 해결
- 맞춤형 부적 생성 및 보관

## 기술 스택

- **프론트엔드**: React, Next.js 15, TailwindCSS
- **백엔드**: Next.js API Routes
- **인증**: NextAuth.js
- **데이터베이스**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **스토리지**: Supabase Storage
- **AI**: OpenAI API, Replicate API

## 설치 및 실행

1. 저장소 클론:

   ```bash
   git clone https://github.com/yourusername/ai-fortune.git
   cd ai-fortune
   ```

2. 의존성 설치:

   ```bash
   npm install
   ```

3. 환경 변수 설정:
   `.env.local` 파일을 생성하고 다음 내용 추가:

   ```
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_ID].supabase.co:5432/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   NEXTAUTH_SECRET=[RANDOM_SECRET]
   NEXTAUTH_URL=http://localhost:3000
   OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
   REPLICATE_API_TOKEN=[YOUR_REPLICATE_API_TOKEN]
   ```

4. 데이터베이스 마이그레이션 실행:

   ```bash
   npx drizzle-kit generate:pg
   node -r ts-node/register db/migrations.ts
   ```

5. 개발 서버 실행:

   ```bash
   npm run dev
   ```

6. 브라우저에서 확인:
   ```
   http://localhost:3000
   ```

## 프로젝트 구조

```
/app
  /(main)          # 메인 애플리케이션 레이아웃 및 페이지
  /(auth)          # 인증 관련 페이지
  /api             # API 엔드포인트
  /components      # 재사용 가능한 컴포넌트
  /lib             # 유틸리티 함수 및 API 클라이언트
/db                # Drizzle ORM 설정 및 스키마
  /schema.ts       # 데이터베이스 스키마 정의
  /index.ts        # 데이터베이스 연결 설정
  /migrations.ts   # 마이그레이션 실행 유틸리티
/supabase          # Supabase 설정 및 마이그레이션
  /migrations      # SQL 마이그레이션 파일
/public            # 정적 파일
```

## 데이터베이스 스키마

자세한 내용은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 문서를 참조하세요.

## 라이센스

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
