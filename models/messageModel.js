const {Schema, model} = require('mongoose');
const messageSchema = new Schema({
    senderId:{
        type: String,
        required: true
    },
    receiverId:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: 'unseen'
    }
},{timestamps: true})

module.exports = model('message', messageSchema);