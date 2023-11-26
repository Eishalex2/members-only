const Message = require('../models/message');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  // Get all messages
  const allMessages = await Message.find().populate("author").exec();

  res.render("index", { user: req.user, messages: allMessages });
});

exports.message_create_get = asyncHandler(async (req, res, next) => {
  res.render("message_form", { user: req.user, errors: false, message: false });
});

exports.message_create_post = [
  // Validate and sanitize
  body("title", "Please enter a message title, must be between 3 and 30 characters")
    .trim()
    .isLength({ min: 3, max: 30 })
    .escape(),
  body("content", "Message content is required, must be at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id
    });

    if (!errors.isEmpty()) {
      res.render("message_form", {
        message: message,
        user: req.user,
        errors: errors.array()
      });
    } else {
      // message.timestamp = new Date();
      await message.save();
      res.redirect("/");
    }
  })
]

exports.message_delete_post = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndDelete(req.body.messageid);
  res.redirect("/");
});