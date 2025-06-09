const cloudinary = require("cloudinary").v2;
const productModel = require("../models/productModel");
const {responseReturn} = require("../utilities/response");

class ProductController {

    previewProducts = async (req, res) => {
        try {
            // 按创建时间降序取最新 4 条
            const products = await productModel
                .find({})
                .sort({ createdAt: -1 })
                .limit(4)
                .lean();

            // 可选：计算总数，用于返回分页信息
            const total = await productModel.countDocuments({});

            return res.status(200).json({
                products,
                total,
                page: 1,
                limit: 4,
                totalPages: Math.ceil(total / 4)
            });
        } catch (err) {
            console.error("previewProducts error:", err);
            return res.status(500).json({ error: "Failed to fetch preview products" });
        }
    }

    addProduct = async (req, res) => {
        try {
            const {
                name, description, brand, stock, category,
                price, exchange, wantItem, isSecret
            } = req.body;

            // ✅ 上传所有图片到 Cloudinary
            const imageUrls = await Promise.all(
                req.files.map(file =>
                    cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, {
                        folder: 'products'
                    }).then(result => result.secure_url)
                )
            );

            const sellerId = req.id

            // ✅ 创建产品
            const newProduct = await productModel.create({
                name,
                description,
                brand,
                stock,
                category,
                price: exchange === 'true' ? 0 : price,
                exchange: exchange === 'true',
                wantItem: exchange === 'true' ? wantItem : '',
                isSecret: isSecret === 'true',
                sellerId: sellerId,
                promotionalImage: imageUrls
            });

            responseReturn(res, 200, {
                message: "Product created successfully",
                product: newProduct
            });

        } catch (error) {
            console.error("Upload error:", error);
            responseReturn(res, 500, {error: error.message});
        }
    }

    getSellerProducts = async (req, res) => {
        try {
            const sellerId = req.id; // ✅ 通过 authMiddleware 注入
            const products = await productModel.find({sellerId: sellerId}).populate('category');
            responseReturn(res, 200, {products});
        } catch (error) {
            responseReturn(res, 500, {error: error.message});
        }
    };

    getProducts = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const {search, category, sell, exchange} = req.query;


            const filter = {};

            // 🔍 模糊搜索关键词（按产品名称）
            if (search) {
                filter.name = {$regex: search, $options: 'i'};
            }

            // 🧩 筛选分类（确保是有效 ObjectId）
            if (category) {
                filter.category = category;
            }
            if (sell === 'true' && exchange === 'false') {
                filter.exchange = false;
            } else if (sell === 'false' && exchange === 'true') {
                filter.exchange = true;
            } else if (sell === 'false' && exchange === 'false') {
                filter._id = null; // 没有结果
            }

            const [products, total] = await Promise.all([
                productModel
                    .find(filter)
                    .populate('category')
                    .sort({createdAt: -1})
                    .skip(skip)
                    .limit(limit),
                productModel.countDocuments(filter)
            ]);

            responseReturn(res, 200, {
                products,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            responseReturn(res, 500, {error: error.message});
        }
    };

    deleteProduct = async (req, res) => {
        const productId = req.params._id;

        try {
            const product = await productModel.findById(productId);

            if (product) {
                await productModel.deleteOne({_id: productId});
                responseReturn(res, 200, {message: 'Product deleted successfully'});
                console.log(productId, "has been deleted successfully");
            } else {
                responseReturn(res, 404, {error: 'No matching data'});
            }
        } catch (err) {
            responseReturn(res, 500, {error: err.message});
        }
    };

    // controllers/productController.js
    getSingleProduct = async (req, res) => {
        const id = req.params.id;


        try {
            const product = await productModel.findById(id).populate("category").populate('sellerId');

            if (!product) {
                return responseReturn(res, 404, {error: "Product not found"});
            }
            responseReturn(res, 200, {product});
            console.log(id, "has been fetched successfully");
        } catch (err) {
            responseReturn(res, 500, {error: err.message});
        }
    }

    updateProduct = async (req, res) => {
        try {
            const id = req.params.id;
            const {
                name, description, brand, stock, category,
                price, exchange, wantItem, isSecret
            } = req.body;

            let promotionalImageUrls = [];

            // ✅ 保留旧图
            if (req.body.existingImages) {
                if (typeof req.body.existingImages === 'string') {
                    promotionalImageUrls.push(req.body.existingImages);
                } else {
                    promotionalImageUrls.push(...req.body.existingImages);
                }
            }

            // ✅ 上传新图
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file =>
                    new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {folder: 'products'},
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result.secure_url);
                            }
                        ).end(file.buffer);
                    })
                );

                const newImageUrls = await Promise.all(uploadPromises);
                promotionalImageUrls = promotionalImageUrls.concat(newImageUrls);
            }

            // ✅ 更新数据库
            const updatedProduct = await productModel.findByIdAndUpdate(
                id,
                {
                    name,
                    description,
                    brand,
                    stock,
                    category,
                    price: exchange === 'true' ? 0 : price,
                    exchange: exchange === 'true',
                    wantItem: exchange === 'true' ? wantItem : '',
                    isSecret: isSecret === 'true',
                    promotionalImage: promotionalImageUrls
                },
                {new: true}
            );

            if (!updatedProduct) {
                return responseReturn(res, 404, {error: 'Product not found'});
            }

            responseReturn(res, 200, {message: 'Product updated successfully', product: updatedProduct});
        } catch (error) {
            console.error('Update error:', error);
            responseReturn(res, 500, {error: error.message});
        }
    };
}

module.exports = new ProductController();