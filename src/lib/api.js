const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.token = null;
    this.refreshing = false;
    this.refreshQueue = [];
    this.timeout = 30000;
  }

  setToken(token) {
    this.token = token;
  }

  headers() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async refreshToken() {
    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('pp_token', data.data.token);
      return data.data.token;
    }
    throw new Error('Refresh failed');
  }

  async request(method, path, body = null, isRetry = false) {
    const url = `${this.baseUrl}${path}`;
    const options = { method, headers: this.headers() };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    options.signal = controller.signal;

    try {
      const res = await fetch(url, options);

      if (res.status === 401 && !isRetry) {
        clearTimeout(timeoutId);
        if (!this.refreshing) {
          this.refreshing = true;
          try {
            await this.refreshToken();
            this.refreshing = false;
            const queue = this.refreshQueue;
            this.refreshQueue = [];
            queue.forEach(({ resolve }) => resolve(this.request(method, path, body, true)));
            return this.request(method, path, body, true);
          } catch (err) {
            this.refreshing = false;
            const queue = this.refreshQueue;
            this.refreshQueue = [];
            queue.forEach(({ reject }) => reject(err));
            localStorage.removeItem('pp_token');
            this.token = null;
            window.location.href = '/auth/login';
            return { success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Session expired' } };
          }
        } else {
          return new Promise((resolve, reject) => {
            this.refreshQueue.push({ resolve, reject });
          });
        }
      }

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || { code: 'ERROR', message: 'Request failed' } };
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message } };
    }
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, body) {
    return this.request('POST', path, body);
  }

  put(path, body) {
    return this.request('PUT', path, body);
  }

  patch(path, body) {
    return this.request('PATCH', path, body);
  }

  del(path) {
    return this.request('DELETE', path);
  }
}

export const api = new ApiClient();
