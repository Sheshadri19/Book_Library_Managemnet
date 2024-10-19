// src/routes/dataRoutes.js
const express = require('express');
const UserApiController = require('../../app/modules/webService/UserApiController');
const { CheckAuth } = require('../../app/middleware/auth');

const Apirouter = express.Router();

// Route to fetch all categories
Apirouter.get('/All/categories/Api',UserApiController.getAllCategories);

// Route to fetch all books
Apirouter.get('/All/books/Api',UserApiController.getAllBooks);


// Apirouter.get('/user/borrowed-status/:userId',CheckAuth,UserApiController.ActiveBook);

// Route to check block status
Apirouter.get('/checkBlockStatus/:id',CheckAuth,UserApiController.checkBlockStatus);


Apirouter.get('/user/show-borrow-book/:id',CheckAuth, UserApiController.ShowBorrowBooks);

Apirouter.post('/borrow/:userId/:bookId', CheckAuth,UserApiController.borrowBook);

Apirouter.get('/checkBooking/:userId/:bookId',CheckAuth,UserApiController.checkExistingBooking);

module.exports = Apirouter;
