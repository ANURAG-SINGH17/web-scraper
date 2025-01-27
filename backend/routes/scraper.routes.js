const express =  require('express');
const { scrapeInstagramProfile, scrapeYouTubeChannel, scrapeAmazonSearch, scrapeMovieDetails,} = require('../controller/scraper.controller');
const router = express.Router();


router.post('/instagram-profile' , scrapeInstagramProfile)

router.post('/YouTubeChannel' , scrapeYouTubeChannel);

router.post('/amazon-product' , scrapeAmazonSearch);

router.post("/movie", scrapeMovieDetails);

module.exports = router;