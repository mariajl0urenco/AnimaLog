const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

(async () => {
  const email = 'admin@animalog.pt';
  const novaPassword = 'admin1234';

  try {
    const hash = await bcrypt.hash(novaPassword, 10);

    const resultado = await pool.query(
      'UPDATE utilizadores SET password = $1 WHERE email = $2',
      [hash, email]
    );

    if (resultado.rowCount === 0) {
      console.log('❌ Nenhum utilizador encontrado com esse email.');
    } else {
      console.log('✅ Password atualizada com sucesso!');
    }
  } catch (err) {
    console.error('❌ Erro ao atualizar password:', err.message);
  } finally {
    pool.end();
  }
})();
