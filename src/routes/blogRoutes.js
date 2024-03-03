import express from 'express';
import axios from 'axios';

import { ApiError } from '../controllers/errorController.js';
import { BlogModel } from '../models/blogs.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.post('/post', protect, async (req, res, next) => {
  const {
    title,
    url,
    description,
    urlToImage,
    content,
    category,
    publishedAt,
  } = req.body;
  try {
    const blog = await BlogModel.create({
      title,
      url,
      description,
      urlToImage,
      content,
      category,
      publishedAt,
      author: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      blog,
      message: 'Blog created successfully.',
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const blogs = await BlogModel.find();
    res.status(200).json({ blogs });
  } catch (error) {
    console.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const blogs = await BlogModel.find({
      $text: { $search: req.body.keyword },
    });
    res.status(200).json({ blogs });
  } catch (error) {
    console.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/top', async (req, res) => {
  try {
    const topPosts = await BlogModel.find().sort({ likes: -1 }).limit(10); // Retrieve top 10 posts
    res.json(topPosts);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve top posts.' });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const latestPosts = await BlogModel.find()
      .sort({ createdAt: -1 })
      .limit(10);
    // Retrieve latest 10 posts
    res.json(latestPosts);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve latest posts.' });
  }
});

router.delete('/delete/:id', protect, async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      res.status(404).json({
        status: 'Failed',
        message: 'Blog not found..',
      });
    }
    if (req.user.id == blog.author.id || req.user.role == 'admin') {
      const response = await BlogModel.findByIdAndDelete(blog.id);
      res.status(200).json({
        status: 'success',
        message: response,
      });
    } else {
      return res.status(403).json({
        status: 'Failed',
        message: 'You are not allowed to perform this action.',
      });
    }
  } catch (error) {
    console.error(error.message);
    next(new ApiError(500, 'Internal server error.'));
  }
});

router.delete('/del-all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const blogs = await BlogModel.deleteMany();
    res.status(200).json({ blogs });
  } catch (error) {
    console.error(error);
  }
});

router.post(
  '/addposts',
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const url =
        'https://newsapi.org/v2/everything?' +
        `q=${req.body.query}&` +
        'language=en&' +
        `apiKey=${process.env.NEWSAPI_KEY}`;

      const response = await axios.get(url);

      res.status(201).json({
        status: 'success',
        Stories: response.data.articles,
        message: 'Blogs created successfully.',
      });
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

export { router as blogRouter };
