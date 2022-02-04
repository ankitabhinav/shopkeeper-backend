const express = require('express');
const variantRouter = express.Router();
//Create a usersModel model just by requiring the module
const variantModel = require('../schemas/variant');
const productModel = require('../schemas/product');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
variantRouter.use(authMiddleware)

variantRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (
        !req.body.parentProduct ||
        !req.body.barcode ||
        !req.body.size ||
        !req.body.availableQuantity ||
        !req.body.price ||
        !req.body.currency ||
        !req.body.unit
    ) {
        return res.status(400).send(
            {
                success: false,
                status: 'parentProduct, barcode, size, availableQuantity,currency, price, fields are required'
            }
        );
    }

    async function createVariant() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchProduct = await productModel.findOne({ owner: decoded._id, _id: req.body.parentProduct });
            if (!fetchProduct) {
                return res.status(400).send({ success: false, status: 'parent product not found' });
            }

            const newVariant = new variantModel({
                owner: decoded._id,
                parentProduct: req.body.parentProduct,
                barcode: req.body.barcode,
                size: req.body.size,
                availableQuantity: req.body.availableQuantity,
                price: req.body.price,
                currency: req.body.currency,
                unit: req.body.unit
            });

            newVariant.save((err, variant) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new variant failed" });
                } else {

                    return res.status(201).send({ success: true, status: "new variant created successfully", variant: variant });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    createVariant();


});

variantRouter.patch('/:variantId', (req, res) => {

    //console.log(req.body);

    if (!req.body) {
        return res.status(400).send(
            {
                success: false,
                status: 'parentProduct, barcode, size, availableQuantity,currency, price, productId,variantId etc fields can be updated'
            }
        );
    }

    async function updateVariant() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            variantModel.findOneAndUpdate({ _id: req.params.variantId, owner: decoded._id },
                req.body,
                { new: true }, function (err, variant) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ success: false, status: "variant update failed" });
                    }
                    else {
                        console.log("Updated Variant : ", variant);
                        return res.status(200).send({ success: true, status: "variant updated successfully", variant: variant });
                    }
                }
            ).populate('parentProduct');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    updateVariant();


});

variantRouter.patch('/:operation', (req, res) => {

    console.log(req.params.operation);

    if (!req.params.operation) {
        return res.status(400).send(
            {
                success: false,
                status: 'increase or decrease path variable is required'
            }
        );
    }

    if (req.params.operation !== 'increase' && req.params.operation !== 'decrease') {
        return res.status(400).send(
            {
                success: false,
                status: 'path variable cannot be other than increase or decrease'
            }
        );
    }

    if (!req.body.variantId) {
        return res.status(400).send(
            {
                success: false,
                status: 'variantId is required in body'
            }
        );
    }

    async function increaseDecreseStock() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            variantModel.findOneAndUpdate({ _id: req.body.variantId, owner: decoded._id }, {
                $inc: { availableQuantity: req.params.operation === 'increase' ? 1 : -1 }
            }, { new: true }, function (err, variant) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "variant stock update failed" });
                }
                else {
                    console.log("Updated Variant : ", variant);
                    return res.status(200).send({ success: true, status: "variant stock updated successfully", variant: variant });
                }
            }
            ).populate('parentProduct');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    increaseDecreseStock();


});

variantRouter.delete('/', (req, res) => {

    //console.log(req.body);

    if (
        !req.body.productId ||
        !req.body.variantId
    ) {
        return res.status(400).send(
            {
                success: false,
                status: 'variantId fields are required'
            }
        );
    }

    async function deleteVariant() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            variantModel.findOneAndUpdate({ _id: req.body.variantId, owner: decoded._id }, {
                isActive: false
            }, { new: true }, function (err, variant) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "variant delete failed" });
                }
                else {
                    console.log("Updated Variant : ", variant);
                    return res.status(200).send({ success: true, status: "variant archived successfully", variant: variant });
                }
            }
            ).populate('parentProduct');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteVariant();


});

//get all variants of a product by productId
variantRouter.get('/product/:productId', (req, res) => {

    if (!req.params.productId) {
        return res.status(400).send({ success: false, status: 'productId path paramater is required' });
    }

    console.log(req.params)

    async function getAllVariantsForProduct() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchVariants = await variantModel.find({ parentProduct: req.params.productId, owner: decoded._id }).populate('parentProduct');
            if (!fetchVariants) {
                return res.status(400).send({ success: false, status: "no variants found" });
            } else {
                return res.status(200).send({ success: true, variants: fetchVariants });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getAllVariantsForProduct();


});

//get a single variant by variantId
variantRouter.get('/:variantId', (req, res) => {

    if (!req.params.variantId) {
        return res.status(400).send({ success: false, status: 'variantId path parameter is required' });
    }

    async function getOneVariant() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchOneVariant = await variantModel.find({ _id: req.params.variantId, owner: decoded._id }).populate('parentProduct');
            if (!fetchOneVariant) {
                return res.status(400).send({ success: false, status: "no variant found" });
            } else {
                return res.status(200).send({ success: true, variant: fetchOneVariant });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getOneVariant();


});

module.exports = variantRouter;