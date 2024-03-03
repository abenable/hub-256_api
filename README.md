# API Documentation

This repository contains the source code for an API built with Express.js and MongoDB. The API provides various endpoints for authentication, user management, and blog functionality.

## Prerequisites

Before running the API, make sure you have the following installed:

- Node.js and npm
- MongoDB

## Setup

To set up the API, follow these steps:

1. Clone the repository.
2. Install dependencies by running `npm install`.
3. Create a `.env` file in the root directory and set the following environment variables:
   - `PORT`: the port number for the server to listen on
   - `NODE_ENV`: the environment (e.g., "development" or "production")
   - `LOCAL_URI`: the MongoDB connection URI for the development environment
   - `URI`: the MongoDB connection URI for the production environment

## Usage

To start the server, run `npm start`. Once the server is running, you can access the following API endpoints:

- Home: `GET /`
- Authentication: `POST /auth/register`, `POST /auth/login`, etc.
- User: `GET /users/:id`, `POST /users`, `PUT /users/:id`, etc.
- Blog: `GET /blog/:id`, `POST /blog`, `PUT /blog/:id`, etc.
