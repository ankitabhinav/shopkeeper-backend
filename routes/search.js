const express = require('express');
const searchRouter = express.Router();
//Create a usersModel model just by requiring the module
const variantModel = require('../schemas/variant');
const productModel = require('../schemas/product');
const categoryModel = require('../schemas/category');
const subCategoryModel = require('../schemas/subCategory');

const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
searchRouter.use(authMiddleware)


const searchParameters = ['barcode', 'productName',/* 'productAndVariants' */, 'categoryName', 'subCategoryName', 'tags'];

searchRouter.get('/', (req, res) => {

    if (!req.params.searchParam || !req.params.query) {
        return res.status(400).send({ success: false, status: 'search path parameters are required eg: search/barcode/123456', availableParameters: searchParameters });
    }

});

searchRouter.get('/:searchParam/:query', (req, res) => {

    if (!req.params.searchParam || !req.params.query) {
        return res.status(400).send({ success: false, status: 'search path parameters are required eg: search/barcode/123456', availableParameters: searchParameters });
    }

    console.log(req.params)

    async function getResults() {

        if(req.params.searchParam === 'barcode') {
            try {
                let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
                const result = await variantModel.findOne({ barcode: req.params.query,  owner:decoded._id }).populate('parentProduct');
                if(result) {
                    return res.status(200).send({ success: true, status: 'search results', results: result });
                } else {
                    return res.status(200).send({ success: false, status: 'search results', results: 'no results found' });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
            }
        }
        if(req.params.searchParam === 'productName') {
            try {
                let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
                const result = await productModel.find({ name: new RegExp(req.params.query, 'i'), owner: decoded._id });
                if(result) {
                    return res.status(200).send({ success: true, status: 'search results', results: result });
                } else {
                    return res.status(200).send({ success: false, status: 'search results', results: 'no results found' });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
            }
        }

       /*  if(req.params.searchParam === 'productAndVariants') {
            try {
                const result = await productModel.find({ name: new RegExp(req.params.query, 'i')  });
                if(result) {
                  
                    return res.status(200).send({ success: true, status: 'search results', results: result });
                } else {
                    return res.status(200).send({ success: false, status: 'search results', results: 'no results found' });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
            }
        } */

        if(req.params.searchParam === 'categoryName') {
            try {
                let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
                const result = await categoryModel.find({ categoryName: new RegExp(req.params.query, 'i'), owner: decoded._id });
                if(result) {
                    return res.status(200).send({ success: true, status: 'search results', results: result });
                } else {
                    return res.status(200).send({ success: false, status: 'search results', results: 'no results found' });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
            }
        }

        if(req.params.searchParam === 'subCategoryName') {
            try {
                let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
                const result = await subCategoryModel.find({ subCategoryName: new RegExp(req.params.query, 'i'), owner: decoded._id });
                if(result) {
                    return res.status(200).send({ success: true, status: 'search results', results: result });
                } else {
                    return res.status(200).send({ success: false, status: 'search results', results: 'no results found' });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
            }
        }


    }
    getResults();


});


module.exports = searchRouter;