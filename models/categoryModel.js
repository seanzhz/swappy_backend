const {Schema, model} = require('mongoose');
const categorySchema = new Schema({
    categoryName:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    }
},{timestamps: true});

module.exports = model('category', categorySchema);