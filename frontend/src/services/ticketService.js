import api from './api.js';

export const ticketService = {

  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data.data;
  },


  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data.ticket;
  },


  createTicket: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data.data.ticket;
  },


  updateTicket: async (id, data) => {
    const response = await api.patch(`/tickets/${id}`, data);
    return response.data.data.ticket;
  },


  updateTicketStatus: async (id, status) => {
    const response = await api.patch(`/tickets/${id}/status`, { status });
    return response.data.data.ticket;
  },


  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },
};
