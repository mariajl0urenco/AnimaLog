// routes/boxes.js
const express = require('express');
const router  = express.Router();
const pool = require('../db');
require('dotenv').config();


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

// DELETE /boxes/:nome
router.delete('/:nome', async (req, res) => {
  const { nome } = req.params;
  try {
    // 🔐 Verifica se há animais nesta box
    const { rowCount: numAnimais } = await pool.query('SELECT 1 FROM animais WHERE box = $1 LIMIT 1', [nome]);
    if (numAnimais > 0) {
      return res.status(400).json({ erro: 'Não é possível apagar uma box com animais associados.' });
    }

    // Continua com a eliminação
    const { rowCount } = await pool.query('DELETE FROM boxes WHERE nome = $1', [nome]);
    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Box não encontrada' });
    }
    res.json({ mensagem: 'Box apagada com sucesso' });
  } catch (err) {
    console.error('Erro ao apagar box:', err);
    res.status(500).json({ erro: 'Erro ao apagar box' });
  }
});


module.exports = router;
