const multer = require('multer');

// 使用内存存储，让 Cloudinary 可以读取 buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 限制上传大小为 5MB/张（可选）
});

module.exports = upload;