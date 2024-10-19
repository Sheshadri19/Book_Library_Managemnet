const User = require('../model/User');

class UserRepository {
    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async findUserById(userId) {
        return await User.findById(userId);
    }

 

    async findBorrowingUsers() {
        return await Booking.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $lookup: {
                    from: 'books',
                    localField: 'book',
                    foreignField: '_id',
                    as: 'bookDetails',
                },
            },
            { $unwind: '$userDetails' }, // Ensures only one user object
            { $unwind: '$bookDetails' }, // Ensures only one book object
            {
                $project: {
                    'userDetails.password': 0, // Exclude sensitive data
                    'userDetails.__v': 0,
                    'bookDetails.__v': 0,
                    'bookDetails.category': 0,
                },
            },
        ]);
    }

    async blockUser(userId) {
        return await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
    }

    async updateUser(userId, updatedData) {
        return await User.findByIdAndUpdate(userId, updatedData, { new: true });
    }

    async findToken(token) {
        return await Token.findOne({ token });
    }
}

module.exports = new UserRepository();
