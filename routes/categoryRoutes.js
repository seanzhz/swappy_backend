const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const {authMiddleware} = require('../middlewares/authMiddleware');

router.post('/add-category', authMiddleware, categoryController.addCategory)
router.get('/get-category', authMiddleware, categoryController.getCategory)
router.delete('/delete-category/:_id', authMiddleware, categoryController.deleteCategory)



module.exports = router;