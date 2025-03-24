import NextAuth from "next-auth";
import { authOptions } from "./route";

export const { auth } = NextAuth(authOptions); 