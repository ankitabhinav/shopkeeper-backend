const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentProduct: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'product',
        required: true,
    },
    barcode: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        enum: ['gram', 'kilogram', 'liter', 'milliliter', 'piece'],
        default: 'piece',
    },
    size:{
        type: Number,
        required: true
    },
    availableQuantity: {
        required:true,
        type: Number,
    },
    currency:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true
    },
    variantImage:{
        type: String,
        default:"https://i.ibb.co/brFh7nG/box-1252639-640.png"
    },
    tags:{
        type: [String]
    },
    manufactureDate: {
        type: Date,
        required: false,
    },
    isActive: {
        type:Boolean,
        required:false,
        default:true
    },
    date: { type: Date, default: Date.now },


});

module.exports = mongoose.model('variant', variantSchema);
