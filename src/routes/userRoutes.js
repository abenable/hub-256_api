import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  allUsers,
  delUser,
  searchUser,
  userProfile,
} from '../controllers/userController.js';
import { ApiError } from '../controllers/errorController.js';

const router = express.Router();

router.delete('/delete/:userId', protect, restrictTo('admin'), delUser);
router.get('/search', protect, restrictTo('admin'), searchUser);
router.get('', protect, restrictTo('admin'), allUsers);
router.get('/profile/:id', protect, userProfile);

router.all('*', (req, res, next) => {
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

export { router as userRouter };
