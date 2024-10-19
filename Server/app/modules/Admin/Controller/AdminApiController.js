const bookModel = require('../../Books/model/Book');
const AdminService = require('../respository/admin.repository');

class AdminController {
    // Add a new book
     AddBook=async(req,res)=>{
        try{  

            const {title,author,category}=req.body
        const extTitle=await bookModel.findOne({title})
        if(extTitle){
            return res.status(500).send('same title found cant add this book')
        }
           const addBook=  new bookModel({
            title, author, category 
           })
         if(req.file){
            addBook.image=req.file.path
         }
           await addBook.save()
           res.redirect('/Admin/Book/dashboard'); // Redirect after successful addition
        }catch(error){
            console.log(error);
        }
     }

    // Add a new category
    async addCategory(req, res) {
        try {
            const categoryData = req.body;
            const newCategory = await AdminService.addCategory(categoryData);
           res.redirect('/All/Category')
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get users who borrowed books
    async getBorrowingUsers(req, res) {
        try {
            const users = await AdminService.getBorrowingUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Block a user who exceeded the due date
    

}

module.exports = new AdminController();
