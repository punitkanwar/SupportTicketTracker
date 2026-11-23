import ApiError from '../utils/ApiError.js';

const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];
const VALID_CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'priority', 'status'];


export const validatePagination = (req, res, next) => {
  let { page = '1', limit = '10' } = req.query;

  const filters = [
    ['status', VALID_STATUSES],
    ['category', VALID_CATEGORIES],
    ['priority', VALID_PRIORITIES],
  ];

  for (const [field, values] of filters) {
    const value = req.query[field];
    if (value !== undefined && value !== '' && (typeof value !== 'string' || !values.includes(value))) {
      return next(new ApiError(400, `Invalid ${field}`, [`${field} must be one of: ${values.join(', ')}`]));
    }
  }

  for (const field of ['search', 'sortBy', 'sortOrder']) {
    if (req.query[field] !== undefined && typeof req.query[field] !== 'string') {
      return next(new ApiError(400, `Invalid ${field}`, [`${field} must be a string`]));
    }
  }

  if (req.query.sortBy && !VALID_SORT_FIELDS.includes(req.query.sortBy)) {
    return next(new ApiError(400, 'Invalid sortBy', [`sortBy must be one of: ${VALID_SORT_FIELDS.join(', ')}`]));
  }

  if (req.query.sortOrder && !['asc', 'desc'].includes(req.query.sortOrder)) {
    return next(new ApiError(400, 'Invalid sortOrder', ['sortOrder must be asc or desc']));
  }

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  req.pagination = { page, limit };
  next();
};
