const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mysql = require("mysql");


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

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

//HOME PAGE
router.get('/', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('home', { user: authData.user });
        }
    });
});

//INSTRUCTOR REGISTRATION PAGE
router.get('/registerInstructor', checkInstructor, (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('registerInstructor', { user: authData.user });
        }
    });
});

//REGISTER PAGE
router.get('/register', checkUser, (req, res) => {
    res.render('register');
});

//LOGIN PAGE
router.get('/login', checkUser, (req, res) => {
    res.render('login');
});

//PROFILE PAGE
router.get('/profile', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('profile', { user: authData.user });
        }
    });
});

//CHECKOUT
router.get('/checkout/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            const user = authData.user;
            db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (err, result) => {
                if (err) console.log(err);
                res.render('checkout', { user, result });
            });
        }
    });
});

//CREATE COURSE
router.get('/createCourse', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            res.render('createCourse', { user: authData.user });
        }
    });
});

// LIST COURSES
router.get('/list/:query', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.redirect('/');
        } else {
            const user = authData.user;
            if (req.params.query == "published") {
                db.query('SELECT * FROM courses WHERE instructor_ID = ?', user.instructor_ID, (err, results) => {
                    if (err) console.log(err);
                    res.render('list', { user, results });
                });

            } else if (req.params.query == "mycourses") {
                db.query('SELECT * FROM orders WHERE user_ID = ?', user.user_ID, (err, results) => {
                    if (err) console.log(err);
                    res.render('list', { user, results });
                });
            } else if (req.params.query == "all") {
                db.query('SELECT * FROM courses', (err, results) => {
                    if (err) console.log(err);
                    res.render('list', { user, results });
                });
            }
        }
    });
});

//DISPLAY COURSE PAGE
router.get('/course/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.redirect('/');
        } else {
            const user = authData.user;
            db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (err, result) => {
                if (err) console.log(err);
                res.render('course', { user, result });
            });
        }
    });
});

// EDIT COURSE PAGE
router.get('/edit/course/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.redirect('/');
        } else {
            const user = authData.user;
            db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (err, course) => {
                if (err) console.log(err);
                if (course[0].instructor_ID == user.instructor_ID) {
                    db.query('SELECT * FROM contents WHERE course_ID = ?', req.params.course_ID, (error, contents) => {
                        if (error) console.log(error);
                        res.render('editCourse', { user, course, contents });
                    });
                } else {
                    res.redirect('/');
                }
            });
        }
    });
});

//EDIT CONTENT PAGE
router.get('/edit/content/:content_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index');
        } else {
            const user = authData.user;
            db.query('SELECT * FROM contents WHERE content_ID = ?', req.params.content_ID, (err, content) => {
                if (err) console.log(err);
                db.query('SELECT * FROM courses WHERE course_ID = ?', content[0].course_ID, (error, course) => {
                    if (error) console.log(error);
                    if (course[0].instructor_ID == user.instructor_ID) {
                        res.render('editContent', { user, content });
                    } else {
                        res.redirect('/');
                    }
                });
            });
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