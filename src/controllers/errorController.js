class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500; // Internal Server Error code.
  let message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'Error',
    error_message: message,
  });
};

export { ApiError, ErrorHandler };
