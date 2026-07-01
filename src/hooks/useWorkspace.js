import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProjects(workspaceId) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => api.get(`/projects/workspace/${workspaceId}`),
    staleTime: 30_000,
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, ...data }) => api.post(`/projects/workspace/${workspaceId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useWebsites(projectId) {
  return useQuery({
    queryKey: ['websites', projectId],
    queryFn: () => api.get(`/websites/project/${projectId}`),
    staleTime: 30_000,
    select: (res) => res.data,
    enabled: !!projectId,
  });
}

export function useCreateWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...data }) => api.post(`/websites/project/${projectId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['websites'] }),
  });
}

export function useWorkspaceFeedback(workspaceId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters.projectId) params.set('projectId', filters.projectId);
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit);
  const query = params.toString();

  return useQuery({
    queryKey: ['feedback', 'workspace', workspaceId, filters],
    queryFn: () => api.get(`/feedback/workspace/${workspaceId}${query ? `?${query}` : ''}`),
    staleTime: 15_000,
    select: (res) => res,
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => api.get(`/workspaces/${workspaceId}/members`),
    staleTime: 30_000,
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, ...data }) => api.post(`/workspaces/${workspaceId}/members`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId, role }) => api.put(`/workspaces/${workspaceId}/members/${userId}`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId }) => api.del(`/workspaces/${workspaceId}/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
    staleTime: 30_000,
    select: (res) => res.data,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useActivityFeed(workspaceId) {
  return useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: () => api.get(`/analytics/activity/${workspaceId}`),
    staleTime: 15_000,
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useFeedbackTrends(workspaceId) {
  return useQuery({
    queryKey: ['trends', workspaceId],
    queryFn: () => api.get(`/analytics/trends/${workspaceId}?days=30`),
    staleTime: 60_000,
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useWorkspace(workspaceId) {
  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => api.get(`/workspaces/${workspaceId}`),
    staleTime: 60_000,
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => api.get('/workspaces/invitations'),
    staleTime: 30_000,
    select: (res) => res.data || [],
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/workspaces/invitations/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/workspaces/invitations/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/workspaces/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace'] }),
  });
}
