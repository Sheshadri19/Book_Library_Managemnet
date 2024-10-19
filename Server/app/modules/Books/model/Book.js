
const mongoose = require('mongoose');


const BookSchema = new mongoose.Schema({
   title:{
    type:String,
    required :true
   },

   author:{
    type:String,
    required :true
   },

   category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', required: true
   },

   available:{
    type:Boolean,
    default: 'true'
   },

  borrowedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  
  },
  

  
  image:{
    type :String 
  }



}, { timestamps: true, versionKey: false });

const bookModel = mongoose.model('Book', BookSchema);
 module.exports=bookModel
