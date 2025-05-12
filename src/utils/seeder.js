const mongoose = require('mongoose');
const Usuario = require('../models/usuario.model');
const Libro = require('../models/libro.model');
const Reserva = require('../models/reserva.model');
const bcrypt = require('bcryptjs');

/**
 * Seeder para crear datos de prueba
 */

// Función para generar hash de contraseña
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Usuarios de prueba
const crearUsuarios = async () => {
  try {
    // Eliminar usuarios existentes
    await Usuario.deleteMany({});
    
    // Crear usuarios con diferentes permisos
    const usuariosData = [
      {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@biblioteca.com',
        password: await hashPassword('admin123'),
        permisos: {
          admin: true,
          gestionarLibros: true,
          gestionarReservas: true,
          verUsuarios: true,
          crearUsuarios: true,
          verReservas: true
        },
        estado: true
      },
      {
        nombre: 'Bibliotecario',
        apellido: 'Principal',
        email: 'bibliotecario@biblioteca.com',
        password: await hashPassword('biblioteca123'),
        permisos: {
          admin: false,
          gestionarLibros: true,
          editarLibro: true,
          eliminarLibro: true,
          gestionarReservas: true,
          verUsuarios: true,
          crearUsuarios: false,
          verReservas: true
        },
        estado: true
      },
      {
        nombre: 'Ayudante',
        apellido: 'Biblioteca',
        email: 'ayudante@biblioteca.com',
        password: await hashPassword('ayudante123'),
        permisos: {
          admin: false,
          gestionarLibros: false,
          gestionarReservas: true,
          verUsuarios: false,
          crearUsuarios: false,
          verReservas: true
        },
        estado: true
      },
      {
        nombre: 'Usuario',
        apellido: 'Regular',
        email: 'usuario@ejemplo.com',
        password: await hashPassword('usuario123'),
        permisos: {
          admin: false,
          gestionarLibros: false,
          gestionarReservas: false,
          verUsuarios: false,
          crearUsuarios: false,
          verReservas: false
        },
        estado: true
      },
      {
        nombre: 'Usuario',
        apellido: 'Inactivo',
        email: 'inactivo@ejemplo.com',
        password: await hashPassword('inactivo123'),
        permisos: {
          admin: false,
          gestionarLibros: false,
          gestionarReservas: false,
          verUsuarios: false,
          crearUsuarios: false,
          verReservas: false
        },
        estado: false
      }
    ];
    
    const usuarios = await Usuario.insertMany(usuariosData);
    console.log(`✅ ${usuarios.length} usuarios creados`);
    return usuarios;
  } catch (error) {
    console.error('Error creando usuarios:', error);
    throw error;
  }
};

