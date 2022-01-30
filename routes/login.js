const express = require('express');
const loginRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
//Create a usersModel model just by requiring the module
var usersModel = require('./../schemas/user');

loginRouter.post('/', (req, res) => {

    //console.log(req.body);

    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ success: false, status: 'email and password fields are required' });
    }
    else {

        async function authUser() {

            try {
                let fetchUser = await usersModel.findOne({ email: req.body.email })
                if (!fetchUser) {
                    return res.status(400).send({success:false, status: "user with email address does not exists" });
                }
                else {

                    let hashedPassword = fetchUser.password;
                    let plainPassword = req.body.password;

                    const comparePasswords = await bcrypt.compare(plainPassword, hashedPassword);

                    if (comparePasswords == true) {

                        /*  if (fetchUser.isActive == false) {
                             return res.status(400).send({ status: 'Verify your email address to continue' });
                         } else {
                             const token = jwt.sign({ id: fetchUser._id, email: fetchUser.email, name: fetchUser.name }, 'jwtPrivateKey');
                             return res.status(200).send({ status: 'login successful', jwt: token, name: fetchUser.name, email: fetchUser.email, profilePic: fetchUser.profilePic });
                         } */

                        const token = jwt.sign(
                            { _id: fetchUser._id, email: fetchUser.email, name: fetchUser.name,tokenType:'token' },
                            process.env.SHOPKEEPER_KEY,
                            { expiresIn: '6h', issuer: 'shopkeeper_backend' }
                        );
                        const refreshToken = jwt.sign(
                            { _id: fetchUser._id, email: fetchUser.email, name: fetchUser.name, tokenType: 'refreshToken' },
                            process.env.SHOPKEEPER_KEY,
                            { expiresIn: '12h', issuer: 'shopkeeper_backend' }
                        );
                        return res.status(200).send(
                            {
                                success: true,
                                status: 'login successful',
                                token: token,
                                refreshToken: refreshToken,
                                name: fetchUser.name,
                                email: fetchUser.email,
                            });

                    }
                    else {
                        return res.status(400).send({ success: false, status: 'password is incorrect' });
                    }
                }
            } catch (err) {
                console.log(err);
                return res.status(500).send({success:false, status:err})
            }

        }
        authUser();
    }

});

module.exports = loginRouter;