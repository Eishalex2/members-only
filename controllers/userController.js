const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("../config/passport");

exports.user_signup_get = asyncHandler(async (req, res, next) => {
  res.render("signup_form", { user: false, errors: false });
});

exports.user_signup_post = [
  // Validate and sanitize
  body("first_name", "First name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name").trim().escape(),
  body("username", "Username is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom(asyncHandler(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username taken. Try something else.")
      }
    })),
  body("password", "Please enter your password")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password_conf")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password confirmation is required")
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match"),

  // Process request
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: req.body.password,
      status: "user",
    });

    if (!errors.isEmpty()) {
      res.render("signup_form", {
        user: user,
        password_conf: req.body.password_conf,
        errors: errors.array(),
      });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        } else {
          user.password = hashedPassword;
          await user.save();
          res.redirect("/user/login");
        }
      })
    }
  })
]

exports.member_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.render("member_form", { errors: false, user: req.user });
  } else {
    res.render("member_form", { errors: false, user: false });
  }
});

exports.member_post = [
  // Validate and sanitize
  body("passcode")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Passcode must be specified")
    .escape()
    .bail()
    .custom((value) => value === process.env.MEMBER_PW)
    .withMessage("Passcode incorrect."),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("member_form", {
        user: req.user,
        errors: errors.array(),
      });
      return;
    } else {
      const user = req.user;
      user.status = "member";
      await user.save();
      res.redirect("/");
    }
  }),
];

exports.admin_get = asyncHandler(async (req, res, next) => {
  res.render("admin_form", { errors: false, user: req.user });
});

exports.admin_post = [
  // Validate and sanitize
  body("passcode")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Passcode must be specified")
    .escape()
    .bail()
    .custom((value) => value === process.env.ADMIN_PW)
    .withMessage("Passcode incorrect"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("admin_form", {
        user: req.user,
        errors: errors.array()
      });
    } else {
      const user = req.user;
      user.status = "admin";
      await user.save();
      res.redirect("/");
    }
  })
];

exports.login_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.render("login_form", { errors: false, username: false });
  }
  else {
    res.redirect("/");
  }
});

exports.login_post = [
  // Validate and sanitize
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username is required")
    .bail()
    .custom(asyncHandler(async (value) => {
      const user = await User.findOne({ username: value });
      if (!user) {
        throw new Error("Username not found. Please try again.")
      }
    })),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password is required")
    .bail()
    .custom(asyncHandler(async (value, {req}) => {
      const user = await User.findOne({ username: req.body.username });
      if (user) {
        const match = await bcrypt.compare(value, user.password);
        if (!match) {
          throw new Error("Incorrect password.")
        }
      }
    })),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("login_form", {
        username: req.body.username,
        errors: errors.array(),
      });
      return;
    } else {
      next();
    }
  }),

  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
  }),
];

exports.logout_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});