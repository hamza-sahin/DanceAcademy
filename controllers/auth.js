const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const publicDirectory = path.join(__dirname, './public');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

//Storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myContent');

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /mp4|png|jpg|jpeg/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Proper Filetypes Only!');
    }
}

// REGISTER AUTHORIZATION
exports.register = (req, res) => {
    const { first_name, last_name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ? ', [email], async(error, result) => {
        if (error) {
            console.log(error);
        }
        if (result.length > 0) {
            return res.render('register', {
                message: 'That email is already taken.'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: "Passwords don't match."
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        if (!(await bcrypt.compare(password, hashedPassword))) {
            console.log("Password doesn't match");
        }

        db.query('INSERT INTO users SET ? ', { first_name: first_name, last_name: last_name, email: email, password: hashedPassword, isInstructor: 0, description: null }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                db.query('SELECT * FROM users WHERE email = ? ', [email], async(error, results) => {
                    const user = {
                        user_ID: results[0].user_ID,
                        first_name: results[0].first_name,
                        last_name: results[0].last_name,
                        email: results[0].email,
                        isInstructor: results[0].isInstructor,
                        description: results[0].description
                    };

                    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });

                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.SESS_LIFETIME
                        ),
                        httpOnly: true
                    };

                    res.cookie('jwt', token, cookieOptions);
                    res.status(200).redirect("/");
                });
            }
        });
    });
};

//REGISTERING AS INSTRUCTOR
exports.registerInstructor = (req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            } else {
                db.query('UPDATE users SET isInstructor = 1, description = ? WHERE user_ID = ?', [req.body.description, authData.user.user_ID], async(error, results) => {

                    db.query('SELECT * FROM users WHERE user_ID = ?', authData.user.user_ID, (err, results) => {
                        if (err) console.log(err);
                        const user = {
                            user_ID: results[0].user_ID,
                            first_name: results[0].first_name,
                            last_name: results[0].last_name,
                            email: results[0].email,
                            isInstructor: results[0].isInstructor,
                            description: results[0].description,
                        };

                        res.cookie('jwt', '', {
                            maxAge: 0,
                            overwrite: true,
                        });

                        const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                            expiresIn: process.env.JWT_EXPIRES_IN
                        });

                        const cookieOptions = {
                            expires: new Date(
                                Date.now() + process.env.SESS_LIFETIME
                            ),
                            httpOnly: true
                        };

                        res.cookie('jwt', token, cookieOptions);
                        res.status(200).redirect("/");
                    });
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};


//LOGIN
exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please enter an email and password.'
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, result) => {
            if (error) console.log(error);
            if (result.length == 0) {
                res.status(401).render('login', {
                    message: `Email doesn't exist.`
                });
            } else if (!(await bcrypt.compare(password, result[0].password))) {
                res.status(401).render('login', {
                    message: 'Password is incorrect'
                });
            } else {
                const user = {};
                if (result[0].isInstructor == 0) {
                    user.user_ID = result[0].user_ID;
                    user.first_name = result[0].first_name;
                    user.last_name = result[0].last_name;
                    user.email = result[0].email;
                    user.isInstructor = result[0].isInstructor;
                } else {
                    user.user_ID = result[0].user_ID;
                    user.first_name = result[0].first_name;
                    user.last_name = result[0].last_name;
                    user.email = result[0].email;
                    user.isInstructor = result[0].isInstructor;
                    user.instructor_ID = result[0].instructor_ID;
                    user.description = result[0].description;
                }

                res.cookie('jwt', '', {
                    maxAge: 0,
                    overwrite: true,
                });


                const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.SESS_LIFETIME
                    ),
                    httpOnly: true
                };

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//CREATE NEW COURSE
exports.createCourse = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            } else {

                upload(req, res, (err) => {
                    const course = {
                        user_ID: authData.user.user_ID,
                        title: req.body.title,
                        genre: req.body.genre,
                        price: req.body.price,
                        description: req.body.courseDescription,
                        publish_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        thumbnail: req.file.filename,
                    };

                    db.query('INSERT INTO courses SET ? ', course, (err, results) => {
                        if (err) console.log(err);
                    });
                    res.redirect('/list/published/');
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// EDIT EXISTING COURSE
exports.updateCourse = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            } else {
                const course = {
                    course_ID: req.body.course_IDD,
                    title: req.body.title,
                    genre: req.body.genre,
                    price: req.body.price,
                    description: req.body.courseDescription,
                };

                console.log(req.body.course_IDD);

                db.query('UPDATE courses SET ? WHERE course_ID = ?', [course, course.course_ID], (err, results) => {
                    if (err) console.log(err);
                });
                res.redirect('/edit/course/' + course.course_ID);
            }
        });
    } catch (error) {
        res.redirect('/');
    }
};

