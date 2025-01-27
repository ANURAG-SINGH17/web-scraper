const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT
const app = require('./app.js')
const http = require('http')
const server =  http.createServer(app)

server.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`)
})