const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
 // Bypass bot detection

const cors = require('cors');

const scraperRouter = require('./routes/scraper.routes');

puppeteer.use(StealthPlugin());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/scraper',scraperRouter)

app.get('/' , (req , res) => {
    res.send('hii ')
})

module.exports = app;