const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = require('../db');


// GET /animais/:id/vacinas
router.get('/:id/vacinas', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM vacinas WHERE animal_id = $1 ORDER BY data DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar vacinas:', err);
    res.status(500).json({ erro: 'Erro ao buscar vacinas' });
  }
});

// POST /animais/:id/vacinas
router.post('/:id/vacinas', async (req, res) => {
  const { id } = req.params;
  const { nome, data } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vacinas (animal_id, nome, data) VALUES ($1, $2, $3) RETURNING *',
      [id, nome, data]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar vacina:', err);
    res.status(500).json({ erro: 'Erro ao adicionar vacina' });
  }
});

// DELETE /vacinas/:vacinaId  → apaga uma vacina
router.delete('/vacinas/:vacinaId', async (req, res) => {
  try {
    const { vacinaId } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM vacinas WHERE id=$1 RETURNING *',
      [vacinaId]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Vacina não encontrada' });
    res.json({ mensagem: 'Vacina removida', vacina: rows[0] });
  } catch (err) {
    console.error('Erro ao remover vacina:', err);
    res.status(500).json({ erro: 'Erro ao remover vacina' });
  }
});

// PUT /vacinas/:vacinaId  → actualiza nome ou data
router.put('/vacinas/:vacinaId', async (req, res) => {
  try {
    const { vacinaId } = req.params;
    const { nome, data } = req.body;
    const { rows } = await pool.query(
      'UPDATE vacinas SET nome=$1, data=$2 WHERE id=$3 RETURNING *',
      [nome, data || null, vacinaId]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Vacina não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao editar vacina:', err);
    res.status(500).json({ erro: 'Erro ao editar vacina' });
  }
});


module.exports = router;
