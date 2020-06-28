const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mysql = require("mysql");
const fs = require('fs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const checkUser = (req, res, next) => {
    if (req.cookies.jwt) {
        res.render('index', {
            msg: "Sorry, you are not authorized for this action."
        });
    } else {
        next();
    }
};

const checkInstructor = (req, res, next) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, you are not authorized for this action."
            });
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
            res.render('home', {
                user: authData.user
            });
        }
    });
});

//INSTRUCTOR REGISTRATION PAGE
router.get('/registerInstructor', checkInstructor, (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, you are not authorized for this action."
            });
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
            res.render('index', {
                msg: "Sorry, you are not authorized for this action."
            });
        } else {
            res.render('profile', {
                user: authData.user
            });
        }
    });
});

//CHECKOUT
router.get('/checkout/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, you are not authorized for this action."
            });
        } else {
            const user = authData.user;

            db.query('SELECT * FROM orders WHERE course_ID = ? AND user_ID = ?', [req.params.course_ID, user.user_ID], (err1, order) => {
                if (order.length > 0) {
                    db.query('SELECT * FROM courses LEFT JOIN orders ON orders.course_ID = courses.course_ID WHERE courses.user_ID = ?', user.user_ID, (err2, courses) => {
                        res.redirect('/list/mycourses/')
                    });
                } else {
                    db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (err, result) => {
                        if (err) console.log(err);
                        res.render('checkout', { user, result });
                    });
                }
            });
        }
    });
});

//CREATE COURSE
router.get('/createCourse', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, you are not authorized for this action."
            });
        } else {
            if (authData.user.isInstructor == 1) {
                res.render('createCourse', { user: authData.user });
            } else {
                res.render('home', {
                    user: authData.user,
                    msg: "You need to be an instructor to create course."
                });
            }
        }
    });
});

// LIST COURSES
router.get('/list/:query', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, you are not authorized for this action."
            });
        } else {
            const user = authData.user;
            if (user.isInstructor == 0 && req.params.query == "published") {
                res.render('home', {
                    user,
                    msg: "You need to be an instructor to see your published courses."
                });
            }

            if (req.params.query == "published") {
                db.query('SELECT * FROM courses WHERE user_ID = ?', user.user_ID, (err, results) => {
                    if (err) console.log(err);
                    if (results.length < 1) {
                        res.render('list', {
                            user,
                            results,
                            msg: "You have not published any courses."
                        });
                    } else {
                        res.render('list', {
                            user,
                            results
                        });
                    }
                });

            } else if (req.params.query == "mycourses") {

                db.query('SELECT * FROM orders LEFT JOIN courses ON orders.course_ID = courses.course_ID WHERE orders.user_ID = ?', user.user_ID, (err2, courses) => {
                    console.log(courses)
                    if (courses.length < 1) {
                        res.render('list', {
                            user,
                            results: courses,
                            mycourses: 1,
                            msg: "You don't own any courses yet."
                        });

                    } else {
                        res.render('list', {
                            user,
                            results: courses,
                            mycourses: 1
                        });
                    }

                });

            } else if (req.params.query == "all") {
                db.query('SELECT * FROM courses', (err, results) => {
                    if (err) console.log(err);
                    if (results.length < 1) {
                        res.render('list', {
                            user,
                            results,
                            msg: "There are no courses published yet."
                        });
                    }
                    res.render('list', {
                        user,
                        results
                    });
                });
            }
        }
    });
});

//DISPLAY COURSE PAGE
router.get('/course/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, but you are not authorized for this action."
            });
        } else {
            const user = authData.user;
            db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (err, course) => {
                if (err) console.log(err);
                db.query('SELECT * FROM contents WHERE course_ID = ?', req.params.course_ID, (error, contents) => {
                    if (error) console.log(error);

                    if (contents.length < 1) {
                        res.render('home', {
                            user,
                            msg: "This course has no content."
                        });
                    }

                    else if (course.length < 1) {
                        res.render('home', {
                            user,
                            msg: "This course doesn't exist."
                        });
                    }

                    db.query('SELECT * FROM orders WHERE user_ID = ? AND course_ID = ?', [user.user_ID, course[0].course_ID], (err, order) => {
                        if (err) console.log(err)

                        if (order.length > 0 || course[0].user_ID == user.user_ID) {
                            res.render('course', {
                                user,
                                course: course[0],
                                contents
                            });
                        }
                        else {
                            res.render('home', {
                                user,
                                msg: "You don't own this course."
                            });
                        }
                    });
                });
            });
        }
    });
});

