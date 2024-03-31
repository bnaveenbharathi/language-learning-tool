const bcrypt = require('bcrypt');
const collection = require('../Database/db'); 

exports.signup = async (req, res) => {
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
};

exports.login = async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
            return res.send("User not found");
        }

        const passwordMatch = await bcrypt.compare(req.body.password, check.password);
        if (passwordMatch) {
            res.redirect('/dashboard');
        } else {
            res.send('Wrong password');
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
};

