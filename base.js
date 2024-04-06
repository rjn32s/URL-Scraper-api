const express = require('express');
const puppeteer = require('puppeteer');
const dns = require('dns');
const sslChecker = require('ssl-checker');
const maxmind = require('maxmind');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const asnLookup = maxmind.open('./GeoLite2-ASN.mmdb');
console.log("Loaded asnLookup")

app.post('/checkUrl', async (req, res) => {
    // const { url } = req.body;
    let url = "https://google.com/"
    const domain = new URL(url).hostname;
    console.log("domain: " + domain)
    const apiUrl = `https://ipinfo.io/${domain}/json`; // Define the apiUrl here
    console.log("apiUrl: " + apiUrl);
    try {
        const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
        console.log("Page loaded" )
        await page.screenshot({ path: 'screenshot.png', fullPage: true});
        const sourceUrl = page.url();
        console.log("sourceUrl: " + sourceUrl)
        const destinationUrl = await page.evaluate(() => window.location.href);
        console.log("destinationUrl: " + destinationUrl)
        let ipAddress = ''
        dns.lookup(domain, async (err, ipAddress) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to get IP address' });
                return;
            }

            try {
                // Perform ASN lookup for the IP address
                const asn = await asnLookup.get(ipAddress);

                if (asn) {
                    res.json({ asn });
                } else {
                    res.status(404).json({ error: 'ASN information not found for the IP address' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to retrieve ASN information' });
            }
        });
        await browser.close();
        
        res.json({ message: 'Done' });

        // const ipAddress = await page.evaluate(() => window.location.ipAddress);
        // const sourceUrl = await page.evaluate(() => window.sourceUrl);
        // console.log("ipAddress: " + ipAddress)
        // console.log("sourceUrl: " + sourceUrl)
        // // SSL Certificate check
        // const sslCertificate = await new Promise((resolve, reject) => {
        //     const host = new URL(url).hostname;
        //     sslChecker(host, (err, certificateData) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(certificateData);
        //         }
        //     });
        // });
        // console.log("sslCertificate: " + sslCertificate)
        // // Other checks and data extraction
        // const screenshot = await page.screenshot();
        // console.log("screenshot: " + screenshot)
        // const destinationUrl = page.url();
        // console.log("destinationUrl: " + destinationUrl)
        // const pageSource = await page.content();
        // console.log("pageSource: " + pageSource)

        // await browser.close();

        // res.json({
        //     screenshot,
        //     ipAddress,
        //     sourceUrl,
        //     destinationUrl,
        //     sslCertificate,
        //     pageSource
        // });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
