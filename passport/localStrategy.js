const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../models/User.schema');
const bcrypt        = require('bcrypt');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, 
  (email, password, done) => {
    User.findOne({ email })
    .then(foundUser => {
      if (!foundUser) {
        return done(null, false, {message: 'Incorrect email'});
      }

      if (!bcrypt.compareSync(password, foundUser.password)) {
        return done(null, false, {message: 'Incorrect password'});
      }

      return done(null, foundUser);
    })
    .catch(err => done(err));
  }
));
