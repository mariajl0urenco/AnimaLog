// src/components/CriarUtilizador.jsx
import React, { useState } from 'react';
import axios from 'axios';

function CriarUtilizador({ token }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    tipo: 'operacional',
  });
  const [mensagem, setMensagem] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/auth/criar-utilizador', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMensagem('Utilizador criado com sucesso!');
      setFormData({ nome: '', email: '', password: '', tipo: 'operacional' });
    } catch (error) {
      setMensagem('Erro ao criar utilizador.');
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h2>Criar Novo Utilizador</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nome</label>
          <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Tipo de Utilizador</label>
          <select name="tipo" className="form-select" value={formData.tipo} onChange={handleChange}>
            <option value="operacional">Operacional</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Criar Utilizador</button>
      </form>
      {mensagem && <p className="mt-3">{mensagem}</p>}
    </div>
  );
}

export default CriarUtilizador;
