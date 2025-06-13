const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM utilizadores WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ mensagem: 'Email nÃ£o encontrado' });
    const utilizador = result.rows[0];
    const senhaValida = await bcrypt.compare(password, utilizador.password);
    if (!senhaValida) return res.status(401).json({ mensagem: 'Palavra-passe incorreta' });
    const token = jwt.sign({ id: utilizador.id, tipo: utilizador.tipo }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, tipo: utilizador.tipo });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.post('/criar-utilizador', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token nÃ£o fornecido.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'tecnico') return res.status(403).json({ mensagem: 'Apenas tÃ©cnicos podem criar utilizadores.' });
    const { nome, email, password, tipo } = req.body;
    if (!nome || !email || !password || !tipo) return res.status(400).json({ mensagem: 'Todos os campos sÃ£o obrigatÃ³rios.' });
    const emailExistente = await pool.query('SELECT * FROM utilizadores WHERE email = $1', [email]);
    if (emailExistente.rows.length > 0) return res.status(409).json({ mensagem: 'JÃ¡ existe um utilizador com este email.' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO utilizadores (nome, email, password, tipo) VALUES ($1, $2, $3, $4)', [nome, email, hash, tipo]);
    res.status(201).json({ mensagem: 'Utilizador criado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.get('/listar', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token nÃ£o fornecido.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'tecnico') return res.status(403).json({ mensagem: 'Apenas tÃ©cnicos podem ver utilizadores.' });
    const result = await pool.query('SELECT id, nome, email, tipo FROM utilizadores ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.put('/editar/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'tecnico')
      return res.status(403).json({ mensagem: 'Apenas técnicos podem editar utilizadores.' });

    const { nome, email, tipo, novaPassword } = req.body;
    const { id } = req.params;

    let query = 'UPDATE utilizadores SET nome = $1, email = $2, tipo = $3';
    const params = [nome, email, tipo];

    if (novaPassword) {
      const hash = await bcrypt.hash(novaPassword, 10);
      query += ', password = $4';
      params.push(hash);
      query += ' WHERE id = $5';
      params.push(id);
    } else {
      query += ' WHERE id = $4';
      params.push(id);
    }

    await pool.query(query, params);
    res.json({ mensagem: 'Utilizador atualizado com sucesso' });

  } catch (err) {
    console.error('Erro ao editar utilizador:', err.message);
    res.status(500).json({ mensagem: 'Erro no servidor ao editar utilizador.' });
  }
});

router.put('/alterar-senha/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token nÃ£o fornecido.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'tecnico') return res.status(403).json({ mensagem: 'Apenas tÃ©cnicos podem alterar senhas.' });
    const { novaSenha } = req.body;
    const { id } = req.params;
    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE utilizadores SET password = $1 WHERE id = $2', [hash, id]);
    res.json({ mensagem: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.delete('/eliminar/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token nÃ£o fornecido.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'tecnico') return res.status(403).json({ mensagem: 'Apenas tÃ©cnicos podem eliminar utilizadores.' });
    const { id } = req.params;
    await pool.query('DELETE FROM utilizadores WHERE id = $1', [id]);
    res.json({ mensagem: 'Utilizador eliminado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;