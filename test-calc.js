const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER:', msg.text()));

    console.log("Navigating to http://localhost:3000/cong-cu...");
    await page.goto('http://localhost:3000/cong-cu', { waitUntil: 'networkidle' });

    console.log("Waiting for Calculate Button...");
    // Let the animation finish
    await page.waitForTimeout(1000);

    // Find the inputs by labels
    console.log("Filling Measurement Parameters...");
    await page.getByLabel('Điện trở đo được').fill('10.5'); // R1
    await page.getByLabel('Nhiệt độ lúc đo').fill('35'); // t1
    await page.getByLabel('Hệ số vật liệu').selectOption('235'); // Cu
    await page.getByLabel('Nhiệt độ đích').fill('75'); // K2

    // Fill the equipment params
    console.log("Filling Equipment Parameters...");
    await page.getByLabel('ĐKĐBĐ Mở rộng').fill('0.05');
    await page.getByLabel('Độ phân giải').fill('0.01');

    console.log("Clicking Calculate...");
    await page.getByRole('button', { name: /Tính Toán/i }).click();

    // Verify Output
    console.log("Waiting for Results...");
    await page.waitForTimeout(1000);

    // Retrieve the text in the results block
    const r2Value = await page.locator('h4:has-text("Kết quả Điện trở") + div').innerText();
    console.log("--- RESULT ---");
    console.log("R2 Result Block:", r2Value);

    // U is inside the second span with bold text
    const uValue = await page.locator('span:has-text("±")').innerText();
    console.log("Uncertainty U Block:", uValue);

    await browser.close();
    console.log("Test Complete");
})();
