const express = require("express");
const AdminAuthController = require("../../app/modules/Admin/Controller/AdminAuthController");
const upload=require('../../app/helper/multer');
const AdminApiController = require("../../app/modules/Admin/Controller/AdminApiController");
const AdminAuthrouter = express.Router();


AdminAuthrouter.post('/Admin/Signup',upload.single('image'),AdminAuthController.signup)

AdminAuthrouter.post('/Admin/login',AdminAuthController.Login)

AdminAuthrouter.post('/otp/verify',AdminAuthController.verifyOTP)

AdminAuthrouter.get('/Admin/logout',AdminAuthController.logout)

AdminAuthrouter.get('/confirmation/:email/:token',AdminAuthController.confirmation)



module.exports = AdminAuthrouter;
