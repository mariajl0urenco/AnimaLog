// routes/pedidos.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
require('dotenv').config();


router.post('/', async (req, res) => {
  const { id_animal, nome, email, telemovel, data_visita } = req.body;
  try {
    const resultado = await pool.query(
      `INSERT INTO pedidos_visita (id_animal, nome, email, telemovel, data_visita)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_animal, nome, email, telemovel, data_visita]
    );
    res.status(201).json({ mensagem: 'Pedido registado com sucesso', pedido: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao registar pedido:', err);
    res.status(500).json({ erro: 'Erro interno ao registar pedido' });
  }
});


router.get('/', async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, a.nome AS nome_animal
      FROM pedidos_visita p
      LEFT JOIN animais a ON p.id_animal = a.id
      ORDER BY p.criado_em DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao obter pedidos:', err);
    res.status(500).json({ erro: 'Erro ao obter pedidos' });
  }
});


// ────────── DELETE pedido por ID ──────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM pedidos_visita WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    res.json({ mensagem: 'Pedido eliminado com sucesso' });
  } catch (err) {
    console.error('Erro ao eliminar pedido:', err);
    res.status(500).json({ erro: 'Erro interno ao eliminar pedido' });
  }
});

// ────────── PATCH estado do pedido ──────────
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const { rowCount } = await pool.query(
      'UPDATE pedidos_visita SET estado = $1 WHERE id = $2',
      [estado, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json({ mensagem: 'Estado atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar estado do pedido:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar estado' });
  }
});



module.exports = router;
