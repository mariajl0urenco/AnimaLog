// routes/boxes.js
const express = require('express');
const router  = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = require('../db');


// GET /boxes         
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM boxes ORDER BY nome');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar boxes:', err);
    res.status(500).json({ erro: 'Erro ao buscar boxes' });
  }
});

// GET /boxes/nome   
router.get('/nome', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT nome FROM boxes ORDER BY nome');
    res.json(rows.map(r => r.nome));
  } catch (err) {
    console.error('Erro ao buscar nomes das boxes:', err);
    res.status(500).json({ erro: 'Erro ao buscar nomes das boxes' });
  }
});

// POST /boxes      
router.post('/', async (req, res) => {
  const { nome } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Nome da box é obrigatório' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO boxes (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING RETURNING *',
      [nome.trim()]
    );
    if (rows.length) return res.status(201).json(rows[0]);
    // se já existia, devolve a existente
    const existing = await pool.query('SELECT * FROM boxes WHERE nome=$1', [nome.trim()]);
    res.json(existing.rows[0]);
  } catch (err) {
    console.error('Erro ao criar box:', err);
    res.status(500).json({ erro: 'Erro ao criar box' });
  }
});

module.exports = router;
