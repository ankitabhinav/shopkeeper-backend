const express = require('express');
const posCounterRouter = express.Router();
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
const usersModel = require('../schemas/user');
const productModel = require('../schemas/product');
const posCounterModel = require('../schemas/posCounter');
const sendVerificationEmail = require('../SendEmail')
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
posCounterRouter.use(authMiddleware)

posCounterRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (!req.body.owner || !req.body.counterName || !req.body.assignedTo) {
        return res.status(400).send({ success: false, status: 'owner, counterName, assignedTo fields are required' });
    }

    async function createPosCounter() {
        try {

            const newPosCounter = new posCounterModel({
                owner: req.body.owner,
                counterName: req.body.counterName,
                assignedTo: req.body.assignedTo,
            });

            newPosCounter.save((err, posCounter) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ success: false, status: "add new posCounter failed",error:err });
                } else {

                    return res.status(201).send({ success: true, status: "new posCounter created successfully", posCounter: posCounter });
                }
            });


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    createPosCounter();


});

posCounterRouter.patch('/:posCounterId', (req, res) => {

    //console.log(req.body);

    if (!req.params.posCounterId) {
        return res.status(400).send({ success: false, status: 'posCounterId path parameter fields are required' });
    }

    async function updatePosCounter() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            posCounterModel.findOneAndUpdate({ owner: decoded._id, _id: req.params.posCounterId }, req.body, 
                { new: true }, function (err, posCounter) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "posCounter update failed" });
                }
                else {
                    console.log("Updated posCounter : ", posCounter);
                    return res.status(200).send({ success: true, status: "posCounter updated successfully", posCounter: posCounter });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    updatePosCounter();


});

posCounterRouter.delete('/:posCounterId', (req, res) => {

    //console.log(req.body);

    if (!req.params.posCounterId) {
        return res.status(400).send(
            {
                success: false,
                status: 'posCounterId path parameter is required'
            }
        );
    }



    async function deletePosCounter() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);

            posCounterModel.findOneAndUpdate({ _id: req.params.posCounterId, owner:decoded._id }, {
                isActive: false
            }, { new: true }, function (err, posCounter) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ success: false, status: "posCounter delete failed", error: err });
                }
                else {
                    console.log("Updated posCounter : ", posCounter);
                    return res.status(200).send({ success: true, status: "posCounter archived successfully", posCounter: posCounter });
                }
            }
            ).populate('owner', 'name email');

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    deletePosCounter();


});

posCounterRouter.get('/', (req, res) => {

    async function getPosCounters() {
        try {

            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchPosCounters = await posCounterModel.find({ owner: decoded._id }).populate('owner', 'name email').populate('assignedTo');
            if (!fetchPosCounters) {
                return res.status(400).send({ success: false, status: "no products found" });
            } else {
                return res.status(200).send({ success: true, posCounters: fetchPosCounters });
            }


        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getPosCounters();


});

posCounterRouter.get('/:posCounterId', (req, res) => {

    if (!req.params.posCounterId) {
        return res.status(400).send({ success: false, status: 'posCounterId path variaable is required' });
    }

    async function getOnePosCounter() {
        try {
            let decoded = await jwt.verify(req.auth_token, process.env.SHOPKEEPER_KEY);
            let fetchOnePosCounter = await posCounterModel.findOne({ owner: decoded._id, _id: req.params.posCounterId }).populate('owner', 'name email').populate('assignedTo');
            if (!fetchOnePosCounter) {
                return res.status(400).send({ success: false, status: "no posCounter found" });
            } else {
                return res.status(200).send({ success: true, posCounter: fetchOnePosCounter });
            }

        } catch (err) {
            console.log(err)
            return res.status(500).send({ success: false, status: err ? err : "something went wrong" });
        }


    }
    getOnePosCounter();


});

module.exports = posCounterRouter;