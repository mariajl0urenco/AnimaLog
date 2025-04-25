const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// GET /animais/:id/testes
router.get('/:id/testes', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM testes WHERE animal_id = $1 ORDER BY data DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar testes:', err);
    res.status(500).json({ erro: 'Erro ao buscar testes' });
  }
});

// POST /animais/:id/testes
router.post('/:id/testes', async (req, res) => {
  const { id } = req.params;
  const { nome, resultado, data, tratamento, tratamento_iniciado } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO testes 
        (animal_id, nome, resultado, data, tratamento, tratamento_iniciado) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        id,
        nome,
        resultado,
        data || null,
        tratamento || null,
        tratamento_iniciado
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar teste:', err);
    res.status(500).json({ erro: 'Erro ao adicionar teste' });
  }
});

// PUT /testes/:testeId → editar teste existente
router.put('/testes/:testeId', async (req, res) => {
  const { testeId } = req.params;
  const { nome, resultado, data, tratamento, tratamento_iniciado } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE testes 
         SET nome = $1, resultado = $2, data = $3, tratamento = $4, tratamento_iniciado = $5 
       WHERE id = $6 
       RETURNING *`,
      [
        nome,
        resultado,
        data || null,
        tratamento || null,
        tratamento_iniciado,
        testeId
      ]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Teste não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao editar teste:', err);
    res.status(500).json({ erro: 'Erro ao editar teste' });
  }
});

// DELETE /testes/:testeId
router.delete('/testes/:testeId', async (req, res) => {
  try {
    const { testeId } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM testes WHERE id=$1 RETURNING *',
      [testeId]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Teste não encontrado' });
    res.json({ mensagem: 'Teste removido', teste: rows[0] });
  } catch (err) {
    console.error('Erro ao remover teste:', err);
    res.status(500).json({ erro: 'Erro ao remover teste' });
  }
});

module.exports = router;
