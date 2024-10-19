
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken');

const {generateOTP}=require('../../../helper/otpGenerate')

const TokenRepository=require('../../Token/respository/token.repository')




const sendOTP = require('../../../helper/nodemailer');
const userModel = require('../../User/model/User');
const userRepository = require('../../User/repository/user.repository');
const tokenModel = require('../../Token/model/token');





class AdminAuthController {
    async signup(req, res) {
        const { name, email, password} = req.body;  // Include bookingId in the request body
    
        // Validate user data (optional but recommended)
        // ... perform validation checks here ...
    
        try {
            // Check for existing user using repository
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                throw new Error('Email already exists, kindly try with another email');
            }
    
        
    
            const otp = generateOTP();
            // Hash the password with the generated salt
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Create a new user with sanitized data (consider data sanitization)
            const newUser = new userModel({
                name,
                email,
                password: hashedPassword,
                otp,
             
                
                otpExpires: Date.now() + 15 * 60 * 1000, // OTP valid for 15 minutes
            });

            if(req.file){
                newUser.image=req.file.path
            }
    
            await newUser.save();
    
            // Send OTP via email
            try {
                await sendOTP(email, otp);  // Ensure sendOTP is correctly implemented
            } catch (emailError) {
                console.error('Error sending OTP:', emailError.message);
                return res.status(500).send('Error sending OTP. Please try again later.');
            }
    
            // Create a token for the user (assuming a separate service)
            await TokenRepository.createToken(newUser._id);
    
            // Redirect to success page or handle response appropriately
            res.redirect('/Admin/OtpVerify'); // Or send a success response
        } catch (error) {
            console.error(error); // Log the error for debugging
            // Handle signup errors gracefully (e.g., send error response)
            res.status(400).send(error.message);
        }
    }
    


    verifyOTP = async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await userModel.findOne({ email });

            if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(500).send('Invalid or expired OTP.');
            }

            if (user.otp === otp) {
                user.isVerified = true
                user.otp = undefined
                user.otpExpires = undefined;
                await user.save();
            }

            return res.redirect('/Admin/login/form')

        } catch (err) {
            return res.status(500).send(err.message)
        }
    }

    Login = async (req, res) => {
        try {
            const { email, password } = req.body;
    
            // Find the user by email
            const user = await userRepository.findUserByEmail(email);
    
            // Check if user exists
            if (!user) return res.status(400).send('User not found');
    
            // Check if the user is an admin trying to log in on the user page
            if (user.role === 'user') {
                return res.status(403).send('User cannot log in on this page.');
            }
    
            // Check if email is verified
            if (!user.isVerified) return res.status(400).send('Email not verified');
    
            // Compare the input password with the stored hashed password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(400).send('Invalid password');
    
            // Generate a JWT token
            const jwtToken = jwt.sign(
                { id: user._id, role: user.role, username: user.name, email: user.email ,blocked:user.blocked, image:user.image},
                process.env.JWT_SECRETAdmin || 'kkhjbkjbbjjyuuyyuhm', // Use environment variable for JWT secret
                { expiresIn: '30d' }
            );
    
            // Set the token in an HTTP-only cookie
            res.cookie('AdminToken', jwtToken, {
                httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Ensure cookies are sent only over HTTPS in production
                sameSite: 'strict', // Prevent CSRF attacks
            });
    
            // Redirect to the home page after successful login
            return res.redirect('/Admin/Dashboard');
        } catch (error) {
            return res.status(500).send(error.message);
        }
    };


      //confirmation------
      confirmation = async (req, res) => {
        try {
            // Find the token
            const token = await tokenModel.findOne({ token: req.params.token });

            console.log(token);
            
    
            if (!token) {
                console.log("Verification link may be expired");
                req.flash("message1", "Verification link may be expired");
                return res.redirect("/Admin/login");
            }
    
            // Find the user associated with the token
            const user = await User.findOne({ _id: token._userId, email: req.params.email });


    
            if (!user) {
                req.flash("message1", "User not found");
                return res.redirect("/Admin/login");
            }
    
            if (user.isVerified) {
                req.flash("message1", "User is already verified");
                return res.redirect("/Admin/login");
            }
    
            // Verify the user
            user.isVerified = true;
            await user.save();
    
            req.flash("message1", "User verified successfully");
            res.redirect("/Admin/login");
    
        } catch (err) {
            console.error("Something went wrong:", err);
            req.flash("message1", "An error occurred. Please try again.");
            res.redirect("/Admin/login");
        }
    };
    
    logout = async (req, res) => {
        try {
            res.clearCookie("Admin");
            return res.redirect("/Admin/login/form");
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

module.exports = new AdminAuthController();
