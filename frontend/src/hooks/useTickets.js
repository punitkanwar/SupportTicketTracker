import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService.js';

export const TICKET_KEYS = {
  all: ['tickets'],
  list: (params) => ['tickets', 'list', params],
  detail: (id) => ['tickets', 'detail', id],
};

export function useTickets(params) {
  return useQuery({
    queryKey: TICKET_KEYS.list(params),
    queryFn: () => ticketService.getTickets(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: TICKET_KEYS.detail(id),
    queryFn: () => ticketService.getTicketById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ticketService.updateTicketStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
