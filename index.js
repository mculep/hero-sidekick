const http = require("http");
const express = require("express");
const morgan = require("morgan");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const logger = morgan("dev")
const es6Renderer = require('express-es6-template-engine');
app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.use(express.urlencoded({extended: true}));
app.use(logger);

const { Hero, Sidekick } = require('./models');
const { layout } = require("./utils");

// LIST OF HEROES

app.get('/list', async (req, res) => {
    const heroes = await Hero.findAll({
        order:[
            ['name', 'asc']
        ]
    });
        
    console.log(JSON.stringify(heroes, null, 4))
    // res.send('this should be a list of heros')
    // res.json(heroes) 
    res.render('list', {
        locals:{
            heroes,
        },
         ...layout
    })
})

// LIST OF SIDEKICKS

app.get('/hero/:id/sidekick', async (req, res) =>{
    const { id } = req.params;
    const hero = await Hero.findByPk(id)
    const sidekicks = await Sidekick.findAll({
        order: [
            ['name', 'asc']
        ]
    })
    console.log(JSON.stringify(sidekicks, null, 4));
    res.render('form', {
        locals: {
            hero,
            sidekicks
        },
        ...layout
    })
});


app.get("/", (req, res) =>{
    res.send(`<h1>Hello World!!!</h1>`)
})



server.listen(PORT, () => {
    console.log(`yeeehaaa`)
});