import { User } from '@/types';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Fetch users from our local JSON file dynamically to bypass module caching
export async function getUsers(): Promise<User[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData) as User[];
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
