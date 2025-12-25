const express = require("express");
const dotenv = require("dotenv")
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

const app = express();

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy({
        clientID : process.env.GOOGLE_CLIENT_ID,
        clientSecret : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile)
    }
    )
)

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.get("/", (req, res) => {
    res.send("<a href='/auth/google'>Login With Google</a>");
})

app.get("/auth/google", passport.authenticate("google", {scope : ["profile", "email"]}));

app.get("/callback", passport.authenticate("google", {failureRedirect: "/"}), (req, res) => {
    res.redirect("/home");
})

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect(
        "https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000/"
      )
    });
  });
});

app.get("/debug", (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user || null,
  });
});

app.get("/home", ensureAuthenticated, (req, res)=> {
    res.send("<h1>Home screen</h1>")
})


app.listen(process.env.PORT, function(){
    console.log("Server is listening on Port " + process.env.PORT);
})

