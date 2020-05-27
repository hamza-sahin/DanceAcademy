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

        db.query('INSERT INTO users SET ? ', { first_name: first_name, last_name: last_name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.render('register', {
                    message: "User registered."
                });
            }
        });

    });
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please enter an email and password.'
            });
        }

        db.query('SELECT * FROM users WHERE email = ? ', [email], async(error, results) => {
            if (results.length == 0) {
                res.status(401).render('login', {
                    message: `Email doesn't exist.`
                });
            } else if (!(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Password is incorrect'
                });
            } else {
                const user = {
                    user_ID: results[0].user_ID,
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    email: results[0].email,
                    //isInstructor will be added
                };

                const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: ", token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
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

exports.logout = async(req, res) => {
    try {
        res.cookie('jwt', '', {
            maxAge: 0,
            overwrite: true,
        });
        res.render("index");
    } catch (error) {
        console.log(error);
    }
};