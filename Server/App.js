const express = require('express');
const connectDB = require('./app/config/db'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const  path  = require('path'); // Using app-root-path to get the root directory
const cookieParser = require('cookie-parser');



const app = express();

// Connect to MongoDB
connectDB();

app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "views");

// Middleware


const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3000'], // Allow requests from both servers
  optionsSuccessStatus: 200,       // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use("/Upload",express.static(path.join(__dirname,'Upload')))
app.use("/Upload/user",express.static(path.join(__dirname,'Upload')))
app.use(express.static(path.join(__dirname,'public')))



const AdminAuthRoute=require('../Server/Router/Admin/AdminAuthRoute')
app.use(AdminAuthRoute)



const AdminViewRoute=require('../Server/Router/Admin/AdminViewRouter')
app.use(AdminViewRoute)


const AdminApiRoute=require('../Server/Router/Admin/AdminApiRoute')
app.use(AdminApiRoute)

const AuthApiRouter=require('../Server/Router/Api/UserAuthRoute')
app.use(AuthApiRouter)

const ApiRouting=require('../Server/Router/Api/UserApiRoute')
app.use(ApiRouting)
// Start the server
const PORT = process.env.PORT || 1600;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
