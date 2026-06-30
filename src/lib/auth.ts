import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone Passcode",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "+91 98765 43210" },
        otp: { label: "SMS Passcode", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        // In production, verify OTP via Twilio or Supabase Auth SMS APIs here.
        // For demonstration, passcode is simulated as '123456'.
        if (credentials.otp !== "123456") {
          throw new Error("Invalid SMS OTP verification passcode");
        }

        // Fetch or auto-register user on first passcode authentication
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user) {
          // Auto-registration on first login
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              name: `User_${credentials.phone.slice(-4)}`,
              email: `${credentials.phone.slice(-4)}@farmlink.ai`,
              role: "FARMER", // Default role
              location: "Mandi Hub, India"
            }
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          walletBalance: user.walletBalance
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.walletBalance = (user as any).walletBalance;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).walletBalance = token.walletBalance;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth"
  }
};
