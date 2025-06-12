const {Schema, model} = require('mongoose');
const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: false
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    image:{
        type: String,
        default: 'http://localhost:3000/img/user.png'
    },
    role:{
        type: String,
        default: 'user'
    },
    status:{
        type: String,
        default: 'active'
    },
    contact:{
        type: String,
        default: ''
    },
    method:{
        //To check whether login via Google or Facebook
        type: String,
        required: true
    }
},{timestamps: true})

module.exports = model('user', userSchema);