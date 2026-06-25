const puppeteer = require('puppeteer')

module.exports = async (html) => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, 
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ],
    headless: true
  })
  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: ['load', 'networkidle0']
  })

  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: {
      top: '8mm',
      bottom: '8mm',
      left: '10mm',
      right: '10mm'
    }
  })

  await browser.close()
  return pdf
}