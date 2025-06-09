const router = require("express").Router();
const productController = require("../controllers/productController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

router.post(
    "/add-product",
    authMiddleware,
    upload.array("images"), // 来自前端 formData.append('images', file)
    productController.addProduct
);

router.get('/corresponding-product', authMiddleware, productController.getSellerProducts);
router.delete('/delete-product/:_id', authMiddleware, productController.deleteProduct);
router.get('/get-product/:id', authMiddleware, productController.getSingleProduct);
router.put('/update-product/:id', authMiddleware, upload.array('images'), productController.updateProduct);
router.get('/get-product', authMiddleware, productController.getProducts);

// 2. 新增：公开接口（不需要 authMiddleware），只取前 4 条商品
router.get(
    "/preview-products",
    productController.previewProducts
);

module.exports = router;