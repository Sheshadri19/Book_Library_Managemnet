const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 43200  // Token expires after 12 hours
    }
});

const tokenModel= mongoose.model('Token', tokenSchema);
module.exports =tokenModel
