const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const redirectHome = (req, res, next) => {
    if (req.cookies.jwt) {
        res.redirect('/');
    } else {
        next();
    }
};

const redirectLogin = (req, res, next) => {
    if (!(req.cookie.jwt.user_ID)) {
        res.redirect('login');
    } else {
        next();
    }
};

router.get('/', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('dashboard', { user_ID: authData.user_ID });
        }
    });
});

router.get('/register', redirectHome, (req, res) => {
    res.render('register');
});

router.get('/login', redirectHome, (req, res) => {
    res.render('login');
});

router.get('*', (req, res) => {
    res.send('Ooops! Sorry, but this page doesn`t exist :(');
});

module.exports = router;