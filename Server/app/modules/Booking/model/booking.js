const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',          
    required: true        
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',       
    required: true        
  },
  borrowDate: {
    type: Date,
    default: Date.now,   
    required: true       
  },
  dueDate: {
    type: Date,
    required: true,
    default: function() {
        return new Date(new Date(this.borrowDate).getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after borrowDate
    }
}

});


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
