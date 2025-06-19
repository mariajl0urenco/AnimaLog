const bcrypt = require('bcrypt');
const pool = require('./db'); 
require('dotenv').config();

(async () => {
  const nome = 'Admin Principal';
  const email = 'admin@animalog.pt';
  const password = 'admin1234'; // Palavra-passe simples só para testes
  const tipo = 'tecnico';

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO utilizadores (nome, email, password, tipo) VALUES ($1, $2, $3, $4)',
      [nome, email, hash, tipo]
    );
    console.log('✅ Utilizador criado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar utilizador:', err.message);
  } finally {
    pool.end();
  }
})();
