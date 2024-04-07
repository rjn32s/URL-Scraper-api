const express = require("express");
const puppeteer = require("puppeteer");
const dns = require("dns");
const tls = require("tls");
const maxmind = require("maxmind");
const { URL } = require("url");
const { MongoClient } = require("mongodb"); // Import MongoClient from mongodb
const fs = require("fs");
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGODB_URI || "";

app.use(express.json());

// Database Name
const dbName = process.env.DB_NAME;

const collection_name = process.env.COLLECTION_NAME;

console.log("Database Name: " + dbName);
console.log("Collection Name: " + collection_name);
console.log("URI: " + URI);

const asnDatabase = maxmind.open("./GeoLite2-ASN.mmdb");
console.log("Loaded asnLookup");

app.post("/checkUrl", async (req, res) => {
  console.log(req.body);
  let url = req.body.url;
  const domain = new URL(url).hostname;
  console.log("Domain: " + domain);

  try {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const [response] = await Promise.all([
      page.waitForNavigation(), // Wait for navigation to complete
      page.goto(url), // Navigate to the URL provided in the request body
    ]);
    console.log("Page loaded");

    // Capture screenshot
    const screenshotPath = `./images/screenshot_${Date.now()}.png`;
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
        res.status(500).json({ error: "Failed to get IP address" });
        return;
      }

      try {
        // Perform ASN lookup for the IP address
        const asn = await asnDatabase.then((reader) => reader.get(ipAddress));

        if (asn) {
          // Retrieve SSL certificate details
          const options = {
            host: domain,
            port: 443,
            rejectUnauthorized: false,
          };
          const socket = tls.connect(options, async () => {
            const certificate = socket.getPeerCertificate();
            const responseData = {
              ipAddress,
              asn,
              certificate,
              screenshotPath,
              textContent,
              pageContent,
              sourceURL,
              destinationURL,
            };

            
            const client = new MongoClient(URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            });
            await client.connect();
            console.log("Cponnected to MongoDB");

            
            const db = client.db(dbName);

            
            const collection = db.collection(collection_name);
            await collection.insertOne(responseData);

            console.log("Extracted information saved to MongoDB");
            const jsonData = JSON.stringify(responseData, null, 2);
            const filename = `./data_json_local/extracted_data_${Date.now()}.json`;
            fs.writeFileSync(filename, jsonData);
            console.log("Extracted information saved to:", filename);

            res.json(responseData);

            // Close the connection
            await client.close();
          });
        } else {
          res
            .status(404)
            .json({ error: "ASN information not found for the IP address" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve ASN information" });
      }
    });

    await browser.close();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/createExcel", async (req, res) => {
    const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Define the headers
  const headers = ['Your Name', 'Address 1', 'Address 2', 'Email', 'Reporter Name', 'Website Rights Holder', 'Trademark', 'Trademark Country', 'Trademark URL', 'File Path', 'Content URLs', 'Additional Info', 'Signature'];

  // Define the data
  const data = [
    "Rajan Shukla",
    "123 Dummy Street, Dummy City, Dummy Country",
    "456 Dummy Avenue, Dummy Town, Dummy State",
    "rajan@example.com",
    "Rajan Reporter",
    "http://www.dummywebsite.com",
    "Rajan  Trademark",
    "India",
    "http://www.dummytrademarkurl.com",
    './images/screenshot_1712418798474.png',
    "https://www.instagram.com/dummyurl",
    "This is some additional information.",
    "Rajan Signature"
  ];

  // Add the headers and data to the worksheet
  worksheet.addRow(headers);
  worksheet.addRow(data);

  // Save the workbook to a file
  await workbook.xlsx.writeFile('Data.xlsx');
  res.send("Excel file created successfully");
})

