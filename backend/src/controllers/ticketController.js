import Ticket from '../models/Ticket.js';
import ApiError from '../utils/ApiError.js';

const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];
const VALID_CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'priority', 'status'];

const getRequestBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }
  return body;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


export const getTickets = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const { search, status, category, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};

    if (search && search.trim()) {

      filter.$or = [
        { subject: { $regex: escapeRegex(search.trim()), $options: 'i' } },
        { description: { $regex: escapeRegex(search.trim()), $options: 'i' } },
      ];
    }

    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    if (priority && VALID_PRIORITIES.includes(priority)) {
      filter.priority = priority;
    }

    const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    res.json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};


export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category, priority } = getRequestBody(req.body);

    const errors = [];
    if (typeof subject !== 'string') errors.push('Subject must be a string');
    else if (!subject.trim()) errors.push('Subject is required');
    if (typeof description !== 'string') errors.push('Description must be a string');
    else if (!description.trim()) errors.push('Description is required');
    if (typeof category !== 'string') errors.push('Category must be a string');
    else if (!category) errors.push('Category is required');
    else if (!VALID_CATEGORIES.includes(category)) errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    if (typeof priority !== 'string') errors.push('Priority must be a string');
    else if (!priority) errors.push('Priority is required');
    else if (!VALID_PRIORITIES.includes(priority)) errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', errors);
    }

    const ticket = new Ticket({
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'Open',
      statusHistory: [
        {
          previousStatus: null,
          newStatus: 'Open',
          changedAt: new Date(),
        },
      ],
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};


export const updateTicket = async (req, res, next) => {
  try {
    const body = getRequestBody(req.body);
    const allowedFields = ['subject', 'description', 'category', 'priority'];
    const unsupportedFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
    if (unsupportedFields.length > 0) {
      throw new ApiError(400, 'Unsupported ticket fields', unsupportedFields);
    }

    const { subject, description, category, priority } = body;
    const updateData = {};

    if (Object.keys(body).length === 0) {
      throw new ApiError(400, 'At least one ticket field must be provided');
    }
    if (subject !== undefined) {
      if (typeof subject !== 'string') throw new ApiError(400, 'Subject must be a string');
      updateData.subject = subject.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string') throw new ApiError(400, 'Description must be a string');
      updateData.description = description.trim();
    }
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        throw new ApiError(400, 'Invalid category', [`Category must be one of: ${VALID_CATEGORIES.join(', ')}`]);
      }
      updateData.category = category;
    }
    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        throw new ApiError(400, 'Invalid priority', [`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`]);
      }
      updateData.priority = priority;
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};


export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = getRequestBody(req.body);

    if (typeof status !== 'string' || !status) {
      throw new ApiError(400, 'Status is required');
    }

    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid status', [`Status must be one of: ${VALID_STATUSES.join(', ')}`]);
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    if (ticket.status === status) {
      return res.json({
        success: true,
        message: 'Status unchanged',
        data: { ticket },
      });
    }

    const previousStatus = ticket.status;
    ticket.status = status;
    ticket.statusHistory.push({
      previousStatus,
      newStatus: status,
      changedAt: new Date(),
    });

    await ticket.save();

    res.json({
      success: true,
      message: `Ticket status updated to "${status}"`,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};


export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
