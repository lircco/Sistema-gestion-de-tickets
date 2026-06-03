const BASE_URL = '/api';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken'),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Error en la petición');
  }

  return data;
}

export const api = {
  login: (username, password) =>
    apiFetch('/login/', { method: 'POST', body: JSON.stringify({ username, password }) }),

  register: (username, password, email, first_name = '', last_name = '') =>
    apiFetch('/registro/', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        password_confirm: password,
        email,
        first_name,
        last_name
      })
    }),

  logout: () =>
    apiFetch('/logout/', { method: 'POST' }),

  getMe: () =>
    apiFetch('/me/'),

  getTickets: () =>
    apiFetch('/tickets/'),

  createTicket: (ticketData) => {
    if (ticketData instanceof FormData) {
      return fetch(`${BASE_URL}/tickets/`, {
        method: 'POST',
        body: ticketData,
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
      }).then(res => res.json());
    }
    return apiFetch('/tickets/', { method: 'POST', body: JSON.stringify(ticketData) });
  },

  getStats: () =>
    apiFetch('/tickets/estadisticas/'),

  getAreas: () =>
    apiFetch('/areas/'),

  getCategorias: () =>
    apiFetch('/categorias/'),
};
