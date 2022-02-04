const express = require('express');
const favouriteRouter = express.Router();
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
const usersModel = require('../schemas/user');
const productModel = require('../schemas/product');
const categoryModel = require('../schemas/category');
const favouriteModel = require('../schemas/favourite');
const sendVerificationEmail = require('../SendEmail')
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
favouriteRouter.use(authMiddleware)

favouriteRouter.post('/:productId', (req, res) => {

    //console.log(req.body);

    if (!req.params.productId) {
        return res.status(400).send({ success: false, status: 'productId path parameter is required' });
    }

    async function createFavourite() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            let fetchProduct = await productModel.findOne({ owner: decoded._id, _id: req.params.productId });
            if (!fetchProduct) {
                return res.status(400).send({ success: false, status: 'product not found' });
            }

            const newFavourite = new favouriteModel({
                owner: decoded._id,
                productId: req.params.productId
            });

            newFavourite.save((err, favourite) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new favourite failed", error: err });
                } else {

                    return res.status(201).send({ success: true, status: "new favourite created successfully", favourite: favourite });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    createFavourite();


});



favouriteRouter.delete('/:favouriteId', (req, res) => {

    //console.log(req.body);

    if (!req.params.favouriteId) {
        return res.status(400).send(
            {
                success: false,
                status: 'favouriteId path variable is required'
            }
        );
    }

    async function deleteFavourite() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            favouriteModel.findOneAndDelete({ _id: req.params.favouriteId, owner:decoded._id }, function (err, favourite) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "favourite delete failed" });
                }
                else {
                    console.log("Updated favourite : ", favourite);
                    return res.status(200).send({ success: true, status: "favourite deleted successfully", favourite: favourite });
                }
            }
            )

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteFavourite();


});

favouriteRouter.get('/', (req, res) => {

    async function getAllFavourites() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchAllFavourites = await favouriteModel.find({ owner: decoded._id }).populate('owner', 'name email').populate('productId');
            if (!fetchAllFavourites) {
                return res.status(400).send({ success: false, status: "no favourites found" });
            } else {
                return res.status(200).send({ success: true, favourites: fetchAllFavourites });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getAllFavourites();


});



module.exports = favouriteRouter;