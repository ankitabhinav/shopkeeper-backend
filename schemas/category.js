const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        minLength: 5,  
        maxLength: 50
    },
    isActive: {
        type:Boolean,
        required:false,
        default:true
    }

});

module.exports = mongoose.model('user', categorySchema);
