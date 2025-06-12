const {Schema, model} = require('mongoose');
const userChatSchema = new Schema({
    myId:{
        type: String,
        required: true
    },
    myFriendId:{
        type: Array,
        default:[]
    }
},{timestamps: true})

module.exports = model('userChat', userChatSchema);