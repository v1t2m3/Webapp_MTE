const bcrypt = require('bcryptjs');

async function test() {
    const hash = await bcrypt.hash('123456', 10);
    console.log("New Hash for 123456:", hash);
    const match = await bcrypt.compare('123456', hash);
    console.log("Match test:", match);

    // Test the existing hash
    const oldHash = "$2a$10$wT3yEwX/r1F8eCwv./hQwe2x2R/nRyB2/W7FqF6pXl/XoK0.x8PjK";
    const oldMatch = await bcrypt.compare('123456', oldHash);
    console.log("Old Match test:", oldMatch);
}

test();
