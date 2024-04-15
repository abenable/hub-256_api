import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  allUsers,
  delUser,
  searchUser,
  userProfile,
} from '../controllers/userController.js';
import { ApiError } from '../controllers/errorController.js';
import { SubscriberModel } from '../models/subscribers.js';

const router = express.Router();

router.delete('/delete/:userId', protect, restrictTo('admin'), delUser);
router.get('/search', protect, restrictTo('admin'), searchUser);
router.get('', protect, restrictTo('admin'), allUsers);
router.get('/profile/:id', protect, userProfile);

router.post('/subscribe', async (req, res, next) => {
  try {
    const subscriber = await SubscriberModel.findOne({ email: req.body.email });
    if (subscriber) {
      return next(new ApiError(401, 'Email has already subscribed..'));
    }
    await SubscriberModel.create({
      email: req.body.email,
      subscribedAt: Date.now(),
    });

    res.status(200).json({
      status: 'success',
      message: 'Subscription successful',
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.patch('/unsubscribe', async (req, res, next) => {
  try {
    const subscriber = await SubscriberModel.findOne({ email: req.body.email });
    if (!subscriber) {
      return next(new ApiError(404, 'Email not found'));
    }
    subscriber.active = false;
    await subscriber.save();
    res.status(200).json({
      status: 'success',
      message: 'Unsubscribed successfully',
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get(
  '/subscribers',
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const subscribers = await SubscriberModel.find({ active: true });
      const emails = subscribers.map((item) => item.email);
      res.status(200).json(emails);
    } catch (error) {
      console.error(error);
      next(new ApiError(500, 'internal server error'));
    }
  }
);

router.get(
  '/subscribers',
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const subscribers = await SubscriberModel.find();
      res.status(200).json(subscribers);
    } catch (error) {
      console.error(error);
      next(new ApiError(500, 'internal server error'));
    }
  }
);

router.all('*', (req, res, next) => {
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

export { router as userRouter };
