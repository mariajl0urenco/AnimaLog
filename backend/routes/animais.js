const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

// Ligação à base de dados
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// GET /animais – buscar todos os animais
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM animais ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar animais:', err);
    res.status(500).json({ erro: 'Erro ao buscar animais' });
  }
});

// POST /animais – adicionar novo animal
router.post('/', async (req, res) => {
  const { nome, especie, chip, vacinas, doencas, entrada, saida, observacoes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO animais (nome, especie, chip, vacinas, doencas, entrada, saida, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nome, especie, chip, vacinas, doencas, entrada, saida, observacoes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar animal:', err);
    res.status(500).json({ erro: 'Erro ao adicionar animal' });
  }
});

// PUT /animais/:id – editar animal existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, especie, chip, vacinas, doencas, entrada, saida, observacoes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE animais 
       SET nome = $1, especie = $2, chip = $3, vacinas = $4, doencas = $5, entrada = $6, saida = $7, observacoes = $8 
       WHERE id = $9 RETURNING *`,
      [nome, especie, chip, vacinas, doencas, entrada, saida, observacoes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Animal não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao editar animal:', err);
    res.status(500).json({ erro: 'Erro ao editar animal' });
  }
});

// DELETE /animais/:id – remover animal
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM animais WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Animal não encontrado' });
    }

    res.json({ mensagem: 'Animal removido com sucesso', animal: result.rows[0] });
  } catch (err) {
    console.error('Erro ao remover animal:', err);
    res.status(500).json({ erro: 'Erro ao remover animal' });
  }
});

module.exports = router;
