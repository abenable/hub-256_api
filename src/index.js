// Import necessary modules and libraries
import express from 'express'; // Framework for building web applications
import path from 'path'; // Module for working with file and directory paths
import dotenv from 'dotenv'; // Module to load environment variables from a .env file
dotenv.config(); // Load environment variables from .env file

import cors from 'cors'; // Middleware to enable Cross-Origin Resource Sharing (CORS)
import mongoose from 'mongoose'; // MongoDB ODM (Object-Document Mapping)
import bodyParser from 'body-parser'; // Middleware to parse incoming request bodies
import cookieParser from 'cookie-parser'; // Middleware to parse cookies

import helmet from 'helmet'; // Middleware for adding various security-related HTTP headers
import mongoSanitize from 'express-mongo-sanitize'; // Middleware to prevent MongoDB query injection
import xss from 'xss-clean'; // Middleware to sanitize user input from cross-site scripting (XSS) attacks
import hpp from 'hpp'; // Middleware to protect against HTTP Parameter Pollution attacks

import { ApiError, ErrorHandler } from './controllers/errorController.js'; // Custom error handling classes
import { authRouter } from './routes/authRoutes.js'; // Router for authentication-related routes
import { getDirname, limiter } from './utils/util.js'; // Custom utility functions
import { userRouter } from './routes/userRoutes.js'; // Router for user-related routes
import { blogRouter } from './routes/blogRoutes.js';

// Get port and MongoDB connection URI from environment variables
const port = process.env.PORT;
const uri =
  process.env.NODE_ENV === 'development'
    ? process.env.LOCAL_URI
    : process.env.URI;
// Get the directory name of the current module
const __dirname = getDirname(import.meta.url);

// Initialize the express app
const app = express();

// 1) GLOBAL MIDDLEWARES

// Enable CORS for all routes
app.use(cors());
app.options('*', cors());

// Parse incoming request bodies as JSON and handle URL-encoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Parse cookies from incoming requests
app.use(cookieParser());

// Set various HTTP security headers using Helmet middleware
app.use(helmet());

// Apply rate limiting to prevent abuse and brute force attacks
app.use('/', limiter);

// Prevent MongoDB query injection attacks
app.use(mongoSanitize());

// Sanitize user input to prevent cross-site scripting attacks
app.use(xss());

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());

// 2) ROUTES

// welcome to the homepage
app.use('/home', (req, res) => {
  return res.send('welcome to the home page');
});

// Use the authentication router for '/auth' routes
app.use('/auth', authRouter);

// Use the user router for '/users' routes
app.use('/users', userRouter);

app.use('/blog', blogRouter);
// Middleware to handle routes that are not found
app.all('*', (req, res, next) => {
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

// Global error handling middleware
app.use(ErrorHandler);

// Start the express server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    // Connect to the MongoDB database
    await mongoose.connect(uri);
    console.log('Connected to the database.');
  } catch (error) {
    console.error(error);
  }
});
