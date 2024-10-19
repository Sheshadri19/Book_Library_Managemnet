const jwt = require('jsonwebtoken');


class Authentication{
  CheckAuth = async (req, res, next) => {
    try {
        // Check if the token exists in the Authorization header
        const token = req.headers.authorization?.split(' ')[1]; 

        if (token) {
            // Verify the token
            const decoded = jwt.verify(token, process.env.jWt_Secret_user);
            
            // Attach the decoded user information to the request object
            req.user = decoded;

            // Proceed to the next middleware or route handler
            return next();
        } else {
            // No token provided
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }
    } catch (error) {
        // Handle any errors that occurred during verification
        return res.status(400).json({
            success: false,
            message: "Unauthorized: Invalid token",
            error: error.message,
        });
    }
};





      // Middleware to authenticate admin
       jwtAuthAdmin = (req, res, next) => {
        const token = req.cookies && req.cookies.AdminToken;
    
        
        if (!token) {
            console.log('Token is missing');
            return res.redirect('/Admin/login/form');  // Redirect to signin or error page
        }
    
        jwt.verify(token, process.env.JWT_SECRETAdmin, (err, decoded) => {
            if (err) {
                console.error('Error verifying admin token:', err);
                return res.redirect('/Admin/login/form');  // Redirect to signin or error page
            }
    
            req.admin = decoded;  // Attach the decoded token to the request object
            next();
        });
    };

      
}

module.exports=new Authentication()