// Libros de prueba
const crearLibros = async () => {
  try {
    // Eliminar libros existentes
    await Libro.deleteMany({});
    
    // Crear libros con diferentes géneros y disponibilidad
    const librosData = [
      {
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        isbn: '9780307474728',
        editorial: 'Vintage Español',
        genero: 'Realismo mágico',
        anioPublicacion: 1967,
        descripcion: 'La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.',
        disponible: true,
        cantidadDisponible: 3,
        activo: true
      },
      {
        titulo: '1984',
        autor: 'George Orwell',
        isbn: '9780451524935',
        editorial: 'Signet Classic',
        genero: 'Distopía',
        anioPublicacion: 1949,
        descripcion: 'Una sociedad distópica controlada por un régimen totalitario y vigilada constantemente por el Gran Hermano.',
        disponible: true,
        cantidadDisponible: 5,
        activo: true
      },
      {
        titulo: 'El Hobbit',
        autor: 'J.R.R. Tolkien',
        isbn: '9780547928227',
        editorial: 'Houghton Mifflin',
        genero: 'Fantasía',
        anioPublicacion: 1937,  // Cambiado de "añoPublicacion" a "anioPublicacion"
        descripcion: 'Las aventuras de Bilbo Bolsón, que emprende un viaje para ayudar a un grupo de enanos a recuperar su tesoro.',
        disponible: true,
        cantidadDisponible: 0, // No hay unidades disponibles
        activo: true
      },
      {
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        isbn: '9788420412146',
        editorial: 'Cátedra',
        genero: 'Novela',
        anioPublicacion: 1605,  // Cambiado de "añoPublicacion" a "anioPublicacion"
        descripcion: 'Las aventuras del ingenioso hidalgo Don Quijote de la Mancha y su fiel escudero Sancho Panza.',
        disponible: true,
        cantidadDisponible: 2,
        activo: true
      },
      {
        titulo: 'Crimen y castigo',
        autor: 'Fiódor Dostoyevski',
        isbn: '9780143107637',
        editorial: 'Penguin Classics',
        genero: 'Novela psicológica',
        anioPublicacion: 1866,
        descripcion: 'La historia de Rodion Raskolnikov y su plan para asesinar a una vieja prestamista.',
        disponible: true,
        cantidadDisponible: 3,
        activo: true
      },
      {
        titulo: 'Harry Potter y la piedra filosofal',
        autor: 'J.K. Rowling',
        isbn: '9788478884459',
        editorial: 'Salamandra',
        genero: 'Fantasía',
        anioPublicacion: 1997,
        descripcion: 'El primer año de Harry Potter en el Colegio Hogwarts de Magia y Hechicería.',
        disponible: true,
        cantidadDisponible: 0, // No hay unidades disponibles
        activo: true
      },
      {
        titulo: 'Matar a un ruiseñor',
        autor: 'Harper Lee',
        isbn: '9780060935467',
        editorial: 'Harper Perennial',
        genero: 'Novela',
        anioPublicacion: 1960,
        descripcion: 'Una historia sobre racismo y justicia en una pequeña ciudad de Alabama en la década de 1930.',
        disponible: true,
        cantidadDisponible: 4,
        activo: true
      },
      {
        titulo: 'Orgullo y prejuicio',
        autor: 'Jane Austen',
        isbn: '9780141439518',
        editorial: 'Penguin Classics',
        genero: 'Novela romántica',
        anioPublicacion: 1813,
        descripcion: 'La historia de Elizabeth Bennet y su relación con el aparentemente orgulloso Sr. Darcy.',
        disponible: true,
        cantidadDisponible: 2,
        activo: true
      },
      {
        titulo: 'El principito',
        autor: 'Antoine de Saint-Exupéry',
        isbn: '9780156012195',
        editorial: 'Harvest Books',
        genero: 'Literatura infantil',
        anioPublicacion: 1943,
        descripcion: 'Un piloto, tras un aterrizaje forzoso en el desierto del Sahara, conoce a un pequeño príncipe de otro planeta.',
        disponible: true,
        cantidadDisponible: 7,
        activo: true
      },
      {
        titulo: 'El libro eliminado',
        autor: 'Autor desconocido',
        isbn: '0000000000000',
        editorial: 'Editorial desconocida',
        genero: 'Desconocido',
        anioPublicacion: 2000,
        descripcion: 'Este libro está marcado como inactivo para pruebas de soft delete.',
        disponible: true,
        cantidadDisponible: 1,
        activo: false
      }
    ];
    
    const libros = await Libro.insertMany(librosData);
    console.log(`✅ ${libros.length} libros creados`);
    return libros;
  } catch (error) {
    console.error('Error creando libros:', error);
    throw error;
  }
};

