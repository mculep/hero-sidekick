const http = require("http");
const express = require("express");
const morgan = require("morgan");


const PORT = 3000;
const app = express();
const server = http.createServer(app);
const logger = morgan("dev")

app.use(express.urlencoded({extended: true}));
app.use(logger);

const { Hero } = require('./models');

app.get('/list', async (req, res) => {
    const heroes = await Hero.findAll();
    console.log(JSON.stringify(heroes, null, 4))
    // res.send('this should be a list of heros')
    res.json(heroes) 
})

app.get("/", (req, res) =>{
    res.send(`<h1>Hello World!!!</h1>`)
})



server.listen(PORT, () => {
    console.log(`yeeehaaa`)
});