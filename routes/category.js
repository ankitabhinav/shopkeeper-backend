const express = require('express');
const categoryRouter = express.Router();
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
const usersModel = require('../schemas/user');
const productModel = require('../schemas/product');
const categoryModel = require('../schemas/category');
const sendVerificationEmail = require('../SendEmail')
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
categoryRouter.use(authMiddleware)

categoryRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (!req.body.owner || !req.body.categoryName) {
        return res.status(400).send({ success: false, status: 'owner, categoryName fields are required' });
    }

    async function createCategory() {
        try {

            const newCategory = new categoryModel({
                owner: req.body.owner,
                categoryName: req.body.categoryName
            });

            newCategory.save((err, category) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new category failed", error:err });
                } else {

                    return res.status(201).send({ success: true, status: "new category created successfully", category: category });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    createCategory();


});

categoryRouter.patch('/:categoryId', (req, res) => {

    //console.log(req.body);

    if (!req.body.categoryName || !req.params.categoryId) {
        return res.status(400).send({ success: false, status: 'categoryId and categoryName fields are required' });
    }

    async function updateCategory() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            categoryModel.findOneAndUpdate({ owner: decoded._id, categoryId: req.params.categoryId }, {
                categoryName: req.body.categoryName,
            }, { new: true }, function (err, category) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "category update failed" });
                }
                else {
                    console.log("Updated Category : ", category);
                    return res.status(200).send({ success: true, status: "category updated successfully", category: category });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    updateCategory();


});

categoryRouter.delete('/:categoryId', (req, res) => {

    //console.log(req.body);

    if ( !req.params.categoryId ) {
        return res.status(400).send(
            {
                success: false,
                status: 'categoryId path variable is required'
            }
        );
    }

    async function deleteCategory() {
        try {
            categoryModel.findOneAndUpdate({ _id: req.params.categoryId }, {
                isActive: false
            }, { new: true }, function (err, category) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "category delete failed" });
                }
                else {
                    console.log("Updated category : ", category);
                    return res.status(200).send({ success: true, status: "category archived successfully", category: category });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteCategory();


});

categoryRouter.get('/', (req, res) => {

    async function getCategories() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchCategories = await categoryModel.find({ owner: decoded._id }).populate('owner', 'name email');
            if (!fetchCategories) {
                return res.status(400).send({ success: false, status: "no categories found" });
            } else {
                return res.status(200).send({ success: true, categories: fetchCategories });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getCategories();


});

categoryRouter.get('/:categoryId', (req, res) => {

    if (!req.params.categoryId) {
        return res.status(400).send({ success: false, status: 'categoryId path variaable is required' });
    }

    async function getOnecategory() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchCategory = await categoryModel.findOne({ owner: decoded._id, _id: req.params.categoryId }).populate('owner', 'name email');
            if (!fetchCategory) {
                return res.status(400).send({ success: false, status: "no category found" });
            } else {
                return res.status(200).send({ success: true, category: fetchCategory });
            }

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getOnecategory();


});

module.exports = categoryRouter;