// Reservas de prueba
const crearReservas = async (usuarios, libros) => {
  try {
    // Eliminar reservas existentes
    await Reserva.deleteMany({});
    
    // Para simplificar, tomamos algunos usuarios y libros específicos
    const usuarioRegular = usuarios.find(u => u.email === 'usuario@ejemplo.com');
    const bibliotecario = usuarios.find(u => u.email === 'bibliotecario@biblioteca.com');
    
    // Extraer los libros específicos
    const hobbit = libros.find(l => l.titulo === 'El Hobbit');
    const harryPotter = libros.find(l => l.titulo === 'Harry Potter y la piedra filosofal');
    const crimeCastigo = libros.find(l => l.titulo === 'Crimen y castigo');
    
    // Actualizar manualmente los libros para que tengan la disponibilidad correcta para las reservas
    await Libro.findByIdAndUpdate(hobbit._id, { disponible: false, cantidadDisponible: 0 });
    await Libro.findByIdAndUpdate(harryPotter._id, { disponible: false, cantidadDisponible: 0 });
    
    // Fechas para las reservas
    const ahora = new Date();
    const fechaHace1Semana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fechaHace2Semanas = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fechaHace1Mes = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fechaFutura1Semana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fechaFutura2Semanas = new Date(ahora.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    // Crear reservas con diferentes estados y fechas
    const reservasData = [
      // Reserva completada (pasada)
      {
        usuario: usuarioRegular._id,
        infoUsuario: {
          nombre: usuarioRegular.nombre,
          apellido: usuarioRegular.apellido,
          email: usuarioRegular.email
        },
        libro: crimeCastigo._id,
        infoLibro: {
          titulo: crimeCastigo.titulo,
          autor: crimeCastigo.autor,
          isbn: crimeCastigo.isbn,
          genero: crimeCastigo.genero
        },
        fechaReserva: fechaHace1Mes,
        fechaDevolucion: fechaHace2Semanas,
        fechaDevolucionReal: fechaHace2Semanas,
        estado: 'completada',
        observaciones: 'Libro devuelto en buen estado'
      },
      // Reserva activa (el Hobbit)
      {
        usuario: usuarioRegular._id,
        infoUsuario: {
          nombre: usuarioRegular.nombre,
          apellido: usuarioRegular.apellido,
          email: usuarioRegular.email
        },
        libro: hobbit._id,
        infoLibro: {
          titulo: hobbit.titulo,
          autor: hobbit.autor,
          isbn: hobbit.isbn,
          genero: hobbit.genero
        },
        fechaReserva: fechaHace1Semana,
        fechaDevolucion: fechaFutura1Semana,
        estado: 'activa',
        observaciones: 'Primera reserva del usuario'
      },
      // Reserva pendiente para el bibliotecario
      {
        usuario: bibliotecario._id,
        infoUsuario: {
          nombre: bibliotecario.nombre,
          apellido: bibliotecario.apellido,
          email: bibliotecario.email
        },
        libro: harryPotter._id,
        infoLibro: {
          titulo: harryPotter.titulo,
          autor: harryPotter.autor,
          isbn: harryPotter.isbn,
          genero: harryPotter.genero
        },
        fechaReserva: ahora,
        fechaDevolucion: fechaFutura2Semanas,
        estado: 'pendiente',
        observaciones: 'Pendiente de recoger'
      },
      // Reserva cancelada
      {
        usuario: usuarioRegular._id,
        infoUsuario: {
          nombre: usuarioRegular.nombre,
          apellido: usuarioRegular.apellido,
          email: usuarioRegular.email
        },
        libro: crimeCastigo._id,
        infoLibro: {
          titulo: crimeCastigo.titulo,
          autor: crimeCastigo.autor,
          isbn: crimeCastigo.isbn,
          genero: crimeCastigo.genero
        },
        fechaReserva: fechaHace2Semanas,
        fechaDevolucion: fechaHace1Semana,
        estado: 'cancelada',
        observaciones: 'Cancelada por el usuario'
      },
      // Reserva retrasada
      {
        usuario: bibliotecario._id,
        infoUsuario: {
          nombre: bibliotecario.nombre,
          apellido: bibliotecario.apellido,
          email: bibliotecario.email
        },
        libro: crimeCastigo._id,
        infoLibro: {
          titulo: crimeCastigo.titulo,
          autor: crimeCastigo.autor,
          isbn: crimeCastigo.isbn,
          genero: crimeCastigo.genero
        },
        fechaReserva: fechaHace1Mes,
        fechaDevolucion: fechaHace1Semana,
        estado: 'retrasada',
        observaciones: 'Libro no devuelto a tiempo'
      }
    ];
    
    const reservas = await Reserva.insertMany(reservasData);
    console.log(`✅ ${reservas.length} reservas creadas`);
    return reservas;
  } catch (error) {
    console.error('Error creando reservas:', error);
    throw error;
  }
};

// Función principal para ejecutar todos los seeders
const seed = async () => {
  try {
    console.log('🌱 Iniciando siembra de datos...');
    
    // Crear usuarios
    const usuarios = await crearUsuarios();
    
    // Crear libros
    const libros = await crearLibros();
    
    // Crear reservas
    await crearReservas(usuarios, libros);
    
    console.log('✅ Datos sembrados correctamente');
    
    // Retornar credenciales para pruebas
    return {
      credenciales: [
        { rol: 'Admin', email: 'admin@biblioteca.com', password: 'admin123' },
        { rol: 'Bibliotecario', email: 'bibliotecario@biblioteca.com', password: 'biblioteca123' },
        { rol: 'Ayudante', email: 'ayudante@biblioteca.com', password: 'ayudante123' },
        { rol: 'Usuario', email: 'usuario@ejemplo.com', password: 'usuario123' }
      ]
    };
  } catch (error) {
    console.error('❌ Error al sembrar datos:', error);
    throw error;
  }
};

module.exports = {
  seed
};
