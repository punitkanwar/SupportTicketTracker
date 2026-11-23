import express from 'express';
import { getTickets, getTicketById, createTicket, updateTicket, updateTicketStatus, deleteTicket } from '../controllers/ticketController.js';
import { validatePagination } from '../middleware/validateRequest.js';

const router = express.Router();

router.get('/', validatePagination, getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicket);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', deleteTicket);

export default router;
