import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { ApiError, ErrorHandler } from './controllers/errorController.js';
import { authRouter } from './routes/authRoutes.js';
import { getDirname, limiter } from './utils/util.js';
import { userRouter } from './routes/userRoutes.js';
import { blogRouter } from './routes/blogRoutes.js';

dotenv.config();

const port = process.env.PORT;
const uri =
  process.env.NODE_ENV === 'development'
    ? process.env.LOCAL_URI
    : process.env.URI;

const __dirname = getDirname(import.meta.url);

const app = express();

/**
 * Enable Cross-Origin Resource Sharing (CORS)
 */
app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

/**
 * Set various HTTP headers to enhance security
 */
app.use(helmet());

/**
 * Limit repeated requests to prevent abuse
 */
app.use('/', limiter);

/**
 * Sanitize user-supplied data to prevent MongoDB Operator Injection
 */
app.use(mongoSanitize());

/**
 * Protect against HTTP Parameter Pollution attacks
 */
app.use(hpp());

//Routes

/**
 * Authentication routes
 */
app.use('/auth', authRouter);

/**
 * User routes
 */
app.use('/users', userRouter);

/**
 * Blog routes
 */
app.use('/blog', blogRouter);

/**
 * Home route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with a welcome message
 */
app.use('/', (req, res) => {
  return res.send('welcome to the home page');
});
/**
 * Handle all other routes that are not found
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Function} - The next middleware function with an error object
 */
app.all('*', (req, res, next) => {
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

/**
 * Error handling middleware
 */
app.use(ErrorHandler);

/**
 * Start the server
 */
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await mongoose.connect(uri);
    console.log('Connected to the database.');
  } catch (error) {
    console.error(error);
  }
});
