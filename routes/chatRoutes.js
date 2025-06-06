const router = require('express').Router();
const chatController = require('../controllers/chatController');
const {authMiddleware} = require("../middlewares/authMiddleware");


router.post('/chat/customer/add-customer-friend',chatController.add_customer_friend)
router.post('/chat/customer/send-message',chatController.send_message)
router.post('/chat/customer/fetch-messages',chatController.fetch_messages)

module.exports = router;