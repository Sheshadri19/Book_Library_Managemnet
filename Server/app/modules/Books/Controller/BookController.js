// controllers/bookController.js
const bookRepository = require('../../Books/repository/book.repository');

class BookController {
  // Controller to get all books
  async getAllBooks(req, res) {
    try {
      // Fetch all books from the repository
      const books = await bookRepository.findAll();

      // Render the view with the books data
      res.render('Admin/partials', {
        title: 'All Books',
        books: books // Pass the books data to the view
      });
     
    } catch (error) {
      // Handle any errors
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BookController();
