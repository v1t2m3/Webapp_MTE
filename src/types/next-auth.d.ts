import "next-auth";
import { UserRole } from "./index";

declare module "next-auth" {
    interface User {
        id: string;
        fullName?: string;
        role: UserRole;
        level?: 1 | 2 | 3 | 4;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            fullName?: string;
            email?: string | null;
            image?: string | null;
            role: UserRole;
            level?: 1 | 2 | 3 | 4;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        fullName?: string;
        role: UserRole;
        level?: 1 | 2 | 3 | 4;
    }
}
