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
## How to Hit API Endpoints

### 1. Check URL Endpoint (`POST /checkUrl`)
To check a URL, you need to send a POST request to the `/checkUrl` endpoint with a JSON body containing the URL you want to check. Here's how you can do it using cURL:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://google.com"}'
```
### 2.  Fill Form Endpoint (`GET /fill`)

To fill a form, you need to send a GET request to the /fill endpoint. This endpoint fills a specific form with dummy data extracted from an Excel file. Here's how you can do it using cURL:
```bash
curl -X GET http://localhost:3000/fill
```
