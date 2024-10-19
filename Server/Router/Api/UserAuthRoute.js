const express=require('express')
const UserAuthController = require('../../app/modules/webService/UserAuthController')
const AuthApiRouter=express.Router()
const Upload=require('../../app/helper/frontendmulter')

AuthApiRouter.post('/user/login',UserAuthController.UserLogin)
AuthApiRouter.post('/user/register',Upload.single('image'),UserAuthController.UserSignup)

AuthApiRouter.post('/user/otpVerify',UserAuthController.UserverifyOTP)
AuthApiRouter.post('/user/logout',UserAuthController.logout)

AuthApiRouter.get('/user/confirmation/:email/:token',UserAuthController.Userconfirmation)

AuthApiRouter.post('/user/reset-password',UserAuthController.verifyOtpAndResetPassword)

AuthApiRouter.post('/user/send-otp',UserAuthController.sendResetOtp)
module.exports=AuthApiRouter
