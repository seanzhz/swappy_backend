const {responseReturn} = require("../utilities/response");
const categoryModel = require("../models/categoryModel");
const err = require("jsonwebtoken/lib/JsonWebTokenError");

class categoryController {

    addCategory = async (req, res) => {
        const {categoryName} = req.body;
        const slug =categoryName.split(' ').join('-')

        try{
            const getCategory = await categoryModel.findOne({categoryName})
            if(getCategory){
                responseReturn(res, 404, {error: 'Category already exists'});
            }else{
                const category = await categoryModel.create({
                    categoryName,
                    slug
                })
                responseReturn(res, 200, {message: 'Category added successfully'});
            }
        }catch(err){
            responseReturn(res, 500, {error: err.message});
        }
    }

    getCategory = async (req, res) => {
        try{
            const categoryList = await categoryModel.find({})
            responseReturn(res, 200, {categoryList, message: 'Category downloaded successfully'});
        }catch(err){
            responseReturn(res, 500, {error: err.message});
        }
    }


    deleteCategory = async (req, res) => {
        const categoryId = req.params._id; // 从 URL 参数获取 id
        try {
            const category = await categoryModel.findById(categoryId);

            if (category) {
                await categoryModel.deleteOne({ _id: categoryId });
                responseReturn(res, 200, { message: 'Category deleted successfully' });
            } else {
                responseReturn(res, 404, { error: 'No matching data' });
            }
        } catch (err) {
            responseReturn(res, 500, { error: err.message });
        }
    };


}
module.exports = new categoryController;