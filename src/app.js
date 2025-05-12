const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
require('dotenv').config();

// Conectar a la base de datos
connectDB();

// Inicializar express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', routes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'API de la Librería - Clean Architecture' });
});

// Middlewares de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
