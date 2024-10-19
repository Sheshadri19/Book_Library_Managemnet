const { default: mongoose } = require("mongoose");
const nodemailer = require('nodemailer');
const categoryModel = require("../Category/model/category");
const userModel = require("../User/model/User");
const Booking = require("../Booking/model/booking");
const bookModel = require("../Books/model/Book");

class UserApiController{
// Controller to fetch all categories
 getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find(); // Fetch all categories
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'No categories found' });
        }
        return res.status(200).json({ message: 'Categories fetched successfully', categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ message: 'Error fetching categories' });
    }
};

// Controller to fetch all books
 getAllBooks = async (req, res) => {
    try {
        const books = await bookModel.find(); // Fetch all books
        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }
        return res.status(200).json({ message: 'Books fetched successfully', books });
    } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ message: 'Error fetching books' });
    }
};




 borrowBook = async (req, res) => {
    try {
        const { userId, bookId } = req.params;

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        // Check if the book exists
        const book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
     
          
        // Set the due date (7 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        // Create a new booking
        const newBooking = new Booking({
            user: userId,
            book: bookId,
            dueDate
        });

        // Save the booking
        await newBooking.save();

        // Update the user with the booking reference
        user.booking = newBooking._id;
        await user.save();

        // Send an email reminder to the user
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use any email service provider
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password or app-specific password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Book Borrowed: Return within 7 days',
            text: `Hello ${user.name},\n\nYou have borrowed the book "${book.title}". Please return it by ${dueDate.toDateString()}.\n\nThank you!`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.status(200).json({ message: 'Book borrowed successfully', booking: newBooking });
    } catch (error) {
        return res.status(500).json({ message: 'Error borrowing book', error: error.message });
    }
};



// Backend route to check if the user has borrowed any book
// ActiveBook=async (req, res) => {
//     try {
//       const userId = req.params.userId;
  
//       // Find bookings where the user has not returned a book
//       const activeBorrow = await Booking.findOne({ userId, isReturned: false });
      
//       if (activeBorrow) {
//         res.status(200).json({ hasBorrowed: true, message: 'You already have a borrowed book' });
//       } else {
//         res.status(200).json({ hasBorrowed: false, message: 'You can borrow a book' });
//       }
//     } catch (error) {
//       res.status(500).json({ error: 'Server error' });
//     }
//   };
  
// Controller to check if a user is blocked
 checkBlockStatus = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ isBlocked: user.blocked });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
};





// Backend route for fetching borrowed books




ShowBorrowBooks = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id); // Ensure ObjectId format for user ID

        // MongoDB aggregation pipeline to fetch all bookings for the user with book details
        const result = await Booking.aggregate([
            {
                $match: { user: userId } // Match the bookings by user ID
            },
            {
                $lookup: {
                    from: 'books', // Collection name of books
                    localField: 'book', // Field in booking that references the book
                    foreignField: '_id', // Field in books collection
                    as: 'bookDetails' // Alias for the joined result
                }
            },
            {
                $unwind: '$bookDetails' // Unwind the book details to access individual book objects
            },
            {
                $project: {
                    _id: 0, // Exclude the booking ID
                    'bookDetails.title': 1, // Include book title
                    'bookDetails.author': 1, // Include book author
                    borrowDate: 1, // Include borrow date from booking
                    dueDate: 1 // Include due date from booking
                }
            }
        ]);

        // Check if no borrowed books were found
        if (!result.length) {
            return res.json({ borrowedBooks: [] }); // Return an empty array if no results
        }

        res.json({ borrowedBooks: result });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowed books', error: error.message });
    }
};




// check existing borrow 
 checkExistingBooking = async (req, res) => {
    const { userId, bookId } = req.params;
  
    try {
      // Check if there is an existing booking for the user and book
      const existingBooking = await Booking.findOne({ user: userId, book: bookId });
  
      if (existingBooking) {
        return res.json({ exists: true });
      }
  
      res.json({ exists: false });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error checking booking' });
    }
  };


}
module.exports = new UserApiController()
