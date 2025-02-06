import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "shivam@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await axios.post(`${HTTP_BACKEND_URL}/api/v1/signin`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (res.data.success && res.data.data) {
            const user1 = res.data.data;
            const user = {
              id: user1.id,
              name: user1.name,
              email: user1.email,
              token: res.data.token, // Pass token to session callback
            };
            return user;
          }
        } catch (error) {
          console.error("Error in authorize:", error);
          throw new Error("Invalid credentials");
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 🔥 Session persists for 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 🔥 JWT expires after 30 days
  },
  secret: process.env.NEXTAUTH_SECRET, // 🔥 Use environment variable for security
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.token; // 🔥 Store the token securely in JWT
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.accessToken = token.accessToken; // 🔥 Pass token to frontend
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
