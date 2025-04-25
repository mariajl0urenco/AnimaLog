const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// ────────── Base de dados ──────────
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// ────────── Multer (uploads) ──────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, nome);
  }
});
const upload = multer({ storage });

// ────────── LISTA todos ──────────
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM animais ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar animais' });
  }
});

// ────────── DETALHES por ID ──────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM animais WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar animal' });
  }
});

// ────────── CRIA novo animal ──────────
router.post('/', upload.single('foto'), async (req, res) => {
  const {
    nome, especie, chip, vacinas, doencas, entrada, saida, observacoes,
    motivo_saida, dados_adotante, comportamento, peso, sexo, idade,
    esterilizado, desparasitado, produto_desparasitado, data_desparasitado,
    testes, data_testes, tratamento, tratamento_iniciado,
    titular, box, motivo_entrada, motivo_volta, local_ocorrencia,
    concelho, data_nascimento, raca, cor,
    nome_teste, produto_desparasitacao, data_adocao, adotante, data_regresso
  } = req.body;
  const foto = req.file ? req.file.filename : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO animais (
         nome, especie, chip, vacinas, doencas, entrada, saida, observacoes,
         motivo_saida, dados_adotante, comportamento, peso, sexo, idade,
         esterilizado, desparasitado, produto_desparasitado, data_desparasitado,
         testes, data_testes, tratamento, tratamento_iniciado, titular, box,
         motivo_entrada, motivo_volta, local_ocorrencia, concelho, data_nascimento,
         raca, cor, foto,
         nome_teste, produto_desparasitacao, data_adocao, adotante, data_regresso
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,
         $9,$10,$11,$12,$13,$14,
         $15,$16,$17,$18,$19,$20,
         $21,$22,$23,$24,$25,$26,
         $27,$28,$29,$30,$31,$32,
         $33,$34,$35,$36,$37
       ) RETURNING *`,
      [
        nome, especie, chip, vacinas || null, doencas || null, entrada || null,
        saida || null, observacoes || null, motivo_saida || null,
        dados_adotante || null, comportamento || null, peso || null, sexo || null,
        idade || null, esterilizado === 'true' || esterilizado === true,
        desparasitado === 'true' || desparasitado === true,
        produto_desparasitado || null, data_desparasitado || null,
        testes || null, data_testes || null, tratamento || null,
        tratamento_iniciado === 'true' || tratamento_iniciado === true,
        titular === 'true' || titular === true, box || null, motivo_entrada,
        motivo_volta || null, local_ocorrencia || null, concelho || null,
        data_nascimento || null, raca || null, cor || null, foto,
        nome_teste || null, produto_desparasitacao || null, data_adocao || null, adotante || null, data_regresso || null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar animal:', err);
    res.status(500).json({ erro: 'Erro ao adicionar animal' });
  }
});

// ────────── ATUALIZA animal ──────────
router.put('/:id', upload.none(), async (req, res) => {
  const {
    nome, especie, chip, vacinas, doencas, entrada, saida, observacoes,
    motivo_saida, dados_adotante, comportamento, peso, sexo, idade,
    esterilizado, desparasitado, produto_desparasitado, data_desparasitado,
    testes, data_testes, tratamento, tratamento_iniciado,
    titular, box, motivo_entrada, motivo_volta, local_ocorrencia,
    concelho, data_nascimento, raca, cor,
    nome_teste, produto_desparasitacao, data_adocao, adotante, data_regresso
  } = req.body;

  try {
    const sets = [
      'nome=$1','especie=$2','chip=$3','vacinas=$4','doencas=$5',
      'entrada=$6','saida=$7','observacoes=$8','motivo_saida=$9',
      'dados_adotante=$10','comportamento=$11','peso=$12','sexo=$13',
      'idade=$14','esterilizado=$15','desparasitado=$16',
      'produto_desparasitado=$17','data_desparasitado=$18',
      'testes=$19','data_testes=$20','tratamento=$21','tratamento_iniciado=$22',
      'titular=$23','box=$24','motivo_entrada=$25','motivo_volta=$26',
      'local_ocorrencia=$27','concelho=$28','data_nascimento=$29',
      'raca=$30','cor=$31',
      'nome_teste=$32','produto_desparasitacao=$33','data_adocao=$34','adotante=$35','data_regresso=$36'
    ];

    const params = [
      nome, especie, chip, vacinas || null, doencas || null,
      entrada || null, saida || null, observacoes || null, motivo_saida || null,
      dados_adotante || null, comportamento || null, peso || null, sexo || null,
      idade || null, esterilizado === 'true' || esterilizado === true,
      desparasitado === 'true' || desparasitado === true,
      produto_desparasitado || null, data_desparasitado || null,
      testes || null, data_testes || null, tratamento || null,
      tratamento_iniciado === 'true' || tratamento_iniciado === true,
      titular === 'true' || titular === true, box || null, motivo_entrada,
      motivo_volta || null, local_ocorrencia || null, concelho || null,
      data_nascimento || null, raca || null, cor || null,
      nome_teste || null, produto_desparasitacao || null, data_adocao || null, adotante || null, data_regresso || null,
      req.params.id
    ];

    const { rows } = await pool.query(
      `UPDATE animais SET ${sets.join(', ')} WHERE id=$${params.length} RETURNING *`,
      params
    );

    if (!rows.length) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao editar animal:', err);
    res.status(500).json({ erro: 'Erro ao editar animal' });
  }
});

// ────────── ATUALIZA somente a FOTO ──────────
router.put('/:id/foto', upload.single('foto'), async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Foto não enviada' });
  try {
    const { rows } = await pool.query(
      'UPDATE animais SET foto=$1 WHERE id=$2 RETURNING *',
      [req.file.filename, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar foto:', err);
    res.status(500).json({ erro: 'Erro ao atualizar foto' });
  }
});

// ────────── MUDA BOX ──────────
router.put('/:id/box', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE animais SET box=$1 WHERE id=$2 RETURNING *',
      [req.body.box, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar box:', err);
    res.status(500).json({ erro: 'Erro ao atualizar box' });
  }
});

// ────────── REGRESSO de adotado ──────────
router.put('/:id/regresso', async (req, res) => {
  const { id } = req.params;
  const { motivo_volta, data_regresso } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE animais
         SET saida = NULL,
             motivo_saida = NULL,
             dados_adotante = NULL,
             motivo_volta = $1,
             data_regresso = $2
       WHERE id = $3
       RETURNING *`,
      [motivo_volta || null, data_regresso || null, id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao registar regresso:', err);
    res.status(500).json({ erro: 'Erro ao registar regresso' });
  }
});

// ────────── REMOVE ──────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM animais WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json({ mensagem: 'Removido', animal: rows[0] });
  } catch (err) {
    console.error('Erro ao remover animal:', err);
    res.status(500).json({ erro: 'Erro ao remover animal' });
  }
});

module.exports = router;
