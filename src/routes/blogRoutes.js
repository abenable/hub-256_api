import express from 'express';
import axios from 'axios';

import { ApiError } from '../controllers/errorController.js';
import { BlogModel } from '../models/blogs.js';
import { protect, restrictTo } from '../controllers/authController.js';
import getArticle from '../utils/getArticle.js';
import { assign } from 'nodemailer/lib/shared/index.js';

const router = express.Router();

router.post('/post', protect, async (req, res, next) => {
  const {
    title,
    url,
    description,
    urlToImage,
    content,
    category,
    tags,
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
      tags,
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

router.post(
  '/postMultiple',
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const blogs = await BlogModel.create(req.body);

      res.status(201).json({
        status: 'success',
        blogs,
        message: 'Blogs created successfully.',
      });
    } catch (error) {
      console.error(error);
      next(new ApiError(500, 'internal server error'));
    }
  }
);

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

// router.get('/trending', async (req, res) => {
//   const timeSpan = 7 * 24 * 60 * 60 * 1000; // 24 hours in milliseconds
//   const currentTime = Date.now();

//   try {
//     const trendingPosts = await BlogModel.find({
//       createdAt: { $gte: currentTime - timeSpan },
//     })
//       .sort({ reads: -1 })
//       .limit(10);
//     res.json(trendingPosts);
//   } catch (error) {
//     res.status(500).json({ error: 'Could not retrieve trending posts.' });
//   }
// });

// Route to randomly select a recent post as recommended for one hour
router.get('/recommended', async (req, res) => {
  try {
    // Calculate the date one week ago from the current date
    const aWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Find all posts created within the last week
    const recentPosts = await BlogModel.find({
      createdAt: { $gte: aWeekAgo },
    });

    if (recentPosts.length === 0) {
      return res.status(404).json({ error: 'No recent posts found.' });
    }

    // Randomly select one post from the recent posts
    const randomIndex = Math.floor(Math.random() * recentPosts.length);
    const recommendedPost = recentPosts[randomIndex];

    // Set the recommendedByEditor field to true for the selected post
    recommendedPost.recommendedByEditor = true;
    await recommendedPost.save();

    // Schedule a task to reset the recommendedByEditor field to false after one hour
    setTimeout(async () => {
      recommendedPost.recommendedByEditor = false;
      await recommendedPost.save();
    }, 3600000); // One hour in milliseconds

    res.json(recommendedPost);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: 'Could not retrieve or set recommended post.' });
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
      const top_articles = response.data.articles.slice(0, 16);
      console.log(top_articles);

      const final_posts = top_articles.map(async (article) => {
        let post_content = await getArticle(article);
        return { ...article, content: post_content };
      });
      console.log(final_posts);

      const blogs = await BlogModel.create(final_posts);

      res.status(201).json({
        status: 'success',
        blogs,
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
