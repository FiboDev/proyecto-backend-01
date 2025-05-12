/**
 * Script para ejecutar el seeder y llenar la base de datos con datos de prueba
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { seed } = require('../utils/seeder');

// Función para conectar a la base de datos
const conectarDB = async () => {
  try {
    // Obtener la URI directamente de las variables de entorno
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('La variable de entorno MONGODB_URI no está definida');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función principal
const main = async () => {
  try {
    await conectarDB();
    const resultado = await seed();
    
    console.log('\n=============================================');
    console.log('🔑 CREDENCIALES PARA PRUEBAS:');
    console.log('=============================================');
    
    resultado.credenciales.forEach(cred => {
      console.log(`👤 ${cred.rol}:`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      console.log('---------------------------------------------');
    });
    
    console.log('\n📝 INSTRUCCIONES DE USO:');
    console.log('1. Inicia sesión con alguna de las credenciales anteriores');
    console.log('2. Explora la API según los permisos del usuario');
    console.log('3. Prueba diferentes rutas y operaciones');
    console.log('=============================================');
    
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el seeder:', error);
    // Cerrar la conexión
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar la función principal
main();
