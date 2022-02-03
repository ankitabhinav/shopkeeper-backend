const mongoose = require('mongoose');

const posCounter = new mongoose.Schema({
    owner:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    counterName: {
        type: String,
        required: true,
        minLength: 5,  
        maxLength: 50
    },
    assignedTo:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'employee',
        required: true
    },
    isActive: {
        type:Boolean,
        required:false,
        default:true
    }

});

posCounter.index({ owner: 1, counterName: 1 }, { unique: true })

module.exports = mongoose.model('poscounter', posCounter);
