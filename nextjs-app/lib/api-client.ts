/**
 * Client-side API utility for consuming Next.js API routes.
 * Uses native fetch with automatic session handling via NextAuth.
 */

interface ApiResponse<T> {
  data: T;
  status: number;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'API Error');
    (error as any).status = response.status;
    (error as any).data = data;

    if (response.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    }

    throw error;
  }

  return {
    data,
    status: response.status,
  };
}

// Pushups API
export const pushupsApi = {
  create: (count: number, date?: string): Promise<ApiResponse<any>> =>
    fetchApi('/api/pushups', {
      method: 'POST',
      body: JSON.stringify({ count, date }),
    }),

  getAll: (take = 30, skip = 0): Promise<ApiResponse<any>> =>
    fetchApi(`/api/pushups?take=${take}&skip=${skip}`),

  getToday: (): Promise<ApiResponse<any>> =>
    fetchApi('/api/pushups/today'),

  update: (id: number, count: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/pushups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ count }),
    }),

  delete: (id: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/pushups/${id}`, {
      method: 'DELETE',
    }),
};

// Groups API
export const groupsApi = {
  create: (name: string): Promise<ApiResponse<any>> =>
    fetchApi('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getAll: (): Promise<ApiResponse<any>> =>
    fetchApi('/api/groups'),

  getOne: (id: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/groups/${id}`),

  join: (inviteCode: string): Promise<ApiResponse<any>> =>
    fetchApi('/api/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  getMembers: (id: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/groups/${id}/members`),

  getLeaderboard: (id: number, period: 'today' | 'week' | 'month' = 'week'): Promise<ApiResponse<any>> =>
    fetchApi(`/api/groups/${id}/leaderboard?period=${period}`),

  leave: (id: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/groups/${id}/leave`, {
      method: 'DELETE',
    }),

  removeMember: (groupId: number, memberId: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    }),
};

// Stats API
export const statsApi = {
  getPersonal: (): Promise<ApiResponse<any>> =>
    fetchApi('/api/stats/personal'),

  getGroup: (id: number): Promise<ApiResponse<any>> =>
    fetchApi(`/api/stats/group/${id}`),
};

export default fetchApi;
