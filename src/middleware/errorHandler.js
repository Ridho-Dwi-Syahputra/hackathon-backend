//middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan pada server';
  
    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      statusCode = 400;
      message = 'Data sudah ada';
    }
  
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      statusCode = 400;
      message = 'Data referensi tidak ditemukan';
    }
  
    res.status(statusCode).json({
      success: false,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorHandler;