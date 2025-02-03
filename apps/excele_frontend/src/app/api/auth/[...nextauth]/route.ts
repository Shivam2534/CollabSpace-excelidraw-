import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "shivam" },
        email: {
          label: "Email",
          type: "text",
          placeholder: "shivam@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post(`${HTTP_BACKEND_URL}/api/v1/signin`, {
            email: credentials?.email,
            password: credentials?.password,
          });
      
          if (res.data.success && res.data.data) {
            const user = res.data.data; // Extract the actual user object
      
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              token: user.token, // Add the token if available
            };
          }
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
        return null;
      }
      
    }),
  ],
  secret: "heloo this is my secrete",
});

export { handler as GET, handler as POST };
