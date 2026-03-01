import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByUsername, verifyPassword } from "./auth-service";
import { UserRole } from "@/types";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "MTE-LAB Credentials",
            credentials: {
                username: { label: "Username/Email", type: "text", placeholder: "admin@evncpc.vn" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Vui lòng nhập đầy đủ thông tin");
                }

                const user = await getUserByUsername(credentials.username);

                if (!user || (!user.passwordHash && user.passwordHash !== '')) {
                    throw new Error("Không tìm thấy tài khoản");
                }

                if (!user.isActive) {
                    throw new Error("Tài khoản đã bị vô hiệu hóa");
                }

                // Verify the hashed password
                const isValid = await verifyPassword(credentials.password, user.passwordHash as string);

                if (!isValid) {
                    throw new Error("Mật khẩu không chính xác");
                }

                return {
                    id: user.id,
                    name: user.fullName,
                    email: user.username,
                    role: user.role,
                    level: user.level,
                };
            }
        })
    ],
    pages: {
        signIn: '/login', // Redirect users to custom login page
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    },
    callbacks: {
        async jwt({ token, user }) {
            // Put custom role into JWT token payload when user logs in
            if (user) {
                token.id = user.id;
                token.role = (user as any).role as UserRole;
                token.level = (user as any).level as 1 | 2 | 3 | 4 | undefined;
            }
            return token;
        },
        async session({ session, token }) {
            // Attach role and ID from token back onto the session object
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role as UserRole;
                (session.user as any).level = token.level as 1 | 2 | 3 | 4 | undefined;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "mte-lab-secret-key-for-development-only-evncpc",
};
