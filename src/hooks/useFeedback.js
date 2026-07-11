import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useFeedback(feedbackId) {
  return useQuery({
    queryKey: ['feedback', feedbackId],
    queryFn: () => api.get(`/feedback/${feedbackId}`),
    staleTime: 30_000,
    retry: 2,
    select: (res) => res.data,
  });
}

export function useWebsiteFeedback(websiteId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit);
  const query = params.toString();

  return useQuery({
    queryKey: ['feedback', 'website', websiteId, filters],
    queryFn: () => api.get(`/feedback/website/${websiteId}${query ? `?${query}` : ''}`),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    select: (res) => res,
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/feedback/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ['feedback', id] });
      await queryClient.cancelQueries({ queryKey: ['feedback', 'website'] });
      await queryClient.cancelQueries({ queryKey: ['feedback', 'workspace'] });

      const previous = queryClient.getQueryData(['feedback', id]);
      const previousWebsiteLists = queryClient.getQueriesData({ queryKey: ['feedback', 'website'] });
      const previousWorkspaceLists = queryClient.getQueriesData({ queryKey: ['feedback', 'workspace'] });

      queryClient.setQueryData(['feedback', id], (old) => ({
        ...old,
        ...data,
      }));

      for (const [listKey] of previousWebsiteLists) {
        queryClient.setQueryData(listKey, (old) => ({
          ...old,
          data: old?.data?.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      }
      for (const [listKey] of previousWorkspaceLists) {
        queryClient.setQueryData(listKey, (old) => ({
          ...old,
          data: old?.data?.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      }

      return { previous, previousWebsiteLists, previousWorkspaceLists };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['feedback', variables.id], context.previous);
      }
      if (context?.previousWebsiteLists) {
        for (const [listKey, listData] of context.previousWebsiteLists) {
          queryClient.setQueryData(listKey, listData);
        }
      }
      if (context?.previousWorkspaceLists) {
        for (const [listKey, listData] of context.previousWorkspaceLists) {
          queryClient.setQueryData(listKey, listData);
        }
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['feedback', 'website'] });
      queryClient.invalidateQueries({ queryKey: ['feedback', 'workspace'] });
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.id] });
    },
  });
}

export function useFeedbackTimeline(feedbackId) {
  return useQuery({
    queryKey: ['timeline', feedbackId],
    queryFn: () => api.get(`/timeline/feedback/${feedbackId}`),
    staleTime: 10_000,
    select: (res) => res.data,
  });
}

export function useComments(feedbackId) {
  return useQuery({
    queryKey: ['comments', feedbackId],
    queryFn: () => api.get(`/comments/feedback/${feedbackId}`),
    staleTime: 10_000,
    select: (res) => res.data,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, body }) =>
      api.post(`/comments/feedback/${feedbackId}`, { body }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.feedbackId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.feedbackId] });
    },
  });
}

export function useWorkspaceStats(workspaceId) {
  return useQuery({
    queryKey: ['analytics', 'overview', workspaceId],
    queryFn: () => api.get(`/analytics/overview/${workspaceId}`),
    staleTime: 60_000,
    enabled: !!workspaceId,
    select: (res) => res.data,
  });
}
