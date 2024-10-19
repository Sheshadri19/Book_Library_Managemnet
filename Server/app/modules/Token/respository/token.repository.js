
const crypto=require('crypto');
const tokenModel = require('../model/token');

class TokenRepository {
    async createToken(userId) {
        const token = new tokenModel({
            _userId: userId,
            token: crypto.randomBytes(16).toString('hex')
        });
        return await token.save();
    }
}

module.exports = new TokenRepository();
