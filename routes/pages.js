const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const checkUser = (req, res, next) => {
    if (req.cookies.jwt) {
        res.redirect('/');
    } else {
        next();
    }
};

const checkInstructor = (req, res, next) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.redirect('/');
        } else {
            if (authData.user.isInstructor == 1) {
                res.redirect('/');
            } else {
                next();
            }
        }
    });
};

router.get('/', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('home', { user: authData.user });
        }
    });
});

router.get('/registerInstructor', checkInstructor, (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('registerInstructor', { user: authData.user });
        }
    });
});

router.get('/register', checkUser, (req, res) => {
    res.render('register');
});

router.get('/login', checkUser, (req, res) => {
    res.render('login');
});

router.get('/profile', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('profile', { user: authData.user });
        }
    });
});

router.get('/upload', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('upload', { user: authData.user });
        }
    });
});

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', {
        maxAge: 0,
        overwrite: true,
    });
    res.render('index');
});

router.get('*', (req, res) => {
    res.send('Ooops! Sorry, but this page doesn`t exist :(');
});

module.exports = router;