const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },

    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: true,
    },

    contactEmail: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
    },
    address: {
        addressLineOne: String,
        addressLineTwo: String,
        landmark: String,
        city: String,
        state: String,
        pincode: Number,
    },
    dateOfBirth: {
        type: Date,
    },
    profileImage: {
        type: String,
        default: 'https://i.ibb.co/2K2qWdD/personal.png'
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }

});

ShapesSchema.index({ owner: 1, contactEmail: 1 }, { unique: true })

module.exports = mongoose.model('employee', employeeSchema);
