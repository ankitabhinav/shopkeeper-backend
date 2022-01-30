const express = require('express');
const productRouter = express.Router();
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
const usersModel = require('../schemas/user');
const productModel = require('../schemas/product');
const sendVerificationEmail = require('../SendEmail')
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
productRouter.use(authMiddleware)

productRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (!req.body.owner || !req.body.name || !req.body.manufacturer) {
        return res.status(400).send({ success: false, status: 'owner, name, manufacturer fields are required' });
    }

    async function createProduct() {
        try {

            const newProduct = new productModel({
                owner: req.body.owner,
                name: req.body.name,
                manufacturer: req.body.manufacturer,
            });

            newProduct.save((err, product) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new product failed" });
                } else {

                    return res.status(201).send({ success: true, status: "new product created successfully", product: product });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    createProduct();


});

productRouter.patch('/', (req, res) => {

    //console.log(req.body);

    if (!req.body.name || !req.body.manufacturer || !req.body.productId) {
        return res.status(400).send({ success: false, status: 'name, manufacturer, productId fields are required' });
    }

    async function updateProduct() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            productModel.findOneAndUpdate({ owner: decoded._id, productId: req.body.productId }, {
                name: req.body.name,
                manufacturer: req.body.manufacturer,
            }, { new: true }, function (err, product) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "product update failed" });
                }
                else {
                    console.log("Updated Product : ", product);
                    return res.status(200).send({ success: true, status: "product updated successfully", product: product });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    updateProduct();


});

productRouter.delete('/', (req, res) => {

    //console.log(req.body);

    if ( !req.body.productId ) {
        return res.status(400).send(
            {
                success: false,
                status: 'productId fields are required'
            }
        );
    }

    async function deleteProduct() {
        try {
            productModel.findOneAndUpdate({ _id: req.body.productId }, {
                isActive: false
            }, { new: true }, function (err, product) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "product delete failed" });
                }
                else {
                    console.log("Updated product : ", product);
                    return res.status(200).send({ success: true, status: "product archived successfully", product: product });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteProduct();


});

productRouter.get('/', (req, res) => {

    async function getProducts() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchProducts = await productModel.find({ owner: decoded._id }).populate('owner', 'name email');
            if (!fetchProducts) {
                return res.status(400).send({ success: false, status: "no products found" });
            } else {
                return res.status(200).send({ success: true, products: fetchProducts });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getProducts();


});

productRouter.get('/:productId', (req, res) => {

    if (!req.params.productId) {
        return res.status(400).send({ success: false, status: 'productId path variaable is required' });
    }

    async function getOneProduct() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchProduct = await productModel.findOne({ owner: decoded._id, _id: req.params.productId }).populate('owner', 'name email');
            if (!fetchProduct) {
                return res.status(400).send({ success: false, status: "no product found" });
            } else {
                return res.status(200).send({ success: true, products: fetchProduct });
            }

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getOneProduct();


});

module.exports = productRouter;