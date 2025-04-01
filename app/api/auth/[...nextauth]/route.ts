import NextAuth from "next-auth";
import { authOptions } from "./auth";

// 라우트 핸들러를 생성하고 내보냄
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
