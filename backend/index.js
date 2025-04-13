const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const app = express();
const PORT = process.env.PORT || 3001;
import 'bootstrap/dist/css/bootstrap.min.css';


// Middleware
app.use(cors());
app.use(express.json());

// Rotas
const animaisRouter = require('./routes/animais');
app.use('/animais', animaisRouter);

// Início do servidor
app.get('/', (req, res) => {
  res.send('API do AnimaLog a funcionar! 🐾');
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
