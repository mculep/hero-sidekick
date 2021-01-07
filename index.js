const http = require("http");
const express = require("express");
const morgan = require("morgan");


const PORT = 3000;
const app = express();
const server = http.createServer(app);
const logger = morgan("dev")

app.use(express.urlencoded({extended: true}));
app.use(logger);


app.get("/", (req, res) =>{
    res.send(`<h1>Hello World!!!</h1>`)
})




server.listen(PORT, () => {
    console.log(`yeeehaaa`)
});