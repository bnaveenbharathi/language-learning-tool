const express = require('express');
const session = require('express-session');
const path = require('path');
const userController = require('./controllers/usercontrollers');
const httpProxy = require('http-proxy');
const lettersData = require('./views/letters.json'); 

const app = express();
const proxy = httpProxy.createProxyServer({ target: 'http://localhost:5000' }); // Add target for proxy

app.set('view engine', 'ejs'); // view engine

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure express-session
app.use(session({
    secret: '9ceee8fddd028b773b7e1f3714efe0960e5f3b7a08dfe45a8c28149e000876fc2beacc9ba657449eabd2670df75d2968e0c2556d55de0eec4c39c983aabc2c20', // Change this to your secret key
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
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: title });
});
app.get('/alphabets', (req, res) => {
    res.render('alphabets', { letters: lettersData.letters,title: title });
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

//Proxy connect
app.all('/*', (req, res) => {
    proxy.web(req, res, { target: 'http://localhost:5000' }, (err) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy Error');
    });
});

// Error handling for proxy
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error');
});

// Server connection
app.listen('8000', () => {
    console.log('Server is running on port http://localhost:8000');
});
