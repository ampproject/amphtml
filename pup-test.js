(async () => {
    const pti = require('puppeteer-to-istanbul')
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
  
    // Enable both JavaScript and CSS coverage
    await Promise.all([
      page.coverage.startJSCoverage(),
    ]);
    // Navigate to page
    await page.goto('http://localhost:8000/examples/everything.amp.html');
    await page.waitFor(10000)
    await page.mouse.wheel({ deltaY: -10000 })
    // Disable both JavaScript and CSS coverage
    const [jsCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
    ]);
    pti.write([...jsCoverage], { includeHostname: true , storagePath: './.nyc_output' })
    await browser.close()
  })()