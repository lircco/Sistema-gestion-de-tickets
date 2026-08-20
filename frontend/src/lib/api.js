const API = import.meta.env.VITE_API_URL;
const BASE_URL = `${API}/api/`;

export const api = {
  login: async (username, password) => {
    const response = await fetch(`${BASE_URL}token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas o usuario inexistente");
    }

    const tokenData = await response.json();
    localStorage.setItem("access_token", tokenData.access);
    localStorage.setItem("refresh_token", tokenData.refresh);

    const profileResponse = await fetch(`${BASE_URL}me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Error al cargar el perfil del usuario");
    }

    return await profileResponse.json();
  },

    // 2. FUNCIÓN DE REGISTRO
    register: async (username, password, email, first_name, last_name, password_confirm) => {
        const response = await fetch(`${BASE_URL}registro/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, first_name, last_name, password_confirm })
        });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Error al crear la cuenta. Intente con otro correo.");
    }

    return await response.json();
  },

  // 3. BUSCAR ÁREAS
  getAreas: async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}areas/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("No se pudieron cargar las áreas");
    return await response.json();
  },

  // 4. BUSCAR CATEGORÍAS
  getCategorias: async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}categorias/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("No se pudieron cargar las categorías");
    return await response.json();
  },

  // 5. CREAR UN TICKET NUEVO (Soporta archivos y texto)
  createTicket: async (ticketData) => {
    const token = localStorage.getItem("access_token");

    // Imprimimos en la consola del navegador (F12) para chusmear qué llega
    console.log("Datos que recibe api.js:", ticketData);

    // Preparamos las cabeceras base (Solo el token)
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let bodyData;

    // ¿Viene con formato de archivos (FormData)?
    if (ticketData instanceof FormData) {
      bodyData = ticketData;
      // IMPORTANTE: No le ponemos 'Content-Type'.
      // Fetch es inteligente y le pone 'multipart/form-data' automáticamente.
    } else {
      // Si es un objeto de texto normal, lo convertimos a JSON
      bodyData = JSON.stringify(ticketData);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BASE_URL}tickets/`, {
      method: "POST",
      headers: headers,
      body: bodyData,
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Motivo del rechazo de Django:", errData);
      const mensajeError = errData.detail || JSON.stringify(errData);
      throw new Error(mensajeError);
    }

    return await response.json();
  },

  // 6. BUSCAR MIS TICKETS (Pasando el token para que Django me reconozca)
  getTickets: async () => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${BASE_URL}tickets/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar los tickets");
    }
    return await response.json();
  },

  // 6b. ACTUALIZAR UN TICKET (Derivar / Cambiar Estado / Cerrar)
  updateTicket: async (id, data) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}tickets/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || JSON.stringify(errData) || "No se pudo actualizar el ticket");
    }
    return await response.json();
  },

  // 6c. ENVIAR UNA RESPUESTA REAL A UN TICKET
  enviarRespuesta: async (id, mensaje) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}tickets/${id}/responder/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mensaje }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "No se pudo enviar la respuesta");
    }
    return await response.json();
  },

  // 7. USUARIO ACTUAL
  getMe: async () => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${BASE_URL}me/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("No se pudo cargar el usuario actual");
    }
    return await response.json();
  },

  // 8. CERRAR SESIÓN
  logout: async () => {
    const token = localStorage.getItem('access_token');

    try {
        await fetch(`${BASE_URL}logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (e) {
        console.error("Error al cerrar sesión en el servidor", e);
    } finally {
        // Siempre limpiamos los tokens locales, incluso si el servidor falla.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
  },

  // 9. ESTADÍSTICAS DE TICKETS
  getStats: async () => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${BASE_URL}tickets/estadisticas/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("No se pudieron cargar las estadísticas");
    }
    return await response.json();
  },

  // --- SUMAMOS TU NUEVA FUNCIÓN DE RECUPERACIÓN AQUÍ ---
  recuperarPassword: async (email) => {
    const response = await fetch(`${BASE_URL}auth/recuperar-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || errData.detail || "Error al procesar la solicitud.");
    }
    return await response.json();
  },

  // --- CAMBIAR CONTRASEÑA (usuario ya logueado, desde su perfil) ---
  changePassword: async (passwordActual, passwordNueva) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}auth/cambiar-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password_actual: passwordActual, password_nueva: passwordNueva }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || errData.detail || "No se pudo actualizar la contraseña.");
    }
    return await response.json();
  }
};
