import { google } from "googleapis";

export async function getPersonnelData() {
    try {
        const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
        const jwt = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            scopes,
        });

        const sheets = google.sheets({ version: "v4", auth: jwt });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "NhanSu!A2:H", // Assuming headers are in row 1
        });

        const rows = response.data.values;
        if (!rows?.length) {
            return [];
        }

        return rows.map((row) => ({
            id: row[0],
            fullName: row[1],
            birthYear: row[2],
            job: row[3],
            skillLevel: row[4],
            safetyLevel: row[5],
            education: row[6],
            contractType: row[7],
        }));
    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return [];
    }
}
