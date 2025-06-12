const router = require('express').Router();
const authController = require('../controllers/authControllers');
const {authMiddleware} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");
const productController = require("../controllers/productController");

router.post('/admin-login',authController.admin_login)
router.get('/get-user',authMiddleware, authController.getUser)
router.post('/user-register',authController.user_register)
router.post('/user-login',authController.user_login)

// logout API endpoint
router.post('/logout', authMiddleware, authController.logout);

router.put('/update-user/:id', authMiddleware, upload.single('image'), authController.updateUserProfile);
router.put('/update-account/:id', authMiddleware, authController.updateUserAccount);

module.exports = router;