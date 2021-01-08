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

app.use(logger);

app.use(express.urlencoded({extended: true}));
const { Op } = require('sequelize')
const { Hero, Sidekick } = require('./models');
const { layout } = require("./utils");

// LIST OF HEROES

app.get('/list', async (req, res) => {
    const heroes = await Hero.findAll({
        include: Sidekick,
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

app.get('/hero/:id/sidekick', async (req, res) => {
    const { id } = req.params;
    const hero = await Hero.findByPk(id)
    const sidekicks = await Sidekick.findAll({
        where: {
            heroId: {
                [Op.eq]: null // op contains comparison operators
            }
        },
        order: [
            ['name', 'asc']
        ]
    });
    console.log(JSON.stringify(sidekicks, null, 4));
    res.render('form', {
        locals: {
            hero,
            sidekicks
        },
        ...layout
    });
});


app.post('/hero/:id/sidekick', async (req, res) => {
    const { id } = req.params;
    const { sidekickId } = req.body
    const hero = await Hero.findByPk(id);
    await hero.setSidekick(sidekickId);
    await hero.save();
    res.redirect('/list'); 
});

// HOME 

app.get("/", (req, res) => {
    res.send(`<h1>Hello World!!!</h1>`);
});


server.listen(PORT, () => {
    console.log('Yesssahhh');
});