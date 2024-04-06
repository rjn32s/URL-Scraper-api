const express = require('express');
const puppeteer = require('puppeteer');
const dns = require('dns');
const tls = require('tls'); // Import the tls module
const maxmind = require('maxmind');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load MaxMind ASN database
const asnDatabase = maxmind.open('./GeoLite2-ASN.mmdb');
console.log("Loaded asnLookup");

app.post('/checkUrl', async (req, res) => {
    let url = "https://example.com/";
    const domain = new URL(url).hostname;
    console.log("Domain: " + domain);

    try {
        const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
        console.log("Page loaded");
        // const pageSource = await page.content();
        // console.log("Page source: " + pageSource);
        const pageContent = await page.content();
        const textContent = extractTextContent(pageContent);
        console.log(textContent)

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
                    const options = { host: domain, port: 443, rejectUnauthorized: false  };
                    const socket = tls.connect(options, () => {
                        const certificate = socket.getPeerCertificate();
                    
                        res.json({ asn, certificate });
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