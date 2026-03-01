const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const { loadEnvConfig } = require('@next/env');

async function listData() {
    try {
        const projectDir = __dirname;
        loadEnvConfig(projectDir);

        const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

        const client = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth: client });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1p0z_lGfnUuMCfse_n2tc4SfT0yF-pEV6sxhugP1CQGE';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Equipments !A2:I5'
        });

        console.log("=== DATA ===");
        if (response.data.values && response.data.values.length > 0) {
            response.data.values.forEach((row, rowIndex) => {
                console.log(`Row ${rowIndex + 2}:`);
                row.forEach((col, colIndex) => {
                    console.log(`  Col ${colIndex}: ${col}`);
                });
            });
        } else {
            console.log("No data found.");
        }
    } catch (error) {
        console.error("LỖI KẾT NỐI:", error);
    }
}

listData();
