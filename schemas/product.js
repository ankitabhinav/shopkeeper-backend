const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50
    },
    manufacturer: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 255,
    },
    tags: [String],
    manufacturerAddress: {
        type: String,
    },
    directions: {
        type: String,
    },
    caution: {
        type: String,
    },
    composition: {
        type: String,
    },
    contactEmail: {
        type: String,
    },
    contactNumber: {
        type: String,
    },
    shelfLife: {
        type: Number
    },
    productImage: {
        type: String,
        default: "https://i.ibb.co/brFh7nG/box-1252639-640.png"
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }

});

productSchema.index({ owner: 1, name: 1, manufacturer: 1 }, { unique: true })

module.exports = mongoose.model('product', productSchema);
