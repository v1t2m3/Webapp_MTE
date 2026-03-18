import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    // Protect everything except /login, /profile, /api/auth, static files, and public images/pdfs
    matcher: ["/((?!login|profile|api/auth|_next/static|_next/image|favicon.ico|images|pdfs).*)"],
};
