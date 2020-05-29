const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

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

        db.query('INSERT INTO users SET ? ', { first_name: first_name, last_name: last_name, email: email, password: hashedPassword, isInstructor: 0 }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                db.query('SELECT * FROM users WHERE email = ? ', [email], async(error, results) => {
                    const user = {
                        user_ID: results[0].user_ID,
                        first_name: results[0].first_name,
                        last_name: results[0].last_name,
                        email: results[0].email,
                        isInstructor: results[0].isInstructor
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

exports.registerInstructor = (req, res) => {
    try {
        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('index');
            } else {
                db.query('UPDATE users SET isInstructor = 1 WHERE user_ID = ?', [authData.user.user_ID], async(error, results) => {

                    const instructorQuery = {
                        user_ID: authData.user.user_ID,
                        description: req.body.description,
                        num_of_students: 0
                    };

                    db.query('INSERT INTO instructors SET ? ', instructorQuery, (err, results) => {
                        if (err) console.log(err);
                    });

                    db.query('SELECT * FROM instructors WHERE user_ID = ?', instructorQuery.user_ID, (err, results) => {
                        if (err) console.log(err);
                        const user = {
                            user_ID: authData.user.user_ID,
                            first_name: authData.user.first_name,
                            last_name: authData.user.last_name,
                            email: authData.user.email,
                            isInstructor: 1,
                            instructor_ID: results[0].instructor_ID,
                            description: results[0].description,
                            num_of_students: results[0].num_of_students
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

exports.login = async(req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please enter an email and password.'
            });
        }

        db.query('SELECT * FROM users WHERE email = ? ', [email], async(error, results) => {
            if (error) console.log(error);
            if (results.length == 0) {
                res.status(401).render('login', {
                    message: `Email doesn't exist.`
                });
            } else if (!(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Password is incorrect'
                });
            } else {

                db.query('SELECT * FROM instructors WHERE user_ID = ?', results[0].user_ID, (err, results2) => {
                    if (err) {
                        console.log(err);
                    }
                    const user = {};
                    if (results2.length == 0) {
                        user.user_ID = results[0].user_ID;
                        user.first_name = results[0].first_name;
                        user.last_name = results[0].last_name;
                        user.email = results[0].email;
                        user.isInstructor = results[0].isInstructor;
                    } else {
                        user.user_ID = results[0].user_ID;
                        user.first_name = results[0].first_name;
                        user.last_name = results[0].last_name;
                        user.email = results[0].email;
                        user.isInstructor = results[0].isInstructor;
                        user.instructor_ID = results2[0].instructor_ID;
                        user.description = results2[0].description;
                        user.num_of_students = results2[0].num_of_student;
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
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createCourse = async(req, res) => {
    try {
        const title = req.body.title;
        const genre = req.body.genre;
        const price = req.body.price;
        const description = req.body.courseDescription;

        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('/');
            } else {
                console.log(req.body.courseDescription);
                const course = {
                    instructor_ID: authData.user.instructor_ID,
                    title: title,
                    genre: genre,
                    price: price,
                    rating: 0,
                    num_of_enrollments: 0,
                    description: description,
                    publish_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
                };

                db.query('INSERT INTO courses SET ? ', course, (err, results) => {
                    if (err) console.log(err);
                });
                res.redirect('/list/published');
            }
        });
    } catch (error) {
        console.log(error);
    }
};

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
    }
};

exports.updateCourse = async(req, res) => {
    try {
        const title = req.body.title;
        const genre = req.body.genre;
        const price = req.body.price;
        const description = req.body.courseDescription;

        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.render('/');
            } else {
                const course = {
                    title: title,
                    genre: genre,
                    price: price,
                    description: description,
                };

                db.query('UPDATE courses SET ? WHERE course_ID = ?', [course, req.body.course_ID], (err, results) => {
                    if (err) console.log(err);
                });
                res.redirect('/edit/course/' + req.body.course_ID);
            }
        });
    } catch (error) {
        res.redirect('/');
    }
};