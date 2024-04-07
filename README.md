# URL Scraper API

This project is a URL scraper API built with Node.js, Express, Puppeteer, and MongoDB. It allows you to send a URL and it will return various information about the URL, including the IP address, ASN information, SSL certificate details, and a screenshot of the webpage.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/en/download/)
- You have installed [MongoDB](https://www.mongodb.com/try/download/community)
- You have a Windows machine. This guide is written for Windows.
# Setting Up MongoDB Database for Node.js Application

This guide will walk you through the process of setting up a MongoDB database for this Node.js application based on the provided configuration.

## Prerequisites
- Node.js installed on your system
- MongoDB installed on your system or access to a MongoDB instance (local or cloud-based)

## Steps

### 1. Install MongoDB
If you haven't already installed MongoDB, follow the installation instructions for your operating system from the official MongoDB documentation: [MongoDB Installation](https://docs.mongodb.com/manual/installation/)

### 2. Set Up Environment Variables
Create a `.env` file in your project directory and add the following variables:

```dotenv
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=url_db
COLLECTION_NAME=responses
```

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
