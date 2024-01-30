// we need axios to make HTTP requests
import axios from 'axios';

// and we need jsdom and Readability to parse the article HTML
import JSDOM from 'jsdom';
import { Readability } from '@mozilla/readability';

// First lets get some search data from News API

// Build the URL we are going request. This will get articles related to Apple and sort them newest first
let url =
  'https://newsapi.org/v2/everything?' +
  'q=Apple&' +
  'sortBy=publishedAt&' +
  'apiKey=e8b56b684a684832bd1652868ff84caa';

const getFullContent = async () => {
  try {
    const res1 = await axios.get(url);
    let firstResult = res1.data.articles[0];

    const res2 = await axios.get(firstResult.url);
    let dom = new JSDOM(res2.data, { url: firstResult.url });

    let article = new Readability(dom.window.document).parse();
    console.log(article.textContent);
  } catch (error) {
    console.error('Error occured while getting content', error);
  }
};
