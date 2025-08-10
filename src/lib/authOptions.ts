/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
      user: {
        /** The user's postal address. */
        id: string
      } & DefaultSession["user"]
    }
  }
  
  export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        if (token) {
          session.user.id = token.sub;
        }
        return session;
      },
      async jwt({ token, user }: { token: any; user: any }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },
    },
    pages: {
      signIn: '/api/auth/signin',
    },
  };
  