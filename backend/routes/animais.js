const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const cloudinary = require('../cloudinary');
require('dotenv').config();
const streamifier = require('streamifier');
const toBool = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const v = val.trim().toLowerCase();
    return v === 'true' || v === 'sim' || v === '1';
  }
  return false;
};


// ────────── Multer (memória para Cloudinary) ──────────
const storage = multer.memoryStorage();
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

// ────────── CRIA novo animal ──────────
router.post('/', upload.single('foto'), async (req, res) => {
  const {
    nome, especie, chip, vacinas, doencas, entrada, saida, observacoes,
    motivo_saida, dados_adotante, comportamento, peso, sexo, idade,
    esterilizado, desparasitado, produto_desparasitado, data_desparasitado,
    testes, tratamento, tratamento_iniciado,
    titular, box, motivo_entrada, motivo_volta, local_ocorrencia,
    concelho, data_nascimento, raca, cor,
    nome_teste, produto_desparasitacao, data_adocao, adotante, data_regresso,
    disponivel_adocao
  } = req.body;

  let foto = null;
  if (req.file) {
    const bufferStream = require('streamifier').createReadStream(req.file.buffer);
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'animais' }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      bufferStream.pipe(stream);
    });
    foto = resultado.secure_url;
  }

  try {
    const { rows } = await pool.query(`
INSERT INTO animais (
  nome, especie, chip, vacinas, doencas, entrada, saida, observacoes,
  foto, motivo_saida, dados_adotante, box, comportamento, peso, sexo, idade,
  esterilizado, desparasitado, produto_desparasitado, data_desparasitado,
  testes, data_testes, tratamento, tratamento_iniciado, titular,
  motivo_entrada, motivo_volta, local_ocorrencia, concelho,
  data_nascimento, raca, cor, data_regresso, nome_teste,
  data_adocao, produto_desparasitacao, adotante, disponivel_adocao
)


  VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,
    $9,$10,$11,$12,$13,$14,$15,$16,
    $17,$18,$19,$20,$21,$22,$23,$24,$25,
    $26,$27,$28,$29,$30,$31,$32,$33,$34,
    $35,$36,$37,$38
  )
  RETURNING *`,
  [
    nome, especie, chip || null, vacinas || null, doencas || null, entrada || null, saida || null, observacoes || null,
    foto, motivo_saida || null, dados_adotante || null, box || null, comportamento || null, peso || null, sexo || null, idade || null,
    toBool(esterilizado), toBool(desparasitado), produto_desparasitado || null, data_desparasitado || null,
    testes || null, null,
tratamento || null, toBool(tratamento_iniciado) || false, toBool(titular),
    motivo_entrada || null, motivo_volta || null, local_ocorrencia || null, concelho || null,
    data_nascimento || null, raca || null, cor || null, data_regresso || null, nome_teste || null,
    data_adocao || null, produto_desparasitacao || null, adotante || null, toBool(disponivel_adocao)
  ]
);



const animalCriado = rows[0];
const animalId = animalCriado.id;

// Vacinas
const vacinasArr = typeof vacinas === 'string' ? JSON.parse(vacinas) : vacinas;
await pool.query('DELETE FROM vacinas WHERE animal_id = $1', [animalId]);
if (Array.isArray(vacinasArr) && vacinasArr.length > 0) {
  for (const v of vacinasArr) {
    await pool.query(
      'INSERT INTO vacinas (animal_id, nome, data) VALUES ($1, $2, $3)',
      [animalId, v.nome, v.data]
    );
  }
}

// Testes
const testesArr = typeof testes === 'string' ? JSON.parse(testes) : testes;
await pool.query('DELETE FROM testes WHERE animal_id = $1', [animalId]);
if (Array.isArray(testesArr) && testesArr.length > 0) {
  for (const t of testesArr) {
    const resultadoEnum = t.resultado?.toLowerCase() === 'positivo' ? 'pos'
                         : t.resultado?.toLowerCase() === 'negativo' ? 'neg'
                         : t.resultado;
    await pool.query(
      'INSERT INTO testes (animal_id, nome, resultado, data, tratamento, tratamento_iniciado) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        animalId,
        t.nome,
        resultadoEnum,
        t.data,
        t.tratamento,
        toBool(t.tratamento_iniciado)
      ]
    );
  }
}

    res.status(201).json(animalCriado); 
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
    testes, tratamento, tratamento_iniciado,
    titular, box, motivo_entrada, motivo_volta, local_ocorrencia,
    concelho, data_nascimento, raca, cor,
    nome_teste, produto_desparasitacao, data_adocao, adotante, data_regresso,
    disponivel_adocao
  } = req.body;

  try {
    const sets = [
      'nome=$1', 'especie=$2', 'chip=$3', 'doencas=$4',
      'entrada=$5', 'saida=$6', 'observacoes=$7', 'motivo_saida=$8',
      'dados_adotante=$9', 'comportamento=$10', 'peso=$11', 'sexo=$12',
      'idade=$13', 'esterilizado=$14', 'desparasitado=$15',
      'produto_desparasitado=$16', 'data_desparasitado=$17',
      'tratamento=$18', 'tratamento_iniciado=$19', 'titular=$20',
      'box=$21', 'motivo_entrada=$22', 'motivo_volta=$23', 'local_ocorrencia=$24',
      'concelho=$25', 'data_nascimento=$26', 'raca=$27', 'cor=$28',
      'nome_teste=$29', 'produto_desparasitacao=$30', 'data_adocao=$31',
      'adotante=$32', 'data_regresso=$33', 'disponivel_adocao=$34'
    ];

    const params = [
      nome, especie, chip, doencas || null,
      entrada || null, saida || null, observacoes || null, motivo_saida || null,
      dados_adotante || null, comportamento || null, peso || null, sexo || null,
      idade || null, toBool(esterilizado), toBool(desparasitado),
      produto_desparasitado || null, data_desparasitado || null,
      tratamento || null, toBool(tratamento_iniciado),
      toBool(titular), box || null, motivo_entrada,
      motivo_volta || null, local_ocorrencia || null, concelho || null,
      data_nascimento || null, raca || null, cor || null,
      nome_teste || null, produto_desparasitacao || null, data_adocao || null,
      adotante || null, data_regresso || null, toBool(disponivel_adocao),
      req.params.id
    ];

    const { rows } = await pool.query(
      `UPDATE animais SET ${sets.join(', ')} WHERE id=$${params.length} RETURNING *`,
      params
    );

    if (!rows.length) return res.status(404).json({ erro: 'Animal não encontrado' });

    const animalEditado = rows[0];
    const animalId = animalEditado.id;

// Atualizar vacinas
const vacinasArr = typeof vacinas === 'string' ? JSON.parse(vacinas) : vacinas;
await pool.query('DELETE FROM vacinas WHERE animal_id = $1', [animalId]);
if (Array.isArray(vacinasArr) && vacinasArr.length > 0) {
  for (const v of vacinasArr) {
    await pool.query(
      'INSERT INTO vacinas (animal_id, nome, data) VALUES ($1, $2, $3)',
      [animalId, v.nome, v.data]
    );
  }
}


// Atualizar testes
const testesArr = typeof testes === 'string' ? JSON.parse(testes) : testes;
await pool.query('DELETE FROM testes WHERE animal_id = $1', [animalId]);
if (Array.isArray(testesArr) && testesArr.length > 0) {
  for (const t of testesArr) {
    const resultadoEnum = t.resultado?.toLowerCase() === 'positivo' ? 'pos'
                         : t.resultado?.toLowerCase() === 'negativo' ? 'neg'
                         : t.resultado;
    await pool.query(
      'INSERT INTO testes (animal_id, nome, resultado, data, tratamento, tratamento_iniciado) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        animalId,
        t.nome,
        resultadoEnum,
        t.data,
        t.tratamento,
        toBool(t.tratamento_iniciado)
      ]
    );
  }
}




    res.json(animalEditado);
  } catch (err) {
    console.error('Erro ao editar animal:', err);
    res.status(500).json({ erro: 'Erro ao editar animal' });
  }
});



