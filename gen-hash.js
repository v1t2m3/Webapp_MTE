const bcrypt = require('bcryptjs');

async function gen() {
    const adminHash = await bcrypt.hash('MTELAB@2026admin', 10);
    const resetHash = await bcrypt.hash('MTELAB#2026Reset', 10);
    console.log("ADMIN:", adminHash);
    console.log("RESET:", resetHash);
}

gen();
