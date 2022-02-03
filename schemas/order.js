const mongoose = require('mongoose');

const order = new mongoose.Schema({
    owner:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    customerName: {
        type: String,
        required: true,
        minLength: 5,  
    },
    customerMobile: {
        type: Number,
        required: true,
        minLength: 10,
    },
    customerAddress:{
        addressLineOne: String,
        addressLineTwo: String,
        landmark: String,
        city: String,
        state: String,
        pincode: Number,
    },
    directions:{
        type: String,
    },
    orderType:{
        type: String,
        enum: ['pickup', 'delivery', 'instore'],
        default: 'instore',
    },
    paymentMode : {
        type: String,
        enum: ['cash', 'card', 'wallet', 'upi','coupon'],
    },
    paymentStatus:{
        type: String,
        enum:['paid', 'unpaid'],
    },
    counter:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'counter',
        required: true
    },
    isActive: {
        type:Boolean,
        required:false,
        default:true
    }

});

module.exports = mongoose.model('order', order);
