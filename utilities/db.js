const mongoose = require('mongoose');

module.exports.dbConnect = async () => {
    try{
        await mongoose.connect(process.env.DB_URL,{useNewUrlParser: true});
        console.log('DB Connected');
    }catch(err){
        console.log(err);
    }
}