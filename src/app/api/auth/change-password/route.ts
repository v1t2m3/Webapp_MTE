import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";
import { User, UserRole } from "@/types";
import bcrypt from "bcryptjs";

const usersFilePath = path.join(process.cwd(), "src", "data", "users.json");

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { oldPassword, newPassword } = await req.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json({ error: "Invalid password format" }, { status: 400 });
        }

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "Users database not found" }, { status: 404 });
        }

        const data = fs.readFileSync(usersFilePath, "utf8");
        let users = JSON.parse(data) as User[];

        const userIndex = users.findIndex(u => u.id === session.user.id || u.username === session.user.email);

        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const targetUser = users[userIndex];

        // Verify old password
        if (targetUser.passwordHash) {
            const isValid = await bcrypt.compare(oldPassword, targetUser.passwordHash);
            if (!isValid) {
                return NextResponse.json({ error: "Mật khẩu cũ không chính xác" }, { status: 401 });
            }
        } else {
            return NextResponse.json({ error: "User configuration issue (No hash found)" }, { status: 500 });
        }

        // Set new hash
        users[userIndex].passwordHash = await bcrypt.hash(newPassword, 10);

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
    }
}
