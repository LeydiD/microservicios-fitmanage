import axios from "axios";

class ApiClient {
  constructor() {
    this.gatewayUrl = process.env.API_GATEWAY_URL || "http://fitmanage_gateway:3000";
    this.timeout = 10000; // 10 segundos
  }

  // Cliente HTTP configurado para usar el API Gateway
  createHttpClient() {
    return axios.create({
      baseURL: this.gatewayUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Enviar notificación a través del API Gateway
  async enviarNotificacion(destinatario, asunto, mensaje, tipo = "email") {
    try {
      const httpClient = this.createHttpClient();
      const response = await httpClient.post(
        "/api/notificaciones/notificaciones/email",
        {
          destinatario,
          asunto,
          mensaje,
          tipo,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error enviando notificación: ${error.message}`);
      throw new Error(`Error enviando notificación: ${error.message}`);
    }
  }

  // Obtener las últimas suscripciones para una lista de clientes (batch)
  async obtenerUltimasSuscripciones(clientesIds = []) {
    try {
      const httpClient = this.createHttpClient();
      const response = await httpClient.post(
        "/api/afiliaciones/suscripciones/ultimas",
        { clientes: clientesIds }
      );
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo ultimas suscripciones: ${error.message}`);
      throw new Error(
        `Error obteniendo ultimas suscripciones: ${error.message}`
      );
    }
  }
}

// Singleton para reutilizar la instancia
const apiClient = new ApiClient();

export default apiClient;
