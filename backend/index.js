// index.js  –  ponto de arranque do backend
const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

// ─────────── forçar datas como string ───────────
const pg = require('pg');
pg.types.setTypeParser(1082, val => val); // mantém 'YYYY-MM-DD' como string

// ─────────── Express app ───────────
const app  = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Imagens da pasta uploads
app.use('/animais/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
const animaisRouter = require('./routes/animais');
const vacinasRouter = require('./routes/vacinas');
const boxesRouter   = require('./routes/boxes');

// monta as rotas na ordem correta
app.use('/animais',      animaisRouter);
app.use('/animais',      vacinasRouter);  
app.use('/boxes',        boxesRouter);

// Endpoint base
app.get('/', (_req, res) => {
  res.send('API do AnimaLog a funcionar! 🐾');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
