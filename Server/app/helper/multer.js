const path=require('path')
const multer=require('multer')

var storage=multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'Upload/')
    },
    filename: function (req, file, cb) {
        let ext=path.extname(file.originalname)
        cb(null,Date.now() + ext)
    }
})

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//              cb(null,'./uploads')
//          },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
//     },
//   });

const uploadProduct = multer({
     storage: storage,
     fileFilter:function(req,file,callback){
        if(
            file.mimetype =='image/png'||
            file.mimetype =='image/jpg' ||
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/webp'
            ){
                callback(null,true)

        }else{
            console.log('selete valid image format');
            callback(null,false)
        }
     },
     limits:{
        fieldSize: 1024 * 1024 * 2
     }
     });


     module.exports=uploadProduct