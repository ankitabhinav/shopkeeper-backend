const express = require('express');
const subCategoryRouter = express.Router();
//Create a usersModel model just by requiring the module
const variantModel = require('../schemas/variant');
const subCategoryModel = require('../schemas/subCategory');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
subCategoryRouter.use(authMiddleware)

subCategoryRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (
        !req.body.parentCategory ||
        !req.body.subCategoryName ||
        !req.body.variantName
    ) {
        return res.status(400).send(
            {
                success: false,
                status: 'parentcategory, subCategoryName, variantName fields are required'
            }
        );
    }

    async function createSubCategory() {
        try {

            const newSubCategory = new subCategoryModel({
                parentCategory: req.body.parentCategory,
                subCategoryName: req.body.subCategoryName,
                variantName: req.body.variantName
            });

            newSubCategory.save((err, subCategory) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new subCategory failed", err:err });
                } else {

                    return res.status(201).send({ success: true, status: "new subCategory created successfully", subCategory: subCategory });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    createSubCategory();


});

subCategoryRouter.patch('/:subCategoryId', (req, res) => {

    //console.log(req.body);

    if (
        !req.params.subCategoryId ||
        !req.body.subCategoryName ||
        !req.body.variantName ||
        !req.body.parentCategoryId
    ) {
        return res.status(400).send(
            {
                success: false,
                status: 'parentCategoryId, variantName, subCategoryId(path variable) fields are required'
            }
        );
    }

    async function updateSubCategory() {
        try {
            subCategoryModel.findOneAndUpdate({ _id: req.params.subCategoryId, parentCategory: req.body.parentCategoryId }, {
                subCategoryName: req.body.subCategoryName,
                variantName: req.body.variantName
            }, { new: true }, function (err, subCategory) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "subCategory update failed" });
                }
                else {
                    console.log("Updated subCategory : ", subCategory);
                    return res.status(200).send({ success: true, status: "subCategory updated successfully", subCategory: subCategory });
                }
            }
            ).populate('parentCategory');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    updateSubCategory();


});

subCategoryRouter.delete('/', (req, res) => {

    //console.log(req.body);

    if (
        !req.body.parentCategoryId ||
        !req.body.subCategoryId
    ) {
        return res.status(400).send(
            {
                success: false,
                status: 'parentCategoryId, subCategoryId fields are required'
            }
        );
    }

    async function deleteSubCategory() {
        try {
            subCategoryModel.findOneAndUpdate({ _id: req.body.subCategoryId, parentCategory: req.body.parentCategoryId }, {
                isActive: false
            }, { new: true }, function (err, subCategory) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "subCategory delete failed" });
                }
                else {
                    console.log("Updated subCategory : ", subCategory);
                    return res.status(200).send({ success: true, status: "subCategory archived successfully", subCategory: subCategory });
                }
            }
            ).populate('parentCategory');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteSubCategory();


});

subCategoryRouter.get('/:parentCategoryId', (req, res) => {

    if (!req.params.parentCategoryId) {
        return res.status(400).send({ success: false, status: 'parentCategoryId field is required' });
    }

    console.log(req.query)

    async function getAllSubCategories() {
        try {
            let fetchSubCategories = await subCategoryModel.find({ parentCategory: req.params.parentCategoryId }).populate('parentCategory');
            if (!fetchSubCategories) {
                return res.status(400).send({ success: false, status: "no subCategories found" });
            } else {
                return res.status(200).send({ success: true, subCategories: fetchSubCategories });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getAllSubCategories();


});

module.exports = subCategoryRouter;