# URL Scraper API

This project is a URL scraper API built with Node.js, Express, Puppeteer, and MongoDB. It allows you to send a URL and it will return various information about the URL, including the IP address, ASN information, SSL certificate details, and a screenshot of the webpage.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/en/download/)
- You have installed [MongoDB](https://www.mongodb.com/try/download/community)
- You have a Windows machine. This guide is written for Windows.

## Installing URL Scraper API

To install URL Scraper API, follow these steps:

1. Clone the repository
2. Navigate to the project directory
3. Install the dependencies with npm:

```bash
npm install
```
To run project
```bash
npm run dev
```
To hit the endpoints in the provided code, you can use the following HTTP requests:

- To hit the /checkUrl endpoint with a POST request, you should send a JSON object in the request body with the url property set to the desired URL.

 - To hit the /fill endpoint with a GET request, you can simply make a GET request to this endpoint. It will fill the instagram customer support form
- The server is running on the default port 3000, or you can use the PORT environment variable if it's set.