const express = require('express');
const puppeteer = require('puppeteer');
const dns = require('dns');
const tls = require('tls');
const maxmind = require('maxmind');
const { URL } = require('url');
const fs = require('fs'); // Import the fs module for file operations

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load MaxMind ASN database
const asnDatabase = maxmind.open('./GeoLite2-ASN.mmdb');
console.log("Loaded asnLookup");

app.post('/checkUrl', async (req, res) => {
    console.log(req.body);
    let url = req.body.url;
    const domain = new URL(url).hostname;
    console.log("Domain: " + domain);

    try {
        const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const [response] = await Promise.all([
            page.waitForNavigation(), // Wait for navigation to complete
            page.goto(url), // Navigate to the URL provided in the request body
        ]);
        console.log("Page loaded");

        // Capture screenshot
        const screenshotPath = `screenshot_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log("Screenshot captured:", screenshotPath);

        // Get source and destination URLs
        const sourceURL = response.url();
        const destinationURL = page.url();
        console.log("Source URL:", sourceURL);
        console.log("Destination URL:", destinationURL);

        // Extract text content
        const pageContent = await page.content();
        const textContent = extractTextContent(pageContent);
        // console.log("Text content extracted:", textContent);

        // DNS lookup to get IP address
        dns.lookup(domain, async (err, ipAddress) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to get IP address' });
                return;
            }

            try {
                // Perform ASN lookup for the IP address
                const asn = await asnDatabase.then(reader => reader.get(ipAddress));

                if (asn) {
                    // Retrieve SSL certificate details
                    const options = { host: domain, port: 443, rejectUnauthorized: false };
                    const socket = tls.connect(options, async () => {
                        const certificate = socket.getPeerCertificate();
                        const responseData = { ipAddress,asn, certificate, screenshotPath, textContent, pageContent, sourceURL, destinationURL };

                        // Save extracted information to JSON file
                        const jsonData = JSON.stringify(responseData, null, 2);
                        const filename = `extracted_data_${Date.now()}.json`;
                        fs.writeFileSync(filename, jsonData);
                        console.log("Extracted information saved to:", filename);

                        res.json(responseData);
                    });
                } else {
                    res.status(404).json({ error: 'ASN information not found for the IP address' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to retrieve ASN information' });
            }
        });

        await browser.close();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.post('/', (req, res) => {
    console.log(req.body)
    res.send('Hello from the server!');
    
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function extractTextContent(html) {
    // Use DOM manipulation or regular expressions to extract textual content
    // Here's a simple example using DOM manipulation with Cheerio
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const textContent = $('body').text();
    return textContent;
}
