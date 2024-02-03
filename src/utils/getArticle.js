// we need axios to make HTTP requests
import axios from 'axios';

// and we need jsdom and Readability to parse the article HTML
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// Build the URL we are going request. This will get articles related to Apple and sort them newest first

const getArticle = async (post) => {
  try {
    const res = await axios.get(post.url);
    let dom = new JSDOM(res.data, { url: post.url });

    let article = new Readability(dom.window.document).parse();
    return article;
  } catch (error) {
    console.error('Error occurred while getting content for', post.url, error);
    // Handle the error gracefully, you might want to return a default or empty article object.
    return { title: 'Error', content: 'Failed to fetch article content.' };
  }
};

export default getArticle;
