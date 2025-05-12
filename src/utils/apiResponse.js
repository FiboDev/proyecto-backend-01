/**
 * Clase para estandarizar las respuestas de la API
 */
class ApiResponse {
  /**
   * Genera una respuesta exitosa
   * @param {Object} data - Datos a devolver
   * @param {String} message - Mensaje de éxito
   * @param {Number} statusCode - Código de estado HTTP
   * @returns {Object} Objeto de respuesta estandarizado
   */
  static success(data, message = 'Operación exitosa', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  /**
   * Genera una respuesta de error
   * @param {String} message - Mensaje de error
   * @param {Number} statusCode - Código de estado HTTP
   * @param {Array|Object} errors - Errores adicionales
   * @returns {Object} Objeto de respuesta estandarizado
   */
  static error(message = 'Error en la operación', statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode
    };
  }

  /**
   * Genera una respuesta para recursos no encontrados
   * @param {String} message - Mensaje de error
   * @returns {Object} Objeto de respuesta estandarizado
   */
  static notFound(message = 'Recurso no encontrado') {
    return this.error(message, 404);
  }

  /**
   * Genera una respuesta para errores de validación
   * @param {Array|Object} errors - Errores de validación
   * @param {String} message - Mensaje de error
   * @returns {Object} Objeto de respuesta estandarizado
   */
  static validationError(errors, message = 'Error de validación') {
    return this.error(message, 400, errors);
  }
}

module.exports = ApiResponse;
