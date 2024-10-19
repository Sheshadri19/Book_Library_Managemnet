const Book = require('../model/Book');
const mongoose = require('mongoose');

class BookRepository {
    // add book
    async createBook(bookData) {
        const newBook = new Book(bookData);
        return await newBook.save();
    }

    async findAll() {
        try {
          const books = await Book.aggregate([
            {
              $lookup: {
                from: 'categories',  // Name of the Category collection
                localField: 'category',
                foreignField: '_id',
                as: 'categoryDetails'
              }
            },
            {
              $lookup: {
                from: 'users',  // Name of the User collection
                localField: 'borrowedBy',
                foreignField: '_id',
                as: 'borrowedByDetails'
              }
            },
            { $unwind: '$categoryDetails' },  // Flatten the categoryDetails array
            { $unwind: '$borrowedByDetails' },  // Flatten the borrowedByDetails array
            {
              $project: {
                title: 1,
                author: 1,
                available: 1,
                borrowDate: 1,
                dueDate: 1,
                'categoryDetails.name': 1,  // You can specify the fields you need from the Category
                'borrowedByDetails.name': 1,  // You can specify the fields you need from the User
              }
            }
          ]);
    
          return books;
        } catch (error) {
          throw new Error('Error retrieving books');
        }
      }


}

module.exports = new BookRepository();
