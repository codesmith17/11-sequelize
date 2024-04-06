const path = require('path');
const nodemailer = require("nodemailer");
const User = require(path.join(__dirname, '..', 'models', 'user.js'));
const bcrypt = require("bcryptjs");
const getLogin = (req, res, next) => {
    console.log("Session:", req.session.isLoggedin);
    const ejsPath = path.join(__dirname, '..', 'views', 'auth', 'login.ejs');
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render(ejsPath, {
        path: '/auth/login',
        pageTitle: 'LOGIN',
        isAuthenticated: req.session.isLoggedin,
        csrfToken: req.csrfToken(),
        errorMessage: message,
    });
};

const getSignup = (req, res, next) => {
    // console.log("Session:", req.session.isLoggedin);
    const ejsPath = path.join(__dirname, '..', 'views', 'auth', 'signup.ejs');
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render(ejsPath, {
        path: '/auth/signup',
        pageTitle: 'SIGNUP',
        isAuthenticated: req.session.isLoggedin,
        csrfToken: req.csrfToken(),
        errorMessage: message,
    });
};
const postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash("error", "EMAIL ALREADY EXISTS");
                return res.redirect("/auth/signup");
            } else {
                return bcrypt.hash(password, 12)
                    .then(hashedPassword => {
                        const user = new User({ email: email, password: hashedPassword, cart: { items: [] } });
                        return user.save()
                            .then(() => {
                                res.redirect("/auth/login");
                                nodemailer.createTestAccount((err, account) => {
                                    if (err) {
                                        console.error('Failed to create a testing account. ' + err.message);
                                        return process.exit(1);
                                    }
                                    console.log('Credentials obtained, sending message...');
                                    // Create a SMTP transporter object
                                    const transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        host: 'smtp.gmail.com',
                                        port: 587,
                                        secure: false,
                                        auth: {
                                            user: 'kanchanlatakrishna@gmail.com',
                                            pass: 'obzt ogpu yqss hfzb'
                                        }
                                    });
                                    let message = {
                                        from: 'KRISHNA test.zboncak58@ethereal.email',
                                        to: email, // Sending email to the newly registered user
                                        subject: 'Welcome to our platform!',
                                        text: `Welcome to our platform, ${email}! You have successfully signed up.`,
                                        html: `
                                        <p style="font-family: Arial, sans-serif; font-size: 16px;">
                                            Dear ${email},<br><br>
                                            <b>Welcome to our platform!</b> We are thrilled to have you on board. You have successfully signed up and are now part of our community.<br><br>
                                            We believe that your journey with us will be enriching and rewarding.<br><br>
                                            Looking forward to seeing you thrive!<br><br>
                                            Best regards,<br>
                                            😘💓💓💓💓💓💓
                                            Krishna Tripathi
                                        </p>
                                    `,
                                        attachments: [{
                                            filename: 'Krishna Tripathi.pdf',
                                            contentType: 'application/pdf'
                                        }]
                                    };
                                    transporter.sendMail(message, (err, info) => {
                                        if (err) {
                                            console.error('Error occurred while sending email. ' + err.message);
                                            return process.exit(1);
                                        }
                                        console.log('Message sent: %s', info.messageId);
                                        // Preview only available when sending through an Ethereal account
                                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                    });
                                });
                            });
                    });
            }
        })
        .catch(err => {
            console.error(err);
            // Handle error appropriately
            res.status(500).send("Internal Server Error");
        });
};


const postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash("error", "INVALID EMAIL");
                return res.redirect("/auth/login");
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedin = true;
                        return req.session.save((err) => {
                            if (err) {
                                console.error("Error saving session:", err);
                                return next(err);
                            }
                            console.log("Session saved successfully.");
                            return res.redirect("/shop");
                        });
                    }
                    req.flash("error", "INVALID EMAIL OR PASSWORD");
                    res.redirect("/auth/login");
                })
                .catch(err => {
                    console.error("Error comparing passwords:", err);
                    res.status(500).send("Internal Server Error");
                });
        })
        .catch(err => {
            console.error("Error finding user:", err);
            res.status(500).send("Internal Server Error");
        });
};


const postLogout = (req, res, next) => {
    console.log("logout done");
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return next(err);
        }
        console.log("Session destroyed successfully.");
        res.redirect("/auth/login");
    });
};

module.exports = { getLogin, postLogin, postLogout, getSignup, postSignup };