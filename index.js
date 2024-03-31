const express = require('express');
const session = require('express-session');
const path = require('path');
const userController = require('./controllers/usercontrollers');

const app = express();

app.set('view engine', 'ejs'); // view engine

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure express-session
app.use(session({
    secret: 'your_secret_key', // Change this to your secret key
    resave: false,
    saveUninitialized: false
}));

const title = "G-Fluent";

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: title });
});

app.get('/profile', (req, res) => {
    res.render('profile', { title: title });
});

// Auth routes
app.get('/signup', (req, res) => {
    res.render('signup', { title: title });
});

app.get('/login', (req, res) => {
    res.render('login', { title: title });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

// Auth post
app.post('/signup', userController.signup);
app.post('/login', userController.login);

// Server connection
app.listen('8000', () => {
    console.log('Server is running on port http://localhost:8000');
});
