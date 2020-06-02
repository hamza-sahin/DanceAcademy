const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env' });

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

app.set('view engine', 'ejs');

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//Parse URL's
app.use(express.urlencoded({ extended: false }));
//Parse Json's
app.use(express.json());
app.use(cookieParser());

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("MYSQL Database Connected!");
    }
});

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("Server started on Port 5000");
});