/**
 * Response Helper Utility
 * Universal functions untuk standardisasi format API response
 * Menyediakan format yang konsisten untuk frontend Android
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

/**
 * Generate timestamp dalam format ISO
 * @returns {string} ISO timestamp
 */
const getTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Success response dengan format konsisten
 * @param {Object} res - Express response object
 * @param {any} data - Data yang akan dikirim (default: null)
 * @param {string} message - Success message (default: "Success")
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Express response dengan JSON format standar
 * 
 * @example
 * return successResponse(res, userData, "User created successfully", 201);
 */
const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
    const response = {
        success: true,
        message: message,
        data: data,
        timestamp: getTimestamp(),
        statusCode: statusCode
    };
    
    return res.status(statusCode).json(response);
};

/**
 * Error response dengan format konsisten
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: "Internal Server Error")
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any} errors - Detail errors (optional)
 * @returns {Object} Express response dengan JSON format standar
 * 
 * @example
 * return errorResponse(res, "Email already exists", 409);
 */
const errorResponse = (res, message = "Internal Server Error", statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message: message,
        data: null,
        timestamp: getTimestamp(),
        statusCode: statusCode
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

/**
 * Response untuk resource yang baru dibuat (201 Created)
 * @param {Object} res - Express response object
 * @param {any} data - Created resource data
 * @param {string} message - Success message (default: "Resource created successfully")
 * @returns {Object} Express response dengan status 201
 */
const createdResponse = (res, data, message = "Resource created successfully") => {
    return successResponse(res, data, message, 201);
};

/**
 * Response untuk validation errors (400 Bad Request)
 * @param {Object} res - Express response object
 * @param {Array|string} validationErrors - Validation errors
 * @param {string} message - Main error message (default: "Validation failed")
 * @returns {Object} Express response dengan status 400
 */
const validationErrorResponse = (res, validationErrors, message = "Validation failed") => {
    let formattedErrors = validationErrors;
    
    // Format jika berupa string tunggal
    if (typeof validationErrors === 'string') {
        formattedErrors = [{ message: validationErrors }];
    }
    
    return errorResponse(res, message, 400, formattedErrors);
};

/**
 * Response untuk unauthorized access (401)
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (default: "Unauthorized access")
 * @returns {Object} Express response dengan status 401
 */
const unauthorizedResponse = (res, message = "Unauthorized access") => {
    return errorResponse(res, message, 401);
};

/**
 * Response untuk resource not found (404)
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (default: "Resource not found")
 * @returns {Object} Express response dengan status 404
 */
const notFoundResponse = (res, message = "Resource not found") => {
    return errorResponse(res, message, 404);
};

/**
 * Response untuk conflict/duplicate (409)
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (default: "Resource already exists")
 * @returns {Object} Express response dengan status 409
 */
const conflictResponse = (res, message = "Resource already exists") => {
    return errorResponse(res, message, 409);
};

/**
 * Response untuk pagination data
 * @param {Object} res - Express response object
 * @param {Array} data - Array data
 * @param {Object} pagination - Pagination info {currentPage, totalItems, itemsPerPage}
 * @param {string} message - Success message (default: "Data retrieved successfully")
 * @returns {Object} Express response dengan pagination info
 */
const paginatedResponse = (res, data, pagination, message = "Data retrieved successfully") => {
    const { currentPage, totalItems, itemsPerPage } = pagination;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const response = {
        success: true,
        message: message,
        data: data,
        pagination: {
            currentPage: parseInt(currentPage),
            totalPages: totalPages,
            totalItems: parseInt(totalItems),
            itemsPerPage: parseInt(itemsPerPage),
            hasNext: currentPage < totalPages,
            hasPrevious: currentPage > 1
        },
        timestamp: getTimestamp(),
        statusCode: 200
    };
    
    return res.status(200).json(response);
};

module.exports = {
    successResponse,
    errorResponse,
    createdResponse,
    validationErrorResponse,
    unauthorizedResponse,
    notFoundResponse,
    conflictResponse,
    paginatedResponse,
    getTimestamp
};