const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');

const scraperRouter = require('./routes/scraper.routes');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/scraper',scraperRouter)

app.get('/' , (req , res) => {
    res.send('hii ')
})

module.exports = app;