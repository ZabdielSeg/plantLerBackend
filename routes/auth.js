const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/User.schema");
const uploader = require('../config/cloudinary.config');

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const isLoggedOut = require("../middlewares/isLoggedOut");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.post("/signup", isLoggedOut, (req, res, next) => {
  const { username, password, isSeller, description, email, whatsAppNumber, imageUrl } = req.body;

  let theDescription = !description ? '' : description;

  if (!username || !password || !email) {
    res.status(400).json({ message: 'Provide username, password and email' });
    return;
  }

  if (password.length < 7) {
    res.status(400).json({ message: 'Please make your password at least 8 characters long for security purposes.' });
    return;
  }

  let theWhatsAppNumber = !whatsAppNumber ? '' : whatsAppNumber;

  User.findOne({ email }, "email", (err, user) => {
    if (err) {
      res.status(500).json({ message: "Email check went bad. 1" });
      return;
    }

    if (user) {
      res.status(500).send({ message: "The email already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashPass,
      isSeller,
      description: theDescription,
      plants: [],
      whatsAppNumber: theWhatsAppNumber,
      imageUrl
    });

    newUser.save()
      .then(aNewUser => {
        req.login(aNewUser, (err) => {
          if (err) {
            res.status(500).json({ message: 'Login after signup went bad.' });
            return;
          }
          // Send the user's information to the frontend
          const { username, email, isSeller, plants, description, whatsAppNumber, imageUrl, _id } = aNewUser;
          const theUser = { username, email, isSeller, plants, description, whatsAppNumber, imageUrl, _id };
          res.status(200).json(theUser);
          console.log(theUser);
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
        next(err);
      });
  });
});

router.post("/login", isLoggedOut, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log(err);
      return res.status(400).json(err);
    }
    if (!user) return res.status(400).json({ message: info.message });
    else {
      req.logIn(user, (err) => {
        if (err) res.status(400).json(err);
        const { username, email, isSeller, plants, description, whatsAppNumber, imageUrl, _id } = user;
        const theUser = { username, email, isSeller, plants, description, whatsAppNumber, imageUrl, _id };
        res.status(200).json(theUser);
        console.log(req.user);
      });
    }
  })(req, res, next);
});


router.get('/loggedin', (req, res, next) => {
  if (req.user) {
    const { username, email, isSeller, plants, description, whatsAppNumber, imageUrl, _id } = req.user;
    const theUser = { username, email, isSeller, plants, description, whatsAppNumber, imageUrl, _id };
    res.status(200).json(theUser);
  }
  res.status(403).json({ message: 'No user loggedin' });
});

router.post("/logout", isLoggedIn, (req, res) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

module.exports = router;