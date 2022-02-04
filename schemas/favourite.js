const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    productId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'product',
        required: true
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }

});

favouriteSchema.index({ owner: 1, productId: 1}, { unique: true })

module.exports = mongoose.model('favourite', favouriteSchema);
