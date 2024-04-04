const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const httpProxy = require('http-proxy');
const collection = require('./Database/db');
const lettersData = require('./views/letters.json');
const tamillettersData = require('./views/tamil.json');
const hindilettersData = require('./views/hindi.json');

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

// check if the user is authenticated
const authenticateUser = (req, res, next) => {
    // Check if user is logged in
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes accessible without authentication
app.get('/', (req, res) => {
    res.render('index', { title: title });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: title });
});

app.get('/login', (req, res) => {
    res.render('login', { title: title });
});

// Signup route
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        age: req.body.Age,
        email: req.body.email,
        password: req.body.password
    };

    try {
        const existing = await collection.findOne({ email: data.email });
        if (existing) {
            return res.send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 5);
        data.password = hashedPassword;

        await collection.create(data);
        res.redirect('/login');
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await collection.findOne({ email: email });
        if (!user) {
            return res.send("User not found");
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            req.session.userId = user._id; // Store user ID in session
            return res.redirect('/dashboard'); // Redirect to dashboard after successful login
        } else {
            return res.send('Wrong password');
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Protected routes (accessible only to authenticated users)
app.use(authenticateUser);

app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }
        
        // Fetch user data from the database
        const user = await collection.findOne({ _id: userId });

        // Render profile page with user data
        res.render('profile', { title: title, user: user });
    } catch (error) {
        console.error("Error rendering profile page:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: title });
});

app.get('/englishalphabets', (req, res) => {
    res.render('englishalphabets', { letters: lettersData.letters, title: title });
});

app.get('/tamilalphabets', (req, res) => {
    res.render('tamilalphabets', { letters: tamillettersData.tamilWords, title: title });
});

app.get('/hindialphabets', (req, res) => {
    res.render('hindialphabets', { letters: hindilettersData.hindiWords, title: title });
});

app.get('/alphabets', (req, res) => {
    res.render('alphabets', { title: title });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

// Update profile route
app.post('/updateProfile', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }

    const { name, email, age } = req.body;

    try {
        // Find the user by userId
        const user = await collection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update the user's profile fields
        user.name = name;
        user.email = email;
        user.age = age;

        // Save the updated user object to the database
        await user.save();

       
        req.session.user = user;

        res.send( "Profile updated successfully");
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// Change password route
app.post('/changePassword', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }

    const { currentpassword, newpassword } = req.body;

    try {
        const user = await collection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const passwordMatch = await bcrypt.compare(currentpassword, user.password);
        if (!passwordMatch) {
            return res.status(400).send('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newpassword, 5);
        await collection.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
        res.send("  Password changed successfully ");
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Proxy connect
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
