const express = require('express');
const orderRouter = express.Router();
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
const usersModel = require('../schemas/user');
const productModel = require('../schemas/product');
const employeeModel = require('../schemas/employee');
const variantModel = require('../schemas/variant');
const orderModel = require('../schemas/order');
const sendVerificationEmail = require('../SendEmail')
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const employee = require('../schemas/employee');
orderRouter.use(authMiddleware)

orderRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (
        !req.body.customerName ||
        !req.body.counter ||
        !req.body.items ||
        !req.body.paymentStatus ||
        !req.body.discount
    ) {
        return res.status(400).send({ success: false, status: 'customerName, counter, items, paymentStatus, discount(%) fields are required' });
    }

    async function createOrder() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            //calculate total order amount
            let orderTotal = 0;
            req.body.items.forEach((item) => {
                item.total = item.quantity * item.price;
                orderTotal += item.total;
            })
            //calculate discount
            let withDiscount = orderTotal - (orderTotal * (req.body.discount / 100));

            //decrease variant's quantity
            req.body.items.forEach(async (item) => {
                variantModel.findOneAndUpdate({ _id: item.variantId }, { $inc: { availableQuantity: -item.quantity } }, { new: true }, (err, result) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
                    }
                })

            })

            const newOrder = new orderModel({ ...req.body, beforeDiscount: orderTotal, afterDiscount: withDiscount, owner: decoded._id });
            newOrder.save((err, order) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new order failed", error: err });
                } else {

                    return res.status(201).send({ success: true, status: "new order created successfully", order: order });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong", error: err });
        }


    }
    createOrder();


});


orderRouter.delete('/:orderId', (req, res) => {

    //console.log(req.body);

    if (!req.params.orderId) {
        return res.status(400).send(
            {
                success: false,
                status: 'orderId path parameter is required'
            }
        );
    }



    async function deleteOrder() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            orderModel.findOneAndUpdate({ _id: req.params.orderId, owner: decoded._id }, {
                isActive: false
            }, { new: true }, function (err, order) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "order delete failed" });
                }
                else {
                    console.log("Updated order : ", order);
                    return res.status(200).send({ success: true, status: "order archived successfully", order: order });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteOrder();


});

orderRouter.get('/', (req, res) => {

    async function getAllOrders() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchOrders = await orderModel.find({ owner: decoded._id }).populate('owner', 'name email');
            if (!fetchOrders) {
                return res.status(400).send({ success: false, status: "no orders found" });
            } else {
                return res.status(200).send({ success: true, orders: fetchOrders });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getAllOrders();


});

orderRouter.get('/:orderId', (req, res) => {

    if (!req.params.orderId) {
        return res.status(400).send({ success: false, status: 'orderId path variaable is required' });
    }

    async function getOneOrder() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchOneOrder = await orderModel.findOne({ owner: decoded._id, _id: req.params.orderId }).populate('owner', 'name email');
            if (!fetchOneOrder) {
                return res.status(400).send({ success: false, status: "no order found" });
            } else {
                return res.status(200).send({ success: true, order: fetchOneOrder });
            }

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getOneOrder();


});

module.exports = orderRouter;