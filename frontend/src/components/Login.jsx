import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { email, password });
      const { token, tipo } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('tipo', tipo);
      onLogin(tipo);
      navigate('/');
    } catch {
      setErro('Credenciais inválidas');
    }
  };

  return (
    <div className="app-container d-flex justify-content-center align-items-center">
      <div className="p-4 rounded shadow" style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">
          <span role="img" aria-label="cadeado">🔒</span> Login AnimaLog
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-100">Entrar</button>
          {erro && <p className="text-danger mt-2 text-center">{erro}</p>}
        </form>

        {/* Botão Voltar */}
        <button
          className="btn btn-outline-secondary w-100 mt-3"
          onClick={() => navigate('/')}
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}

export default Login;
