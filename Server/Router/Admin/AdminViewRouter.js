
const express = require("express");
const AdminViewController = require("../../app/modules/Admin/Controller/AdminViewController");

const { jwtAuthAdmin } = require("../../app/middleware/auth");


const AdminViewrouter = express.Router();

AdminViewrouter.get('/Admin',AdminViewController.AdminResgisterForm)

AdminViewrouter.get('/Admin/OtpVerify',AdminViewController.AdminOtpVerify)

AdminViewrouter.get('/Admin/login/form',AdminViewController.AdminLoginForm)

AdminViewrouter.get('/Admin/Dashboard',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.AdminDashboard)

AdminViewrouter.get('/Admin/Book/dashboard',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.getAllBooks)


AdminViewrouter.get('/Admin/User/dashboard',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.allUser)

AdminViewrouter.get('/Add/Book',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.addBookForm)

AdminViewrouter.get('/All/Category',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.categoryDashboard)

AdminViewrouter.get('/Add/Category/form',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.AddcategoryFrom)


AdminViewrouter.get('/All/Booking',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.getAllBookings)


AdminViewrouter.get('/block/unblock/:id',jwtAuthAdmin,AdminViewController.Authadmin,AdminViewController.blockUnBlock)

module.exports = AdminViewrouter;
