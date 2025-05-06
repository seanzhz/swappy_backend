const jwt = require('jsonwebtoken');
const {responseReturn} = require("../utilities/response");
module.exports.authMiddleware = async (req, res, next) => {
    const {accessToken} = req.cookies;
    if(!accessToken){
       return responseReturn(res, 409, {error: "Please login first"})
    }else{
        try{
            const decoded = await jwt.verify(accessToken, process.env.SECRET);
            req.role = decoded.role;
            req.id = decoded.id;
            next();
        }catch(error){
            return responseReturn(res, 409, {error: "Unauthorized"})

        }
    }

}