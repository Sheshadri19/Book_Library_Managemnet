const BookRepository = require('../../Books/repository/book.repository');
const CategoryRepository = require('../../Category/repository/category.repository');
const UserRepository = require('../../User/repository/user.repository');

class AdminService {

   
    // Add a new book
    async addBook(bookData) {
        return await BookRepository.createBook(bookData);
    }

    // Add a new category
    async addCategory(categoryData) {
        return await CategoryRepository.createCategory(categoryData);
    }

    // Get all borrowing users and their borrowed books using aggregation
    async getBorrowingUsers() {
        return await UserRepository.findBorrowingUsers();
    }

    // Block a user who exceeded the due date
    async blockUser(userId) {
        const user = await UserRepository.findUserById(userId);
        if (!user) throw new Error('User not found');
        
        // Check if user exceeded the due date
        const borrowings = await Booking.find({ user: userId });
        for (const borrowing of borrowings) {
            if (borrowing.dueDate < Date.now()) {
                return await UserRepository.blockUser(userId);
            }
        }

        throw new Error('User has not exceeded the due date');
    }
}

module.exports = new AdminService();
