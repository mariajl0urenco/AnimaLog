// routes/utilizadores.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, utilizador) => {
    if (err) return res.status(403).json({ mensagem: 'Token inválido' });

    req.utilizador = utilizador;
    next();
  });
}

// POST /utilizadores (apenas técnicos podem criar utilizadores)
router.post('/', autenticarToken, async (req, res) => {
  if (req.utilizador.tipo !== 'tecnico') {
    return res.status(403).json({ mensagem: 'Permissão negada' });
  }

  const { nome, email, password, tipo } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO utilizadores (nome, email, password, tipo) VALUES ($1, $2, $3, $4)',
      [nome, email, hashedPassword, tipo]
    );

    res.status(201).json({ mensagem: 'Utilizador criado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ mensagem: 'Erro ao criar utilizador' });
  }
});

module.exports = router;
