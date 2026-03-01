import { getUserByUsername, verifyPassword } from './src/lib/auth-service.js';

async function run() {
    try {
        console.log("Fetching user...");
        const user = await getUserByUsername("admin@evncpc.vn");
        console.log("User:", user);

        if (user && user.passwordHash) {
            console.log("Verifying password '123456' against hash...");
            const isValid = await verifyPassword("123456", user.passwordHash as string);
            console.log("Is Valid?", isValid);
        } else {
            console.log("User or fast hash missing");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
