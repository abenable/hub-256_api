import { ApiError } from '../controllers/errorController.js';
import { UserModel } from '../models/users.js';

export const allUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    new ApiError(500, 'An error occurred while fetching users.');
  }
};
export const userProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.json(user);
  } catch (error) {
    new ApiError(500, 'An error occurred while fetching user profile.');
  }
};

export const delUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    new ApiError(500, 'An error occurred while deleting the user.');
  }
};

export const searchUser = async (req, res) => {
  try {
    const query = new RegExp(req.query.name);
    const user = await UserModel.find({
      $or: [
        { username: { $regex: query } },
        { firstName: { $regex: query } },
        { lastName: { $regex: query } },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    new ApiError(500, 'An error occurred while searching for the user.');
  }
};
