const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000');

    console.log("Waiting for Next.js to hydrate...");
    await page.waitForTimeout(2000);

    console.log("Clicking the specific chat toggle button...");
    const toggleBtn = await page.waitForSelector('button.fixed.bottom-6.right-6');
    await toggleBtn.click();

    console.log("Waiting for the Chat Widget Card to appear...");
    await page.waitForSelector('text="Chat with AI"');

    console.log("Typing into the input...");
    await page.fill('input[placeholder="Say something..."]', 'Hãy mở trang danh sách xe máy và thiết bị cho tôi.');

    console.log("Submitting...");
    await page.keyboard.press('Enter');

    console.log("Waiting up to 15s to see if the AI triggers router.push()...");
    try {
        // The chat widget is programmed to call router.push('/xe-may-thiet-bi') when the tool executes
        await page.waitForURL('**/xe-may-thiet-bi', { timeout: 15000 });
        console.log("SUCCESS: URL CHANGED TO: " + page.url());
    } catch (e) {
        console.log("FAILED: URL did not change. Current URL: " + page.url());
    }

    await browser.close();
    console.log("Test finished.");
})();
