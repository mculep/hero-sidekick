## Basic setup

```sh
git init
npm init -y
echo "node_modules" >> .gitignore
```

### Install node modules

```sh
npm i --save-dev nodemon sequelize-cli
npm i express morgan express-es6-template-engine sequelize pg pg-hstore dotenv
```

### Write a hello world to make sure it works!

```sh
touch index.js
```

### Bring in all the require and other stuff needed

```js
const http = require("http");
const express = require("express");
const morgan = require("morgan");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const logger = morgan("dev");

app.use(express.urlencoded({ extended: true }));
app.use(logger);

server.listen(PORT, () => {
    console.log(`yeeehaaa`);
});
```

### Add `dev` script to `package.json`

```sh
"dev": "nodemon index.js",
```

## Sequelize setup

### make it dotenv-aware

-   if there is an example env file (usually named `dist.env`), make a copy and name it `.env`
-   `echo ".env" >> .gitignore`
-   `touch .sequelizerc` (copy and paste in your sequelize file below and save)

```sh
'use strict';

require('dotenv').config();    // don't forget to require dotenv
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'config.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
```

-   `npm install dotenv`
-   `npx sequelize init`

    -   add `require('dotenv').config();` at top of `models/index.js` & `config.js` file
    -   add a `module.exports = {` to config.js above development
    -   add code below to config.js

    ````js
    "username": process.env.DB_NAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres"

    ```js
    -   touch .env
    -   add below to .env

    ```
    ```js
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    DB_HOST=
    ````

    -   put in `process.env` variables
    -   change dialect to `'postgres'` in config/config.js

-   `touch .env`
    -   put real credentials in `.env` file
-   add `require('dotenv').config()` at top of `models/index.js`

### Generate models

-   Hero is standalone
-   Sidekick depends on hero, has a FK that points to them

```sh
npx sequelize model:generate --name Hero --attributes name:string
npx sequelize model:generate --name Sidekick --attributes 'name:string,heroId:integer'
```

#### (optional) Migrate any standalone tables

To confirm database connection is good.

```sh
npx sequelize db:migrate
```

### Set up my FK

The Sidekick points to the Hero using the Sidekick's `heroId`.
We need to tell Sequelize about this in the `models/sidekick.js`

```js
  Sidekick.init({
    name: DataTypes.STRING,
    heroId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Hero',
        key: 'id'
      }
    }
```

### Define the assoications

Always define both sides of the association!
That way, Sequelize can:

-   create "magic methods"
-   handle clean up and error checking

The associations can be described like this:

-   A Hero has one (and only one) Sidekick
-   A Sidekick belongs to one (and only one) Hero

#### `models/sidekick.js`

```js
    static associate(models) {
        Sidekick.belongsTo(models.Hero, {
            foreignKey: 'heroId'
        });
    }
```

#### `models/hero.js`

```js
    static associate(models) {
        Hero.hasOne(models.Sidekick, {
            foreignKey: 'heroId'
        });
    }
```

### Migrate the database

```sh
npx sequelize db:migrate
```

#### (optional) How to change the table name

1. undo all migrations
2. change the Hero migration (to fix the spelling of the table name)
3. tell the model the new name of the table

```sh
npx sequelize db:migrate:undo:all
```

```js
Hero.init(
    {
        name: DataTypes.STRING,
    },
    {
        sequelize,
        modelName: "Hero",
        tableName: "Heroes",
    }
);
```

### Create seed data for Heroes and Sidekicks

```sh
npx sequelize seed:generate --name add-hero-data
npx sequelize seed:generate --name add-sidekick-data
```

#### Fill out the `up` and `down` functions

When calling `queryInterface.bulkInsert()`, pass it three args:

1. the name of the table
2. an array of objects
3. an empty options object

-   for the up async

```js
module.exports = {
  up: async (queryInterface, Sequelize) => {
      return await queryInterface.bulkInsert("Heroes", [
        {
          name: "Wonder Woman",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Harley Quinn",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Spider-man",
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
    );
  },
```

-   for the down async

```js
down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('Heroes');
  }
};
```

When calling `queryInterface.bulkDelete()`, pass it one arg:

1. the name of the table

### Migrate the seed data

```sh
npx sequelize db:seed:all
```

#### HOW TO DELETE ALL DATA IN YOUR TABLES

Be very careful with this!
Never, ever, ever run these commands on your live/production site.

It will delete any data your real users have provided.

Undo all your seed data, and then redo it!

```sh
npx sequelize db:seed:undo:all
npx sequelize db:seed:all
```

## Call Sequelize Models from Controllers functions!

### List all a Heroes

-   require the Hero model
-   call Hero.findAll()
    -   console.log() the result
-   `res.send()` (or `res.json()`) that array back to the browser

#### To see a nice version of your data in `console.log()`

```js
console.log(JSON.stringify(heroes, null, 4));
```

`JSON.stringify()` will take objects and arrays and simple variables (not functions!) and make it a human-readable string.

The `null, 4` arguments are for indentation.

#### Show list in template!

-   set up the template engine in `index.js`
-   mkdir `templates`
-   mkdir `templates/partials` (with header.html and footer.html)
-   touch `utils.js` with partials "layout" object
    -   easily include header and footer when I `res.render()`
-   create a template for listing heroes `list.html`
    -   `.map().join('')` into a String

### How do I list heroes alphabetically?

```js
const heroes = await Hero.findAll({
    order: [
        // column to order by, followed the "direction"
        ["name", "desc"],
    ],
});
```

### Show a form that lists all Sidekicks

Goal: associate a specific Sidekick with a specific Hero

-   `app.get('/hero/:id/sidekick')`
-   require Sidekick from models
-   get a list of all sidekicks
-   res.render() a new template: `form.html`
-   convert that list to dropdown
    -   use the Sidekick id for the value, but show their name

### Process the form data and associate that Sidekick with that Hero

### How do I filter out Sidekicks that are already taken?

`Op` contains comparison operators.

```js
const { Op } = require("sequelize");
```