// ────────── ATUALIZA somente a FOTO (com Cloudinary) ──────────
router.put('/:id/foto', upload.single('foto'), async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Foto não enviada' });

  try {
    const bufferStream = require('streamifier').createReadStream(req.file.buffer);
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'animais' }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      bufferStream.pipe(stream);
    });

    const { rows } = await pool.query(
      'UPDATE animais SET foto=$1 WHERE id=$2 RETURNING *',
      [resultado.secure_url, req.params.id]
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

// ────────── LISTA ANIMAIS DISPONÍVEIS PARA ADOÇÃO ──────────
router.get('/publico/adocao', async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nome, especie, foto, sexo, idade, esterilizado
      FROM animais
      WHERE disponivel_adocao = true AND saida IS NULL
      ORDER BY entrada DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao obter animais disponíveis para adoção:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
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


// Rota para atualizar o estado de adoção de todos os animais
router.put('/adocao/todos', async (req, res) => {
  const { valor } = req.body; // true ou false
  try {
    await pool.query('UPDATE animais SET disponivel_adocao = $1', [valor]);
    res.json({ message: 'Estado de adoção atualizado para todos os animais.' });
  } catch (error) {
    console.error('Erro ao atualizar estado de adoção em massa:', error);
    res.status(500).json({ error: 'Erro ao atualizar estado de adoção.' });
  }
});


module.exports = router;
