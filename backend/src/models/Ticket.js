import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', null],
      default: null,
    },
    newStatus: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [120, 'Subject cannot exceed 120 characters'],
      minlength: [3, 'Subject must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Technical', 'Billing', 'Account', 'General', 'Other'],
        message: 'Category must be one of: Technical, Billing, Account, General, Other',
      },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: 'Priority must be one of: Low, Medium, High, Urgent',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: 'Status must be one of: Open, In Progress, Resolved',
      },
      default: 'Open',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ subject: 'text', description: 'text' });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
