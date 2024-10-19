
const express=require('express')
const AdminApiController = require('../../app/modules/Admin/Controller/AdminApiController')
const uploadProduct = require('../../app/helper/multer')

const AdminapiRouter=express.Router()

AdminapiRouter.post('/Admin/Add/Book',uploadProduct.single('image'),AdminApiController.AddBook)

AdminapiRouter.post('/Add/category',AdminApiController.addCategory)




module.exports=AdminapiRouter