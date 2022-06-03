import express from "express";
import { engine } from "express-handlebars";
import dotenv from 'dotenv';
import http from 'http';
import sql from './db.heroku-pg.js'
import { checkAuthenticated } from "./login.mjs";
import Session from './setup-session.mjs'

const app = express()


app.engine('.hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');
app.use(express.static('public/'));
app.use(Session);
app.use(express.urlencoded({ extended: true }));


const redirectHome = (req, res, next) => {
    console.log('redirect...', req.session)
    if (!req.session.userID) {
        res.redirect('/');
    } else {
        next();
    }
};

let returnTo = "/";

console.log(process.env.PORT)
// Εκκίνηση του εξυπηρετητή
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Συνδεθείτε στη σελίδα: http://localhost:${PORT}`);
});


app.get("/", (req, res) => {
    returnTo = req.originalUrl;
    console.log("GET / session=", req.session);
    console.log(req.query)
    res.render("index", { layout: checkAuthenticated(req) ? "main-logged-in" : "main" });
})

app.get("/signup", (req, res) => {
    console.log("GET / session=", req.session);
    res.render("signup");
})

app.get("/publish", (req, res) => {
    returnTo = req.originalUrl;
    if (checkAuthenticated(req) == false) {
        res.redirect("/login");
    }
    else {
        console.log("GET / session=", req.session);
        res.render("publish", { layout: checkAuthenticated(req) ? "main-logged-in" : "main" });
    }
})

app.get("/admin", (req, res) => {
    console.log("GET / session=", req.session);
    res.render("admin", { layout: "main-logged-in" });
})

app.get("/best-sellers", (req, res) => {
    returnTo = req.originalUrl;
    console.log("GET / session=", req.session);
    res.render("best-sellers", { layout: checkAuthenticated(req) ? "main-logged-in" : "main" });
})

app.get("/signup", (req, res) => {
    returnTo = req.originalUrl;
    console.log("GET / session=", req.session);
    res.render("signup");
})

app.get("/login", (req, res) => {
    // console.log(req);
    // console.log("GET / session=", req.session);
    res.render("login");
})

app.post('/auth', (req, res) => {
    console.log(req.body.password)
    console.log('test');
    if (req.body.password == '123') {
        req.session.loggedUserId = 1;
        // app.engine('.hbs', engine({ extname: '.hbs', defaultLayout: 'main-logged-in' }));
        res.redirect(returnTo)
    }
    else {
        res.render("login");
    }
})

app.get("/logout", (req, res) => {
    // console.log(req);
    // console.log("GET / session=", req.session);
    // app.engine('.hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
    req.session.destroy();
    res.redirect(returnTo);
})

app.get('/book/:title', (req, res) => {
    sql.query('SELECT * FROM vivlio1', (err, res) => {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log(res.rows[0]);
        }
    });
    returnTo = req.originalUrl;
    let bookURL = '/book/' + req.params.title;
    console.log(bookURL);
    res.render('book', { title: req.params.title });
})

// app.get('/book/pros-ta-astra', (req, res) => {
//     console.log('GET / session=', req.session);
//     res.render('book');
// })