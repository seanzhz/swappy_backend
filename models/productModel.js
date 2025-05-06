const { Schema, model } = require('mongoose');

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    brand: {
        type: String
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    price: {
        type: Number
    },
    exchange: {
        type: Boolean,
        default: false,
        required: true
    },
    wantItem: {
        type: String
    },
    isSecret: {
        type: Boolean,
        default: false,
        required: true
    },
    promotionalImage: [
        {
            type: String
        }
    ],
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'seller',
        required: true
    }
}, { timestamps: true });

module.exports = model('product', productSchema);