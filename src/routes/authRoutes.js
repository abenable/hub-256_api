import express from 'express';
import {
  AdminRegister,
  Login,
  Register,
  forgotpassword,
  resetpassword,
  updatepassword,
} from '../controllers/authController.js';
import { ApiError } from '../controllers/errorController.js';

const router = express.Router();

router.post('/register', Register);
router.post('/admin/register', AdminRegister);
router.post('/login', Login);
router.post('/forgotpassword', forgotpassword);
router.post('/updatepassword', updatepassword);
router.patch('/resetpassword', resetpassword);

router.all('*', (req, res, next) => {
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

export { router as authRouter };
