const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true
    },
    owner:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    isActive: {
        type:Boolean,
        required:false,
        default:true
    }

});

module.exports = mongoose.model('category', categorySchema);
