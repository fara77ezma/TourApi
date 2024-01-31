class AppError extends Error {
  constructor(message, statusCode) {
    // console.error('Error details:', error);

    super(message);
    // console.log(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // `` to convert the number to string, startsWith is a js function for strings
    this.isOpertional = true; // because we will use this class to handle opretional errors
    //   console.log(this);
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
