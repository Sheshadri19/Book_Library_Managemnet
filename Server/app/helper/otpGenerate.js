
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const generateOTPExpiry = () => {
    return Date.now() + 600000; // OTP expires in 10 minutes
};

module.exports = { generateOTP, generateOTPExpiry };
