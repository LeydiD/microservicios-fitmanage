import axios from 'axios';

class ApiClient {
  constructor() {
    this.gatewayUrl = process.env.API_GATEWAY_URL || 'http://fitmanage_gateway:3000';
    this.timeout = 10000; // 10 segundos
  }

  // Cliente HTTP configurado para usar el API Gateway
  createHttpClient() {
    return axios.create({
      baseURL: this.gatewayUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Verificar si un cliente existe en el microservicio de usuarios
  async verificarClienteExiste(clienteId) {
    try {
      const httpClient = this.createHttpClient();
      const response = await httpClient.get(`/api/usuarios/clientes/${clienteId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Cliente con ID ${clienteId} no encontrado`);
      }
      throw new Error(`Error verificando cliente: ${error.message}`);
    }
  }

  // Obtener información completa de un cliente
  async obtenerInfoCliente(clienteId) {
    try {
      const httpClient = this.createHttpClient();
      const response = await httpClient.get(`/api/usuarios/clientes/${clienteId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Cliente con ID ${clienteId} no encontrado`);
      }
      throw new Error(`Error obteniendo información del cliente: ${error.message}`);
    }
  }

  // Verificar si un cliente tiene membresía activa
  async verificarMembresiaActiva(clienteId) {
    try {
      const httpClient = this.createHttpClient();
      // Llamar al propio servicio de afiliaciones a través del gateway
      const response = await httpClient.get(`/api/afiliaciones/suscripciones/cliente/${clienteId}/activa`);
      return response.data.tieneActiva || false;
    } catch (error) {
      if (error.response?.status === 404) {
        return false; // No tiene membresía activa
      }
      throw new Error(`Error verificando membresía activa: ${error.message}`);
    }
  }

  // Enviar notificación a través del microservicio de notificaciones
  async enviarNotificacion(clienteId, mensaje, tipo = 'info') {
    try {
      const httpClient = this.createHttpClient();
      const response = await httpClient.post('/api/notificaciones/enviar', {
        clienteId,
        mensaje,
        tipo
      });
      return response.data;
    } catch (error) {
      console.warn(`Error enviando notificación: ${error.message}`);
      // No lanzar error para que no afecte el flujo principal
    }
  }
}

// Singleton para reutilizar la instancia
const apiClient = new ApiClient();

export default apiClient;
