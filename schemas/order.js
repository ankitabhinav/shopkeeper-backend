const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    variantId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'variant',
        required: true
    },
    itemName: {
        type: String,
        required: true,
    },
    unit:{
        type: String,
        required: true,
    },
    size:{
      type : Number,
      required: true
    },
    currency:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    }
});

const order = new mongoose.Schema({
    owner:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    customerName: {
        type: String,
        required: true,
    },
    customerMobile: {
        type: Number,
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
        default:'none'
    },
    orderType:{
        type: String,
        enum: ['pickup', 'delivery', 'instore'],
        default: 'instore',
    },
    paymentMode : {
        type: String,
        enum: ['cash', 'card', 'wallet', 'upi','coupon'],
        default: 'cash',
    },
    paymentStatus:{
        type: String,
        enum:['paid', 'unpaid'],
        default: 'unpaid',
    },
    counter:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'counter',
        required: true
    },
    discount:{
        type: Number,
        required: true
    },
    items : [itemSchema],
    beforeDiscount:{
        type: Number,
        required: true
    },
    afterDiscount:{
        type: Number,
        required: true
    },
    isActive: {
        type:Boolean,
        required:false,
        default:true
    },
    date: { type: Date, default: Date.now }

});

module.exports = mongoose.model('order', order);