//DISPLAY CONTENT PAGE
router.get('/content/:content_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, but you are not authorized for this action."
            });

        } else {
            const user = authData.user;
            db.query('SELECT * FROM contents WHERE content_ID = ?', req.params.content_ID, (err3, content) => {
                if (err3) console.log(err3);
                if (content.length < 1) {
                    res.render('home', {
                        user,
                        msg: "Content doesn't exist."
                    });
                }

                db.query('SELECT * FROM orders WHERE user_ID = ? AND course_ID = ?', [user.user_ID, content[0].course_ID], (err1, order) => {
                    if (err1) console.log(err);
                    db.query('SELECT * FROM courses WHERE course_ID = ?', content[0].course_ID, (err2, course) => {
                        if (err2) console.log(err2);
                        if (order.length > 0 || user.user_ID == course[0].user_ID) {
                            res.render('content', {
                                user,
                                content: content[0],
                                course: course[0]
                            });
                        } else {
                            res.render('home', {
                                user,
                                msg: "You don't own this course."
                            });
                        }
                    });
                });
            });
        }
    });
});

// EDIT COURSE PAGE
router.get('/edit/course/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, but you are not authorized for this action."
            });

        } else {
            const user = authData.user;
            db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (err, course) => {
                if (err) console.log(err);
                if (course.length < 1) {
                    res.render('home', {
                        msg: `This course doesn't exist.`
                    });
                }

                if (course[0].user_ID == user.user_ID) {
                    db.query('SELECT * FROM contents WHERE course_ID = ?', req.params.course_ID, (error, contents) => {
                        if (error) console.log(error);
                        res.render('editCourse', {
                            user,
                            course,
                            contents
                        });
                    });
                    
                } else {
                    res.render('home', {
                        msg: "Sorry, but you are not authorized for this action."
                    });
                }
            });
        }
    });
});

//EDIT CONTENT PAGE
router.get('/edit/content/:content_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, but you are not authorized for this action."
            });
        } else {
            const user = authData.user;
            db.query('SELECT * FROM contents WHERE content_ID = ?', req.params.content_ID, (err, content) => {
                if (err) console.log(err);
                if (content.length < 1) {
                    res.render('home', {
                        msg: `This content doesn't exist.`
                    });
                }
                db.query('SELECT * FROM courses WHERE course_ID = ?', content[0].course_ID, (error, course) => {
                    if (error) console.log(error);
                    if (course[0].user_ID == user.user_ID) {
                        res.render('editContent', {
                            user,
                            content: content[0],
                            course_ID: content[0].course_ID
                        });
                    } else {
                        res.render('home', {
                            msg: "Sorry, but you are not authorized for this action."
                        });
                    }
                });
            });
        }
    });
});

//UPLOAD CONTENT
router.get('/upload/content/:course_ID', (req, res) => {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, but you are not authorized for this action."
            });
        } else {
            db.query('SELECT * FROM courses WHERE course_ID = ?', req.params.course_ID, (error, course) => {
                if (authData.user.user_ID != course[0].user_ID) {
                    res.render('home', {
                        msg: "Sorry, but you are not authorized for this action."
                    });
                } else {
                    res.render('editContent', {
                        upload: 1,
                        course_ID: course[0].course_ID,
                        user: authData.user
                    });
                }
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
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.render('index', {
                msg: "Sorry, but you are not authorized for this action."
            });
        } else {
            res.render('home', {
                user: authData.user,
                msg: "This page doesn't exist."
            });
        }
    });
});

module.exports = router;