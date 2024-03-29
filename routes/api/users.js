const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Enter password with at least 6 chars').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;
    try {
        // See if user exists    
        let user = await User.findOne({ email });
        if (user) {
            //Same type of error as on line 17
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',   //size
            r: 'pg',    //rating: no nfsw
            d: 'mm'     //default image
        });
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt passwd with 

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id //same as _id on mongodb, thanks to mongoose
            }
        }
        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => { // expiresIn is optional, just like in cookies
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

})

module.exports = router;