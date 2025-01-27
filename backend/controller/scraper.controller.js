const puppeteer = require("puppeteer");
const { saveToFile } = require("../utils/fileHandler");
const config = require("../config/config");
const axios = require('axios')
const cheerio = require('cheerio')

module.exports.scrapeInstagramProfile = async (req, res) => {
    const { profileUrl } = req.body;
    if (!profileUrl) {
        return res.status(400).json({ message: "Please provide a valid Instagram profile URL." });
    }

    const browser = await puppeteer.launch({ 
        headless: config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        // Set a custom user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Disable image loading to avoid CORP errors
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'image') {
                request.abort(); // Cancel image requests
            } else {
                request.continue(); // Continue other requests
            }
        });

        await page.goto(profileUrl, { timeout: config.timeout, waitUntil: 'domcontentloaded' });

        // Wait for profile header to load
        await page.waitForSelector("header section");

        // Scrape general profile data
        const profileData = await page.evaluate(() => {
            const getText = (selector) =>
                document.querySelector(selector)?.textContent.trim() || "N/A";

            const followers = getText("header section ul li:nth-child(2) span");
            const following = getText("header section ul li:nth-child(3) span");
            const posts = getText("header section ul li:nth-child(1) span");

            return {
                followers,
                following,
                posts,
            };
        });


        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Alternative delay for older Puppeteer versions
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Scrape details of the first few posts
        const postDetails = await page.evaluate(() => {
            const posts = [];
            const postElements = document.querySelectorAll("article a");

            postElements.forEach((post, index) => {
                if (index < 5) { // Scrape only the first 5 posts
                    posts.push({
                        url: post.href,
                        image: post.querySelector("img")?.src || "N/A",
                        caption: post.querySelector("img")?.alt || "N/A",
                    });
                }
            });

            return posts;
        });


        // Prepare scraped data
        const scrapedData = {
            profileUrl,
            ...profileData,
            posts: postDetails,
            scrapedAt: new Date().toISOString(),
        };

        // Send response as JSON
        return res.status(200).json({
            message: "Scraping completed successfully!",
            profileData: profileData,
            postDetails: postDetails,
        });

    } catch (error) {
        console.error("Error scraping Instagram profile:", error.message);
        return res.status(500).json({ message: "Error scraping Instagram profile", error: error.message });
    } finally {
        await browser.close();
    }
};

module.exports.scrapeYouTubeChannel = async (req, res) => {
    const { channelUrl } = req.body;

    if (!channelUrl) {
        return res.status(400).json({ message: "Channel URL is required" });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(channelUrl, { timeout: 60000, waitUntil: "networkidle2" });

        // Wait for the header section to load
        const headerSelector = "#page-header";
        await page.waitForSelector(headerSelector, { timeout: 60000 });

        // Scrape channel information
        const channelData = await page.evaluate(() => {
            const getText = (selector) =>
                document.querySelector(selector)?.textContent.trim() || "N/A";

            return {
                channelName: getText(".dynamic-text-view-model-wiz__h1"),
                subscribers: getText(
                    "yt-content-metadata-view-model > div:nth-child(2) > span:nth-child(1)"
                ),
                videoCount: getText(
                    "yt-content-metadata-view-model .yt-content-metadata-view-model-wiz__metadata-row--metadata-row-inline span:nth-child(3)"
                ),
            };
        });

        // Scroll to load videos
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let scrollHeight = 0;
                const interval = setInterval(() => {
                    window.scrollBy(0, 1000);
                    const newScrollHeight = document.documentElement.scrollHeight;
                    if (newScrollHeight === scrollHeight) {
                        clearInterval(interval);
                        resolve();
                    }
                    scrollHeight = newScrollHeight;
                }, 500);
            });
        });

        // Scrape video details
        const videoDetails = await page.evaluate(() => {
            const videos = [];
            const videoElements = document.querySelectorAll("ytd-grid-video-renderer");

            videoElements.forEach((video, index) => {
                if (index < 10) { // Limit to the first 10 videos
                    const title = video.querySelector("#video-title")?.textContent.trim() || "N/A";
                    const url = video.querySelector("#video-title")?.href || "N/A";
                    const views = video.querySelector("#metadata-line span:first-child")?.textContent.trim() || "N/A";

                    videos.push({ title, url, views });
                }
            });

            return videos;
        });

        // Send response with scraped data
        return res.status(200).json({
            message: "Scraping successful",
            data: { channelData, videoDetails },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error scraping YouTube channel",
            error: error.message,
        });
    } finally {
        await browser.close();
    }
};

module.exports.scrapeAmazonSearch = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({
            message: "Please provide a search query",
        });
    }

    try {
        // Encode the query for the URL
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.amazon.in/s?k=${encodedQuery}`;

        // Set headers to simulate a browser request
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        };

        // Fetch the HTML of the Amazon search results page
        const { data } = await axios.get(url, { headers });

        // Load the HTML into cheerio for scraping
        const $ = cheerio.load(data);

        // Array to store scraped products
        const products = [];

        // Loop through the search results and extract product details
        $('.s-main-slot .s-result-item').each((index, element) => {
            const productName = $(element).find('.a-text-normal').text().trim();
            const productPrice = $(element).find('.a-price-whole').text().trim();

            // Skip empty names or prices
            if (productName && productPrice) {
                products.push({
                    name: productName,
                    price: productPrice,
                });
            }
        });

        // Return the products object with a 200 status
        if (products.length > 0) {
            return res.status(200).json({ products });
        } else {
            return res.status(200).json({ message: 'No products found.' });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Error scraping the Amazon search results',
            details: error.message,
        });
    }



};

module.exports.scrapeMovieDetails = async (req, res) => {
    const { movieUrl } = req.body;

    // Check if movie URL is provided
    if (!movieUrl || !movieUrl.startsWith("https://www.imdb.com/title/")) {
        return res.status(400).json({
            message: "Please provide a valid IMDb movie URL."
        });
    }

    try {
        // Fetch the movie page content
        const { data } = await axios.get(movieUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        // Load the HTML with Cheerio
        const $ = cheerio.load(data);

        // Scraping movie details
        const movie = {
            title: $("h1").text().trim(),
            rating: $("span[class='sc-d541859f-1 imUuxf']").text().trim(),
            releaseDate: $("a[class='ipc-metadata-list-item__list-content-item ipc-metadata-list-item__list-content-item--link']").text().trim(),
            plot: $("span[data-testid='plot-xl']").text().trim(),
            cast: [],
        };


        // Scrape director
        $("a[class='ipc-metadata-list-item__list-content-item ipc-metadata-list-item__list-content-item--link']").each((index, element) => {
            movie.cast.push($(element).text().trim());
        });

        // // Scrape cast
        // $("span[class='sc-cd7dc4b7-7 vCane']").each((index, element) => {
        //     movie.cast.push($(element).text().trim());
        // });

        // Return movie data as JSON
        return res.status(200).json({ movie });
    } catch (error) {
        console.error("Error scraping movie details:", error.message);
        return res.status(500).json({
            message: "An error occurred while scraping the movie details.",
            error: error.message,
        });
    }
};