app.get("/fill", async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('Data.xlsx');
    const worksheet = workbook.getWorksheet('Data');


  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto("https://help.instagram.com/contact/230197320740525");

  const yourName = worksheet.getCell('A2').value;
  const address1 = worksheet.getCell('B2').value;
  const address2 = worksheet.getCell('C2').value;
  const email = worksheet.getCell('D2').value;
  const reporterName = worksheet.getCell('E2').value;
  const websiteRightsHolder = worksheet.getCell('F2').value;
  const trademark = worksheet.getCell('G2').value;
  const trademarkCountry = worksheet.getCell('H2').value;
  const trademarkUrl = worksheet.getCell('I2').value;
  const filePath = worksheet.getCell('J2').value;
//   const contentType = "Other";
  const contentUrls = worksheet.getCell('K2').value;
  const additionalInfo = worksheet.getCell('L2').value;
  const signature = worksheet.getCell('M2').value;

  // Select the necessary radio buttons and checkbox
  // Replace the selectors with the actual ones
  // await page.click('selector_for_continue_with_my_trademark_report_radio_button');
  // await page.click('#666057160210034\\.0');
  await page.click('input[name="continuereport"]');
  console.log("Clicked on 'Continue with my trademark report' radio button");
  // await page.waitFor(1000); // Add a delay of 1 second
  // await page.click('selector_for_i_am_reporting_on_behalf_of_my_organization_or_client_radio_button');
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a delay of 1 second

  // await page.click('#666526966785308\\.1');
  // await page.click('#666526966785308.1');
  await page.click(
    'input[name="relationship_rightsowner"][value="I am reporting on behalf of my organization or client."]'
  );

  console.log(
    "Clicked on 'I am reporting on behalf of my organization or client' radio button"
  );
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a delay of 1 second // Add a delay of 1 second

  console.log("Clicked on 'Other' checkbox");
  await page.type('input[name="your_name"]', yourName);
  console.log("Filled 'Your Name' field with dummy value");
  const textareas = await page.$$('textarea[name="Address"]');

  // Type into the first textarea
  if (textareas[0]) {
    await textareas[0].type(address1);
    console.log("Filled the first 'Address' field with dummy value");

  }

  // Type into the second textarea
  if (textareas[1]) {
    await textareas[1].type(address2);
    console.log("Filled the second 'Address' field with dummy value");

  }
  await page.type('input[name="email"]', email);
  console.log("Filled 'Email' field with dummy value");


  await page.type('input[name="confirm_email"]', email);
console.log("Filled 'Confirm Email' field with dummy value");

await page.type('input[name="reporter_name"]', reporterName);
console.log("Filled 'Reporter Name' field with dummy value");


await page.type('input[name="websiterightsholder"]', websiteRightsHolder);
console.log("Filled 'Website Rights Holder' field with dummy value");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second


await page.type('input[name="what_is_your_trademark"]', trademark);
console.log("Filled 'What is your trademark' field with dummy value");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second

await page.select('select[name="rights_owner_country_routing"]', trademarkCountry);
console.log("Selected 'India' from the 'Where is the trademark registered?' dropdown");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second

await page.type('textarea[name="TM_URL"]', trademarkUrl);
console.log("Filled 'Trademark URL' field with dummy value");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second
// await new Promise(resolve => setTimeout(resolve, 2000)); // Add a delay of 2 seconds after file upload
 // Add a delay of 1 second
 await new Promise(resolve => setTimeout(resolve, 2000)); // Add a delay of 2 seconds before file upload
//  await page.click('input[name="Attach1[]"]'); // This should open the file chooser dialog
 console.log("Opened the file chooser dialog. Please select the file to upload.");
 await new Promise(resolve => setTimeout(resolve, 2000)); // Add a delay of 2 seconds before file upload
const [fileChooser] = await Promise.all([
  page.waitForFileChooser(),
  page.click('input[name="Attach1[]"]'), // This should open the file chooser dialog
]);
if (fs.existsSync(filePath)) {
    console.log("File exists at the provided path.");
} else {
    console.log("File does not exist at the provided path.");
}
await fileChooser.accept([filePath]);
console.log("Uploaded image to 'Attach1[]' input");
await new Promise(resolve => setTimeout(resolve, 2000)); // Add a delay of 2 seconds after file upload
//  await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for 60 seconds for you to select the file
 console.log("Assuming file has been selected.");

await page.click('input[name="content_type[]"][value="Other"]');
console.log("Checked the 'Other' checkbox in 'content_type[]'");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second

await page.type('textarea[name="content_urls"]', contentUrls);
console.log("Filled 'Content URLs' field with dummy value");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second

await page.type('textarea[name="additionalinfo"]', additionalInfo);
console.log("Filled 'Additional Info' field with dummy value");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second

await page.type('input[name="signature"]', signature);
console.log("Filled 'Signature' field with dummy value");
await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay of 1 second

  console.log("Hovered over the 'Send' button");
  // await page.waitFor(1000); // Add a delay of 1 second
  await page.evaluate(() => {
    let btns = [...document.querySelectorAll("button[type='submit']")];
    let sendButton = btns.find(btn => btn.innerText === 'Send');
    sendButton.focus();
});
console.log("Hovered over the 'Send' button");
await new Promise(resolve => setTimeout(resolve, 5000)); // Hover for 5 seconds
//   await browser.close();
  res.send("Form filled successfully");
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("Hello from the server!");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function extractTextContent(html) {
  // Use DOM manipulation or regular expressions to extract textual content
  // Here's a simple example using DOM manipulation with Cheerio
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);
  const textContent = $("body").text();
  return textContent;
}
