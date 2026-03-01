import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";
import { User, UserRole } from "@/types";
import bcrypt from "bcryptjs";

const usersFilePath = path.join(process.cwd(), "src", "data", "users.json");

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json([]);
        }

        const data = fs.readFileSync(usersFilePath, "utf8");
        const users = JSON.parse(data) as User[];

        let needsSave = false;
        users.forEach(u => {
            if (u.role === "User" && !u.level) {
                u.level = 1; // Default to level 1
                needsSave = true;
            } else if (u.role !== "User" && u.level) {
                delete u.level;
                needsSave = true;
            }
        });

        if (needsSave) {
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
        }

        // Strip out passwords securely when sending to frontend
        const safeUsers = users.map(({ passwordHash, ...user }) => user);

        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, action } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "Users database not found" }, { status: 404 });
        }

        const data = fs.readFileSync(usersFilePath, "utf8");
        let users = JSON.parse(data) as User[];

        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (action === "reset_password") {
            users[userIndex].passwordHash = await bcrypt.hash("MTELAB#2026Reset", 10);
        } else {
            const { role, fullName, level } = body;
            if (role && !["Admin", "User", "Viewer"].includes(role)) {
                return NextResponse.json({ error: "Invalid role" }, { status: 400 });
            }
            if (role) users[userIndex].role = role as UserRole;
            if (fullName) users[userIndex].fullName = fullName;

            if (users[userIndex].role === "User") {
                if (level !== undefined) {
                    if (![1, 2, 3, 4].includes(level)) {
                        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
                    }
                    users[userIndex].level = level;
                } else if (!users[userIndex].level) {
                    users[userIndex].level = 1; // default fallback
                }
            } else {
                delete users[userIndex].level;
            }
        }

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");

        const { passwordHash, ...safeUser } = users[userIndex];
        return NextResponse.json({ success: true, user: safeUser });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { username, role, fullName, level } = await req.json();

        if (!username || !role || !fullName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!["Admin", "User", "Viewer"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        if (role === "User" && level !== undefined && ![1, 2, 3, 4].includes(level)) {
            return NextResponse.json({ error: "Invalid level" }, { status: 400 });
        }

        let users: User[] = [];
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, "utf8");
            users = JSON.parse(data) as User[];
        }

        if (users.find(u => u.username === username || u.id === username)) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const newUser: User = {
            id: username, // Sync ID with Personnel ID (which is entered as username)
            username: username,
            passwordHash: await bcrypt.hash("MTELAB#2026Reset", 10),
            role: role as UserRole,
            level: role === "User" ? (level || 1) : undefined,
            fullName: fullName,
            isActive: true
        };

        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");

        const { passwordHash, ...safeUser } = newUser;
        return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
        }

        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 403 });
        }

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "Users database not found" }, { status: 404 });
        }

        const data = fs.readFileSync(usersFilePath, "utf8");
        let users = JSON.parse(data) as User[];

        const initialLength = users.length;
        users = users.filter(u => u.id !== id);

        if (users.length === initialLength) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
