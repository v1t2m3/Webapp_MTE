const fs = require('fs');
let key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!key) {
    const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
    const match = env.match(/GEMINI_API_KEY=(.*)/);
    if (match) key = match[1].trim();
}

if (!key) {
    console.error("NO API KEY FOUND IN .ENV");
    process.exit(1);
}

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("API ERROR:", data.error);
        } else if (data.models) {
            console.log("AVAILABLE MODELS FOR GENERATE CONTENT:");
            data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).forEach(m => {
                console.log(`- ${m.name}`);
            });
        } else {
            console.log("UNKNOWN RESPONSE:", data);
        }
    })
    .catch(err => console.error("FETCH ERROR:", err));
