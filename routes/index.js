const express = require('express');
const router = express.Router();

const user_controller = require("../controllers/userController");
const message_controller = require("../controllers/messageController");

// Display all messages

/* GET home page. */
router.get("/", message_controller.index);

/// User routes ///

router.get("/user/signup", user_controller.user_signup_get);

router.post("/user/signup", user_controller.user_signup_post);

router.get("/user/login", user_controller.login_get);

router.post("/user/login", user_controller.login_post);

router.get("/user/member-test", user_controller.member_get);

router.post("/user/member-test", user_controller.member_post);

router.get("/user/admin-test", user_controller.admin_get);

router.post("/user/admin-test", user_controller.admin_post);

router.get("/user/logout", user_controller.logout_get)

/// Message routes ///

router.get("/message/create", message_controller.message_create_get);

router.post("/message/create", message_controller.message_create_post);

// Delete route, may change this later
router.post("/message/delete", message_controller.message_delete_post);

module.exports = router;
