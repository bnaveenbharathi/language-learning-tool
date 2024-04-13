const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const httpProxy = require('http-proxy');
const collection = require('./Database/db');
const lettersData = require('./views/custom data/letters.json');
const tamillettersData = require('./views/custom data/tamil.json');
const hindilettersData = require('./views/custom data/hindi.json');
const { analyzeText, generateAudioForLetter, generateAudioForWord, generateSplitAudioForWord } = require('./NLP/wordaudiogen');
const fs = require('fs');
const gtts = require('gtts');

const app = express();
const proxy = httpProxy.createProxyServer({ target: 'http://localhost:5000' }); // Add target for proxy

app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure express-session
app.use(session({
    secret: '9ceee8fddd028b773b7e1f3714efe0960e5f3b7a08dfe45a8c28149e000876fc2beacc9ba657449eabd2670df75d2968e0c2556d55de0eec4c39c983aabc2c20', 
    resave: false,
    saveUninitialized: false
}));

const title = "G-Fluent";
const data = JSON.parse(fs.readFileSync('views/custom data/tenses.json', 'utf8'));
const tamildata = JSON.parse(fs.readFileSync('views/custom data/tamiltenses.json', 'utf8'));
const hindidata = JSON.parse(fs.readFileSync('views/custom data/hinditense.json', 'utf8'));
// check if the user is authenticated
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

const renderUsername = async (req, res, next) => {
    try {
        const userId = req.session.userId; 
        if (!userId) {
            res.locals.username = null; 
            return next();
        }
        
        // Fetch user data 
        const user = await collection.findOne({ _id: userId });

        res.locals.username = user.name;
        next();
    } catch (error) {
        console.error("Error rendering username:", error);
        res.locals.username = null;
        next();
    }
};
app.use(renderUsername);
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


// Protected routes authenticated users)
app.use(authenticateUser);

app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }
        
        const user = await collection.findOne({ _id: userId });

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
app.get('/Vocabulary', (req, res) => {
    res.render('Vocabulary', { title: title });
});
app.get('/grammar', (req, res) => {
    res.render('grammar', { title: title });
});
app.get('/englishgrammar', (req, res) => {
    res.render('englishgrammar', { title: title });
});
app.get('/subjectverb', (req, res) => {
    res.render('subjectverb', { title: title });
});
app.get('/punctuation', (req, res) => {
    res.render('Punctuation', { title: title });
});
app.get('/tenselearning', (req, res) => {
    const tenses = Object.keys(data.tenses);
    res.render('tenselearning', { tenses ,title: title });
});
app.post('/tense', (req, res) => {
    const selectedTense = req.body.tense;
    const tenseData = data.tenses[selectedTense];
    const examples = tenseData ? tenseData.examples : [];
    res.render('tenselearning', { selectedTense, examples, tenses: Object.keys(data.tenses),title: title  });
});
app.get('/tamiltenselearning', (req, res) => {
    const tenses = Object.keys(tamildata.tenses);
    res.render('tamiltense', { tenses ,title: title });
});
app.post('/tamiltense', (req, res) => {
    const selectedTense = req.body.tense;
    const tenseData = tamildata.tenses[selectedTense];
    const examples = tenseData ? tenseData.examples : [];
    const allTenses = Object.keys(tamildata.tenses);
    res.render('tamiltense', { selectedTense, examples, tenses: allTenses, title: "Tamil Tense Learning" });
});
app.get('/hinditenselearning', (req, res) => {
    const tenses = Object.keys(hindidata.tenses);
    res.render('hinditense', { tenses ,title: title });
});
app.post('/hinditense', (req, res) => {
    const selectedTense = req.body.tense;
    const tenseData = hindidata.tenses[selectedTense];
    const examples = tenseData ? tenseData.examples : [];
    const allTenses = Object.keys(tamildata.tenses);
    res.render('hinditense', { selectedTense, examples, tenses: allTenses, title: "Tamil Tense Learning" });
});
app.get('/wordaudio', (req, res) => {
    res.render('wordaudio', { title: title });
});

