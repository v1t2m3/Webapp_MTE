const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

async function listSheets() {
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim();
            }
        });

        const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '');

        const client = new JWT({
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.get({
            spreadsheetId: '1p0z_lGfnUuMCfse_n2tc4SfT0yF-pEV6sxhugP1CQGE',
        });

        console.log("=== THÀNH CÔNG ===");
        console.log("Các Sheet hiện có:");
        response.data.sheets.forEach(sheet => {
            console.log(`- ${sheet.properties.title}`);
        });
    } catch (error) {
        console.error("LỖI KẾT NỐI:", error);
    }
}

listSheets();
