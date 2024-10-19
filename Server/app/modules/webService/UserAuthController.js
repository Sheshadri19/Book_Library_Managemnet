
const bcrypt = require('bcrypt');
const nodemailer=require('nodemailer')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const TokenRepository=require('../Token/respository/token.repository')
const { generateOTP} = require('../../helper/otpGenerate');
const sendOTP =require('../../helper/nodemailer');
const userModel = require('../User/model/User');

class AuthService {

     UserSignup = async (req, res) => {
        const { name, email, password } = req.body;
    
        // Validate user data (optional but recommended)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
    
        try {
            // Check if a user with the same email already exists
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists, kindly try with another email' });
            }
    
            // Generate OTP for email verification
            const otp = generateOTP();
    
            // Hash the user's password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Initialize the user object with or without the image
            const newUser = new userModel({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires: Date.now() + 15 * 60 * 1000 // OTP valid for 15 minutes
            });
    
            // If there's an image file uploaded, add it to the user
            if (req.file) {
                newUser.image = `/Upload/user/${req.file.filename}`;  // Store the publicly accessible path
            }
    
            // Save the new user in the database
            await newUser.save();
    
            // Send the OTP via email
            try {
                await sendOTP(email, otp); // Ensure sendOTP is correctly implemented
            } catch (emailError) {
                console.error('Error sending OTP:', emailError.message);
                return res.status(500).json({ message: 'Error sending OTP. Please try again later.' });
            }
    
            // Create a token for the user (if applicable in your authentication flow)
            await TokenRepository.createToken(newUser._id);
    
            // Respond with a success message and user details (without password)
            return res.status(201).json({
                message: 'Signup successful! Please verify your email with the OTP sent.',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    image: newUser.image, // Send back image path if available
                    email: newUser.email,
                    role: newUser.role  // Return the role in the response
                }
            });
        } catch (error) {
            console.error('Signup error:', error);
            return res.status(500).json({ message: 'An error occurred during signup. Please try again.' });
        }
    };
    
    
    



 // OTP Verification API
async  UserverifyOTP (req, res) {
    const { email, otp } = req.body;

    // Validate the input
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({email});

        // Check if user exists, OTP matches, and is not expired
        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Verify the user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        // Save the user changes
        await user.save();

        // Respond with success message and user details
        return res.status(200).json({
            message: 'OTP verified successfully. Your account is now verified.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ message: 'An error occurred during OTP verification. Please try again.' });
    }
}






   // User Login API for React Frontend
 UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await userModel.findOne({ email });
        
        // Check if user exists
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        // Check if the user is an admin trying to log in on the user page
        if (user.role === 'Admin') {
            return res.status(403).json({ message: 'Admin cannot log in on this page.' });
        }

        // Check if email is verified
        if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

        // Compare the input password with the stored hashed password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        // Generate a JWT token
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role, username: user.name, email: user.email, image:user.image },
            process.env.jWt_Secret_user || 'trddthrdyjcj', // Replace with your actual JWT secret
            { expiresIn: '30d' }
        );

        // Set the token in an HTTP-only cookie
        res.cookie('usertoken', jwtToken, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Ensure cookies are sent only over HTTPS in production
            sameSite: 'strict', // Prevent CSRF attacks
        });

        // Respond with a success message and user details
        return res.status(200).json({
            message: 'Login successful',
            data:user, 
            
            token: jwtToken
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'An error occurred during login. Please try again.' });
    }
};



    

        //confirmation------
      // User Email Confirmation API for React Frontend
 Userconfirmation = async (req, res) => {
    try {
        // Find the token in the database
        const tokenRecord = await Token.findOne({ token: req.params.token });

        // If token is not found, send an error response
        if (!tokenRecord) {
            return res.status(400).json({ message: "Verification link may be expired" });
        }

        // Find the user associated with the token
        const user = await User.findOne({ _id: tokenRecord._userId, email: req.params.email });

        // If user is not found, send an error response
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // If the user is already verified, notify the client
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Mark the user as verified
        user.isVerified = true;
        await user.save();

        // Send success response
        return res.status(200).json({ message: "User verified successfully" });
    } catch (err) {
        console.error("Error during verification:", err);
        // Send error response for unexpected errors
        return res.status(500).json({ message: "An error occurred during verification. Please try again." });
    }
};




// User Logout API for React Frontend
logout = async (req, res) => {
    try {
        // Clear the authentication token cookie
        res.clearCookie("usertoken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Ensure secure flag in production
            sameSite: "strict", // Prevent CSRF attacks
        });

        // Send success response after cookie is cleared
        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        // Handle errors
        return res.status(500).json({
            success: false,
            message: "An error occurred during logout. Please try again.",
        });
    }
};







// Reset Password Controller


// Step 1: Generate OTP and send to user's email
sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP temporarily in the user document with an expiry time of 15 minutes
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    await user.save();

    // Send the OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP for Password Reset',
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Step 2: Verify OTP and reset password
verifyOtpAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      // Find the user by email
      const user = await userModel.findOne({ email });
      console.log(user);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the OTP is valid and hasn't expired
      if (user.resetOtp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password and clear the OTP
      user.password = hashedPassword;
      user.resetOtp = undefined;
      user.otpExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  





}

module.exports = new AuthService();
