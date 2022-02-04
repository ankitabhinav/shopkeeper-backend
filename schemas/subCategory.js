const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    owner:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    parentCategory: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'category',
        required: true
    },
    subCategoryName: {
        type: String,
        required: true,
        maxLength: 255,
    },
    variantName: {
        type: String,
        required: true,
        maxLength: 3000,
        unique: true
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }
});

subCategorySchema.index({ parentCategory: 1, subCategoryName: 1, variantName: 1 }, { unique: true })

module.exports = mongoose.model('subcategory', subCategorySchema);
