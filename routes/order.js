const express = require('express');
const orderRouter = express.Router();
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
const usersModel = require('../schemas/user');
const productModel = require('../schemas/product');
const employeeModel = require('../schemas/employee');
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
            let orderTotal = 0;
            req.body.items.forEach((item) => {
                item.total = item.quantity * item.price;
                orderTotal += item.total;
            })
            let withDiscount = orderTotal - (orderTotal * (req.body.discount / 100));

            const newOrder = new orderModel({...req.body,beforeDiscount:orderTotal, afterDiscount:withDiscount, owner:decoded._id});
            newOrder.save((err, order) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new order failed", error:err });
                } else {

                    return res.status(201).send({ success: true, status: "new order created successfully", order: order });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong", error:err });
        }


    }
    createOrder();


});

orderRouter.patch('/:employeeId', (req, res) => {

    //console.log(req.body);
    if (!req.params.employeeId) {
        return res.status(400).send({ success: false, status: 'employeeId path parameter is required' });
    }

    if (!req.body) {
        return res.status(400).send({ success: false, status: 'request body field is required' });
    }

    async function updateEmployee() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            employeeModel.findOneAndUpdate({ owner: decoded._id, employeeId: req.params.employeeId },
                req.body, { new: true }, function (err, employee) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ success: false, status: "employee update failed" });
                    }
                    else {
                        console.log("Updated employee : ", employee);
                        return res.status(200).send({ success: true, status: "employee updated successfully", employee: employee });
                    }
                }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    updateEmployee();


});

orderRouter.delete('/:employeeId', (req, res) => {

    //console.log(req.body);

    if (!req.params.employeeId) {
        return res.status(400).send(
            {
                success: false,
                status: 'employeeId path parameter is required'
            }
        );
    }



    async function deleteEmployee() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            employeeModel.findOneAndUpdate({ _id: req.params.employeeId, owner:decoded._id }, {
                isActive: false
            }, { new: true }, function (err, employee) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "employee delete failed" });
                }
                else {
                    console.log("Updated employee : ", employee);
                    return res.status(200).send({ success: true, status: "employee archived successfully", employee: employee });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deleteEmployee();


});

orderRouter.get('/', (req, res) => {

    async function getEmployees() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchEmployees = await employeeModel.find({ owner: decoded._id }).populate('owner', 'name email');
            if (!fetchEmployees) {
                return res.status(400).send({ success: false, status: "no employees found" });
            } else {
                return res.status(200).send({ success: true, employees: fetchEmployees });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getEmployees();


});

orderRouter.get('/:employeeId', (req, res) => {

    if (!req.params.employeeId) {
        return res.status(400).send({ success: false, status: 'employeeId path variaable is required' });
    }

    async function getOneEmployee() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchEmployee = await employeeModel.findOne({ owner: decoded._id, _id: req.params.employeeId }).populate('owner', 'name email');
            if (!fetchEmployee) {
                return res.status(400).send({ success: false, status: "no employee found" });
            } else {
                return res.status(200).send({ success: true, employee: fetchEmployee });
            }

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getOneEmployee();


});

module.exports = orderRouter;