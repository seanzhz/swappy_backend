const adminModel = require('../models/adminModel');
const sellerModel = require('../models/sellerModel');
const userModel = require('../models/userModel');
const userChatModel = require('../models/userChatModel');
const sellerCustomerModel = require('../models/sellerCustomerModel');
const {responseReturn} = require("../utilities/response");
const bcrypt = require('bcrypt');
const cloudinary = require("cloudinary").v2;
const {createToken} = require("../utilities/tokenCreator");

class authControllers {

    logout = async (req, res) => {

        res.clearCookie('accessToken'); // 清除cookie的名字视你的配置而定
        return responseReturn(res, 200, {message: 'logout'});
    }


    admin_login = async (req, res) => {
        const {email, password} = req.body;

        try {
            const admin = await adminModel.findOne({
                    email: email
                }
            ).select('+password');

            if (admin) {
                const match = await bcrypt.compare(password, admin.get('password'));

                if (match) {
                    const token = await createToken({
                        id: admin.get('_id'),
                        role: admin.get('role')
                    })
                    res.cookie('accessToken', token, {
                            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            httpOnly: true
                        }
                    )
                    responseReturn(res, 200, {token, message: 'Login Successful'});
                } else {
                    responseReturn(res, 401, {error: 'Invalid Password'})
                }
            } else {
                responseReturn(res, 404, {error: 'Admin Not Found'})
            }
        } catch (err) {
            responseReturn(res, 500, {error: err.message});
        }
    }

    //Register
    seller_register = async (req, res) => {
        const {username, email, password} = req.body;
        try {
            const getUser = await sellerModel.findOne({email})
            if (getUser) {
                responseReturn(res, 404, {error: 'Email already exist'});
            } else {
                const seller = await sellerModel.create({
                    username,
                    email,
                    password: await bcrypt.hash(password, 10),
                    method: "manually",
                    shopInfo: {}
                })
                await sellerCustomerModel.create({
                    myId: seller.id
                })

                const token = await createToken({id: seller.id, role: seller.role})

                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                })

                responseReturn(res, 200, {token, message: 'Register Successful'});
            }
        } catch (err) {
            responseReturn(res, 500, {error: err.message});
        }
    }

    //Register
    user_register = async (req, res) => {
        const {username, email, password} = req.body;
        try {
            const getUser = await userModel.findOne({email})
            if (getUser) {
                responseReturn(res, 404, {error: 'Email already exist'});
            } else {
                const user = await userModel.create({
                    username,
                    email,
                    password: await bcrypt.hash(password, 10),
                    method: "manually"
                })
                await userChatModel.create({
                    myId: user.id
                })

                const token = await createToken({id: user.id, role: user.role})

                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                })

                responseReturn(res, 200, {token, message: 'Register Successfully'});
            }
        } catch (err) {
            responseReturn(res, 500, {error: err.message});
        }
    }


    //
    user_login = async (req, res) => {
        const {email, password} = req.body;

        try {
            const user = await userModel.findOne({
                    email: email
                }
            ).select('+password');

            if (user) {
                const match = await bcrypt.compare(password, user.get('password'));

                if (match) {
                    const token = await createToken({
                        id: user.get('_id'),
                        role: user.get('role')
                    })
                    res.cookie('accessToken', token, {
                            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            httpOnly: true
                        }
                    )
                    responseReturn(res, 200, {token, message: 'Login Successful'});
                } else {
                    responseReturn(res, 401, {error: 'Invalid Password'})
                }
            } else {
                responseReturn(res, 404, {error: 'Email not found'})
            }
        } catch (err) {
            responseReturn(res, 500, {error: err.message});
        }
    }


    //

    getUser = async (req, res) => {
        const {id, role} = req;
        try {
            if (role === 'admin') {
                const admin = await adminModel.findById(id)
                responseReturn(res, 200, {userInfo: admin})
            } else {
                const user = await userModel.findById(id)
                responseReturn(res, 200, {userInfo: user})
            }
        } catch (error) {
            responseReturn(res, 500, {error: error.message})
        }
    }

    updateUserAccount = async (req, res) => {
        try {
            const userId = req.params.id;
            const { newPassword,oldPassword } = req.body;

            // ✅ 获取原用户数据（用于保留原头像）
            const user = await userModel.findById(userId).select('+password');;
            if (!user) {
                return responseReturn(res, 404, {error: 'User not found'});
            }

            console.log('oldPassword:', oldPassword);
            console.log('user.password:', user.password);

            const match = await bcrypt.compare(oldPassword, user.get('password'));
            // ✅ 更新用户数据
            if(match) {
                user.password = await bcrypt.hash(newPassword, 10)
                await user.save();
                responseReturn(res, 200, {
                    message: 'Password has been updated successfully',
                    user,
                });
            }else{
                responseReturn(res, 500, {error: 'Invalid Password'});
            }


        }

        catch (error) {
            console.error('Profile update error:', error);
            responseReturn(res, 500, {error: error.message});
        }

    }

    updateUserProfile = async (req, res) => {
        try {
            const userId = req.params.id;
            const {username, contact} = req.body;

            let imageUrl = '';

            // ✅ 如果上传了新头像，则上传至 Cloudinary
            if (req.file) {
                imageUrl = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {folder: 'avatars'},
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    ).end(req.file.buffer);
                });
            }

            // ✅ 获取原用户数据（用于保留原头像）
            const user = await userModel.findById(userId);
            if (!user) {
                return responseReturn(res, 404, {error: 'User not found'});
            }

            // ✅ 如果没上传新头像，保留旧头像
            if (!imageUrl) {
                imageUrl = user.image;
            }

            // ✅ 更新用户数据
            user.username = username;
            user.contact = contact;
            user.image = imageUrl;
            await user.save();
            responseReturn(res, 200, {
                message: 'Profile updated successfully',
                user,
            });
        } catch (error) {
            console.error('Profile update error:', error);
            responseReturn(res, 500, {error: error.message});
        }
    }

}

module.exports = new authControllers;