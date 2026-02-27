const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    page.on('response', async response => {
        if (response.url().includes('chat')) {
            console.log('<< HTTP', response.status(), response.url());
            try { console.log('BODY:', await response.text()); } catch (e) { }
        }
    });

    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000');

    console.log("Waiting for Next.js to hydrate...");
    await page.waitForTimeout(2000);

    console.log("Clicking the specific chat toggle button...");
    // Use a more robust selector targeting exactly the fixed button
    const toggleBtn = await page.waitForSelector('button.fixed.bottom-6.right-6');
    await toggleBtn.click();

    console.log("Waiting for the Chat Widget Card to appear...");
    // Wait for the specific card containing the chat
    await page.waitForSelector('text="Chat with AI"');

    console.log("Typing into the input...");
    await page.fill('input[placeholder="Say something..."]', 'Xin chào, bạn có thể giúp gì cho tôi?');

    console.log("Submitting...");
    await page.keyboard.press('Enter');

    console.log("Waiting up to 15s for the response text bubble...");
    try {
        await page.waitForSelector('text="AI:"', { timeout: 15000 });
    } catch (e) { /* ignore timeout here so we can dump DOM */ }

    const html = await page.innerHTML('body');
    if (html.includes('bg-muted') && html.includes('text-muted-foreground')) {
        console.log('SUCCESS: AI MESSAGE BUBBLE FOUND IN DOM');
        // Extract text content of all bubbles
        const bubbles = await page.$$('.bg-muted.text-muted-foreground');
        for (const b of bubbles) {
            console.log('AI:', await b.innerText());
        }
    } else {
        console.log('FAILED: No AI bubbles found.');
    }

    await browser.close();
    console.log("Test finished.");
})();
