
const userModel = require("../../User/model/User");
const Booking = require("../../Booking/model/booking");
const bookModel = require("../../Books/model/Book");
const categoryModel = require("../../Category/model/category");

class AdminViewController {

    Authadmin = (req, res, next) => {
        if (req.admin) {

            return next()
        } else {
            console.log('Error While Auth');
            res.redirect('/Admin/Dashboard')
        }
    }


    // REgister View 

    AdminResgisterForm = async (req, res) => {
        res.render('Admin/partials/AdminRegister', {
            title: 'Admin Signup',
            data: req.admin
        })

    }

    // Otp verify

    AdminOtpVerify = async (req, res) => {
        try {
            res.render('Admin/partials/OtpVerify', {
                title: 'otp verify',
                data: req.admin
            })

        } catch (err) {
            console.log('cant fetch otp verify page');

        }

    }

    // login view

    AdminLoginForm = async (req, res) => {
        res.render('Admin/partials/AdminLogin', {
            title: 'Admin Login',
            data: req.admin,

        })
    }


    // Controller function
    AdminDashboard = async (req, res) => {
        try {
            // Extract the admin's name from req.admin
            const adminName = req.admin.username || 'Admin';  // Default to 'Admin' if name is not available


             const userDat=await userModel.find({role:'User'})
           
             
            const BooksDat=await bookModel.find()
             const bookingdat=await Booking.find()

            // Render the EJS template with the admin's name
            res.render('Admin/partials/AdminDashboard', {
                title: 'Admin Dashboard',
                name: adminName,  // Pass the admin's name to the template
                data: req.admin,  // Pass additional data if needed
                userData:userDat,
                bookingdata:bookingdat,
                Books:BooksDat
               
            }); 

           console.log(req.admin);
           
            
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    };


    async getAllBooks(req, res) {
        try {
            const books = await bookModel.aggregate([
                {
                    $lookup: {
                        from: 'categories', // Name of the category collection
                        localField: 'category', // The field in bookModel that references the category
                        foreignField: '_id', // The field in the categoryModel to match
                        as: 'categoryDetails' // Alias for the joined category data
                    }
                },
                {
                    $unwind: '$categoryDetails' // Unwind to convert array result into single object
                },
                {
                    $project: {
                        title: 1,
                        author: 1,
                        available:1,
                        'categoryDetails.name': 1 // Specify fields to project,

                    }
                }
            ]);
    
            const adminName = req.admin.username || 'Admin'; 
            // Render the view with the books data
            res.render('Admin/partials/Book', {
                title: 'All Books',
                name: adminName,
                booksdata: books, // Pass the books data to the view
                data: req.admin
            });
    
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }


    // Add Book Form

    addBookForm=async(req,res)=>{
   const categories=await categoryModel.find()
   const adminName = req.admin.username || 'Admin'; 
        res.render('Admin/partials/AddBook',{
            title:'add book',
            data:req.admin,
            name:adminName,
            category: categories 
        })
    }

 // Controller for showing all users with role 'user'

 allUser = async (req, res) => {
    const adminName = req.admin.username || 'Admin'; // Retrieve admin name
    try {
        // Aggregate users with role 'User' and lookup their booking information
        const users = await userModel.aggregate([
            {
                $match: { role: 'User' } // Only get users with role 'User'
            },
            {
                $lookup: {
                    from: 'bookings', // Lookup booking info
                    localField: '_id',
                    foreignField: 'user',
                    as: 'bookings'
                }
            },
            {
                $lookup: {
                    from: 'books', // Lookup books for each booking
                    localField: 'bookings.book',
                    foreignField: '_id',
                    as: 'borrowedBooks'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    blocked: 1,
                    bookings: 1,
                    borrowedBooks: {
                        title: 1,
                        author: 1
                    }
                }
            }
        ]);

        // Check for overdue books and set block status
        for (let user of users) {
            const overdue = user.bookings.some(booking => new Date(booking.dueDate) < new Date());
            if (overdue) {
                user.blocked = true; // Block user if any book is overdue
                await userModel.updateOne({ _id: user._id }, { blocked: true }); // Update user's block status in DB
            }
        }

        res.render('Admin/partials/Users', {
            title: 'All Users',
            name: adminName,
            data: req.admin,
            userData: users
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Internal server error');
    }
};


 blockUnBlock = async (req, res) => {
    const userId = req.params.id;
    try {
        const data = await userModel.findById(userId);
        if (data.blocked === false) {
            data.blocked = true; // Block the user
        } else {
            data.blocked = false; // Unblock the user
        }
        await data.save(); // Save changes to the database
        res.redirect('/Admin/User/dashboard'); // Redirect to user dashboard
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
};




     categoryDashboard = async (req, res) => {
        try {
            const categories = await categoryModel.aggregate([
                {
                    $lookup: {
                        from: 'books', // The name of the book collection
                        localField: '_id', // The field in categoryModel that relates to bookModel
                        foreignField: 'category', // The field in bookModel that references the category
                        as: 'books' // Alias for the joined books data
                    }
                },
                {
                    $project: {
                        name: 1, // Category name
                        books: { title: 1} // Only include the book title and author in the projection
                    }
                }
            ]);
    
            const adminName = req.admin.username || 'Admin'; 
    
            // Render the view with the categories and their books
            res.render('Admin/partials/Categorydashboard', {
                title: 'Category dashboard',
                name: adminName,
                data: req.admin,
                category: categories // Pass the categories with books data to the view
            });
    
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
    

    AddcategoryFrom=async(req,res)=>{
        const adminName = req.admin.username || 'Admin'; 
        res.render('Admin/partials/Addcategory',
            {
                  title:'Add category',
                  name:adminName,
                  data: req.admin,

            }
        )
    }

    getAllBookings = async (req, res) => {
        try {

            const adminName = req.admin.username || 'Admin'; 
          const bookings = await Booking.aggregate([
            {
              $lookup: {
                from: 'users', // The collection name for users
                localField: 'user', // The field in the Booking model
                foreignField: '_id', // The field in the User model
                as: 'userDetails' // Alias for the joined user data
              }
            },
            {
              $lookup: {
                from: 'books', // The collection name for books
                localField: 'book', // The field in the Booking model
                foreignField: '_id', // The field in the Book model
                as: 'bookDetails' // Alias for the joined book data
              }
            },
            {
              $unwind: '$userDetails' // Unwind the userDetails array to get a single object
            },
            {
              $unwind: '$bookDetails' // Unwind the bookDetails array to get a single object
            },
            {
              $project: {
                _id: 1,
                'userDetails.name': 1, // Projecting only name from user
                'userDetails.email': 1, // Projecting only email from user
                'bookDetails.title': 1, // Projecting only title from book
                'bookDetails.author': 1, // Projecting only author from book
                borrowDate: 1,
                dueDate: 1
              }
            }
          ]);
      
          res.render('Admin/partials/BookingDashboard',{
            title:'All Booking',
                  name:adminName,
                  data: req.admin,
                  booking:bookings

          });
        } catch (error) {
       console.log(error.message);
       
        }
      };
      


}

module.exports = new AdminViewController()