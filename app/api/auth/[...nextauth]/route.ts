import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";

// 세션 타입 확장
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// JWT 타입 확장
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  debug: true, // 항상 디버그 활성화
  logger: {
    error(code, metadata) {
      console.error(`[Error] ${code}:`, metadata);
    },
    warn(code) {
      console.warn(`[Warning] ${code}`);
    },
    debug(code, metadata) {
      console.log(`[Debug] ${code}:`, metadata);
    },
  },
  callbacks: {
    async session({ session, token }) {
      console.log('[Session Callback]', { session, token });
      // 세션에 사용자 ID 추가
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('[JWT Callback]', { token, user, account });
      // 초기 로그인 시 사용자 정보를 토큰에 추가
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log('[Redirect Callback]', { url, baseUrl });
      
      // 로그인 성공 후 기본 리다이렉트를 setup 페이지로 변경
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/setup`;
      }
      
      // 안전한 URL로 리다이렉션
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (url.startsWith(baseUrl)) {
        return url;
      }
      
      return `${baseUrl}/setup`;
    },
    async signIn({ user, account, profile }) {
      console.log('[SignIn Callback] 시작', { 
        user: user ? { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          image: user.image 
        } : 'user 없음', 
        account: account ? { 
          provider: account.provider, 
          type: account.type 
        } : 'account 없음', 
        profileExists: !!profile 
      });
      
      // 유효한 사용자 데이터가 아예 없는 경우만 실패 처리
      if (!user) {
        console.error('[SignIn Callback] 사용자 정보 없음');
        return false;
      }
      
      // 이메일이 없어도 로그인 성공 처리
      if (!user.email) {
        console.warn('[SignIn Callback] 이메일 없음, 그래도 로그인 허용:', user.name || 'unknown');
      }
      
      // 항상 성공으로 처리
      console.log('[SignIn Callback] 성공 처리');
      return true;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 