app.post('/generate-audio', async (req, res) => {
    const word = req.body.word.toUpperCase();

    console.time('nlpAnalysis');

    const nlpAnalysis = analyzeText(word);

    console.timeEnd('nlpAnalysis');

    console.time('generateAudioForWord');

    const wordAudio = await generateAudioForWord(word);

    console.timeEnd('generateAudioForWord');

    console.time('generateSplitAudioForWord');

    const wordsplitAudio = await generateSplitAudioForWord(word);

    console.timeEnd('generateSplitAudioForWord');

    console.time('generateAudioForLetter');

    const letters = word.split('');
    const letterAudios = [];
    for (const letter of letters) {
        const letterAudio = await generateAudioForLetter(letter);
        letterAudios.push(letterAudio);
    }

    console.timeEnd('generateAudioForLetter');

    res.render('generateaudio', { word, wordAudio, letters, letterAudios, wordsplitAudio, nlpAnalysis,title:title });
});


app.get('/audio', async (req, res) => {
    const text = req.query.text;
    const language = req.query.language || 'en'; 
    try {
        
        if (!['en'].includes(language)) {
            throw new Error(`Language not supported: ${language}`);
        }

        const speech = new gtts(text, language);
        const audioStream = speech.stream();
        res.set({
            'Content-Type': 'audio/mp3',
            'Content-Disposition': 'inline'
        });
        audioStream.pipe(res);
    } catch (error) {
        console.error(`Error generating audio for text '${text}':`, error);
        res.status(500).send('Error generating audio');
    }
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
        const user = await collection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update the user's profile fields
        user.name = name;
        user.email = email;
        user.age = age;

        await user.save();

       
        req.session.user = user;

        res.send( "Profile updated successfully");
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/tamilwords', (req, res) => {
    
    const language = req.query.language || ''; 
    const category = req.query.category || ''; 
    const data = JSON.parse(fs.readFileSync('./views/custom data/tamilword.json', 'utf8'));

    let words = [];
    if (language && category && data[category]) {
        words = data[category].map(word => {
            return {
                word: word.word,
                meaning: word.meaning[language] || 'Meaning not available',
                usage: word.usage[language] || 'Usage not available',
                audioText: encodeURIComponent(word.word), // Encode the text to handle special characters
                language: 'en'
            };
        });
    }

    res.render('tamilwords', { words, language, category , title: title }); // Pass category variable
});
app.get('/englishwords', (req, res) => {
    // Read JSON file 
    const language = req.query.language || ''; 
    const category = req.query.category || ''; 
    const data = JSON.parse(fs.readFileSync('./views/custom data/englishword.json', 'utf8'));

    let words = [];
    if (language && category && data[category]) {
        words = data[category].map(word => {
            return {
                word: word.word,
                meaning: word.meaning[language] || 'Meaning not available',
                usage: word.usage[language] || 'Usage not available',
                audioText: encodeURIComponent(word.word), 
                language: 'en'
            };
        });
    }

    res.render('englishwords', { words, language, category ,title: title }); // Pass category variable
});

app.get('/hindiwords', (req, res) => {
    const language = req.query.language || ''; 
    const category = req.query.category || ''; 
    const data = JSON.parse(fs.readFileSync('./views/custom data/hindiword.json', 'utf8'));

    let words = [];
    if (language && category && data[category]) {
        words = data[category].map(word => {
            return {
                word: word.word,
                meaning: word.meaning[language] || 'Meaning not available',
                usage: word.usage[language] || 'Usage not available',
                audioText: encodeURIComponent(word.word), // Encode the text to handle special characters
                language: 'en'
            };
        });
    }

    res.render('hindiwords', { words, language, category , title: title }); // Pass category variable
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
app.listen('3000', () => {
    console.log('Server is running on port http://localhost:3000');
});
