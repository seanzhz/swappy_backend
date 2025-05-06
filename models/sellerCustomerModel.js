const {Schema, model} = require('mongoose');
const sellerCustomerSchema = new Schema({
    myId:{
        type: String,
        required: true
    },
    myFriendId:{
        type: Array,
        default:[]
    }
},{timestamps: true})

module.exports = model('sellerCustomer', sellerCustomerSchema);