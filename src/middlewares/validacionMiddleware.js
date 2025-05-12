/**
 * Middleware para validar datos de libros
 */
const validarLibro = (req, res, next) => {
  const { titulo, autor, isbn, genero, anioPublicacion, editorial } = req.body;
  
  const errores = [];
  
  // Validar que los campos obligatorios existan
  if (!titulo) errores.push('El título es obligatorio');
  if (!autor) errores.push('El autor es obligatorio');
  if (!isbn) errores.push('El ISBN es obligatorio');
  if (!genero) errores.push('El género es obligatorio');
  if (!editorial) errores.push('La editorial es obligatoria');
  
  // Validar año de publicación
  if (!anioPublicacion) {
    errores.push('El año de publicación es obligatorio');
  } else if (isNaN(Number(anioPublicacion))) {
    errores.push('El año de publicación debe ser un número');
  } else if (Number(anioPublicacion) < 0 || Number(anioPublicacion) > new Date().getFullYear()) {
    errores.push(`El año de publicación debe ser entre 0 y ${new Date().getFullYear()}`);
  }
  
  // Validar formato ISBN (simplificado)
  if (isbn && (!/^[0-9-]{10,17}$/.test(isbn))) {
    errores.push('El ISBN debe tener un formato válido');
  }
  
  // Si hay errores, devolver respuesta de error
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Error de validación',
        detalles: errores
      }
    });
  }
  
  // Si todo está bien, continuar
  next();
};

/**
 * Middleware para validar datos de usuarios
 */
const validarUsuario = (req, res, next) => {
  const { nombre, apellido, email, password, rol } = req.body;
  
  const errores = [];
  
  // Validar que los campos obligatorios existan
  if (!nombre) errores.push('El nombre es obligatorio');
  if (!apellido) errores.push('El apellido es obligatorio');
  if (!email) errores.push('El email es obligatorio');
  
  // Validar campos según la acción (crear o actualizar)
  if (req.method === 'POST' && !password) {
    errores.push('La contraseña es obligatoria');
  }
  
  // Validar formato de email
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errores.push('El formato del email es inválido');
  }
  
  // Validar longitud de contraseña
  if (password && password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  // Validar rol si está presente
  if (rol && !['usuario', 'bibliotecario', 'admin'].includes(rol)) {
    errores.push('El rol debe ser usuario, bibliotecario o admin');
  }
  
  // Si hay errores, devolver respuesta de error
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Error de validación',
        detalles: errores
      }
    });
  }
  
  // Si todo está bien, continuar
  next();
};

/**
 * Middleware para validar cambio de contraseña
 */
const validarCambioPassword = (req, res, next) => {
  const { passwordActual, nuevaPassword, confirmarPassword } = req.body;
  
  const errores = [];
  
  // Validar que los campos obligatorios existan
  if (!passwordActual) errores.push('La contraseña actual es obligatoria');
  if (!nuevaPassword) errores.push('La nueva contraseña es obligatoria');
  if (!confirmarPassword) errores.push('La confirmación de contraseña es obligatoria');
  
  // Validar que la nueva contraseña y la confirmación coincidan
  if (nuevaPassword && confirmarPassword && nuevaPassword !== confirmarPassword) {
    errores.push('La nueva contraseña y la confirmación no coinciden');
  }
  
  // Validar longitud de la nueva contraseña
  if (nuevaPassword && nuevaPassword.length < 6) {
    errores.push('La nueva contraseña debe tener al menos 6 caracteres');
  }
  
  // Si hay errores, devolver respuesta de error
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Error de validación',
        detalles: errores
      }
    });
  }
  
  // Si todo está bien, continuar
  next();
};

/**
 * Middleware para validar datos de login
 */
const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  const errores = [];
  
  // Validar que los campos obligatorios existan
  if (!email) errores.push('El email es obligatorio');
  if (!password) errores.push('La contraseña es obligatoria');
  
  // Validar formato de email
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errores.push('El formato del email es inválido');
  }
  
  // Si hay errores, devolver respuesta de error
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Error de validación',
        detalles: errores
      }
    });
  }
  
  // Si todo está bien, continuar
  next();
};

/**
 * Middleware general para validar campos según la ruta
 */
const validarCampos = (req, res, next) => {
  const ruta = req.originalUrl.split('/').pop();
  
  switch (ruta) {
    case 'libros':
      return validarLibro(req, res, next);
    case 'usuarios':
      return validarUsuario(req, res, next);
    case 'login':
      return validarLogin(req, res, next);
    case 'cambiar-password':
      return validarCambioPassword(req, res, next);
    default:
      next();
  }
};

module.exports = {
  validarLibro,
  validarUsuario,
  validarLogin,
  validarCambioPassword,
  validarCampos
};