//UPLOAD NEW CONTENT
exports.uploadContent = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            } else {
                upload(req, res, (err) => {
                    if (err) console.log(err);
                    else {
                        const content = {
                            course_ID: req.body.course_ID,
                            title: req.body.title,
                            description: req.body.description,
                            filename: req.file.filename,
                        };

                        db.query('INSERT INTO contents SET ?', content, (err, results) => {
                            if (err) console.log(err);
                        });

                        const redirectCoursePage = "/edit/course/" + content.course_ID;
                        res.redirect(redirectCoursePage);
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
};

// EDIT EXISTING CONTENT
exports.updateContent = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            } else {
                const content = {
                    title: req.body.title,
                    description: req.body.description,
                    course_ID: req.body.course_ID
                };
                db.query('UPDATE contents SET ? WHERE content_ID = ?', [content, req.body.content_ID], (err, results) => {
                    if (err) console.log(err);
                });

                const redirectCoursePage = "/edit/course/" + content.course_ID;
                res.redirect(redirectCoursePage);
            }
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
};

// CHECKOUT PAGE
exports.checkout = async(req, res) => {
    try {
        const order = {
            course_ID: req.body.course_ID,
            user_ID: req.body.user_ID,
            order_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        db.query('INSERT INTO orders SET ? ', order, (err, results) => {
            if (err) console.log(err);
            res.redirect('/list/mycourses');
        });
    } catch (error) {
        if (error) console.log(error);
        res.redirect('/');
    }
};

//SEARCH
exports.search = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            } else {
                const user = authData.user;
                const search = "SELECT * FROM courses WHERE title LIKE '%" + req.body.search + "%'";
                db.query(search, (err2, courses) => {
                    if (err2) console.log(err2);
                    if (courses.length < 1) {
                        res.render('list', {
                            user,
                            results: courses,
                            msg: "We couldn't find anything for that search."
                        });
                    } else {
                        res.render('list', {
                            user,
                            results: courses
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//DELETE CONTENT
exports.deleteContent = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            }
            const user = authData.user;
            const content_ID = req.body.content_ID;
            db.query("SELECT * FROM contents WHERE content_ID = ?", content_ID, (err, content) => {
                if (err) console.log(err);
                const delPath = "./public/uploads/" + content[0].filename;
                fs.unlink(delPath, (err) => {
                    if (err) console.log(err);
                });
                db.query("SELECT * FROM courses WHERE course_ID = ?", content[0].course_ID, (err2, course) => {
                    if (err2) console.log(err4);
                    db.query("DELETE FROM contents WHERE content_ID = ?", content[0].content_ID, (err4, result) => {
                        if (err4) console.log(err4);
                    });
                    db.query("SELECT * FROM contents WHERE course_ID = ?", content[0].course_ID, (err3, contents) => {
                        if (err3) console.log(err4);
                        res.render('editCourse', {
                            user,
                            course,
                            contents,
                            msg: "Content is deleted."
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
};

//DELETE COURSE
exports.deleteCourse = async(req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index', {
                    msg: "Sorry, you are not authorized for this action."
                });
            }
            const user = authData.user;
            const course_ID = req.body.course_ID;
            db.query("SELECT * FROM contents WHERE course_ID = ?", course_ID, (err, contents) => {
                if (err) console.log(err);
                for (let i = 0; i < contents.length; i++) {
                    const delPath = "./public/uploads/" + contents[i].filename;
                    fs.unlink(delPath, (err) => {
                        if (err) console.log(err);
                    });
                }

                db.query("DELETE FROM contents WHERE course_ID = ?", course_ID, (err2, result) => {
                    if (err2) console.log(err2);
                });

                db.query("SELECT * FROM courses WHERE course_ID = ?", course_ID, (err3, course) => {
                    const delPath = "./public/uploads/" + course[0].thumbnail;
                    fs.unlink(delPath, (err) => {
                        if (err) console.log(err);
                    });
                });

                db.query("DELETE FROM orders WHERE course_ID = ?", course_ID, (err2, result2) => {
                    if (err2) console.log(err2);
                });

                db.query("DELETE FROM courses WHERE course_ID = ?", course_ID, (err2, result3) => {
                    if (err2) console.log(err2);
                });

                db.query('SELECT * FROM courses WHERE user_ID = ?', user.instructor_ID, (err, results) => {
                    if (err) console.log(err);
                    res.redirect('/list/published')
                });

            });
        });
    } catch (error) {
        console.log(error);
    }
};