import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function FormAdicionarAnimal() {
  const [formData, setFormData] = useState({
    nome: '', especie: '', chip: '',
    vacinas: '', doencas: '',
    entrada: '', saida: '', observacoes: ''
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3001/animais`)
        .then(res => {
          const animal = res.data.find(a => a.id === parseInt(id));
          if (animal) {
            setFormData({
              nome: animal.nome || '',
              especie: animal.especie || '',
              chip: animal.chip || '',
              vacinas: animal.vacinas || '',
              doencas: animal.doencas || '',
              entrada: animal.entrada ? animal.entrada.split('T')[0] : '',
              saida: animal.saida ? animal.saida.split('T')[0] : '',
              observacoes: animal.observacoes || ''
            });
          }
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await axios.put(`http://localhost:3001/animais/${id}`, formData);
        alert('Animal atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:3001/animais', formData);
        alert('Animal adicionado com sucesso!');
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar animal.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h2 className="mb-3">{id ? 'Editar Animal' : 'Adicionar Animal'}</h2>

      <div className="mb-2"><input className="form-control" type="text" name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required /></div>
      <div className="mb-2"><input className="form-control" type="text" name="especie" placeholder="Espécie" value={formData.especie} onChange={handleChange} required /></div>
      <div className="mb-2"><input className="form-control" type="text" name="chip" placeholder="Chip" value={formData.chip} onChange={handleChange} required /></div>
      <div className="mb-2"><input className="form-control" type="text" name="vacinas" placeholder="Vacinas" value={formData.vacinas} onChange={handleChange} /></div>
      <div className="mb-2"><input className="form-control" type="text" name="doencas" placeholder="Doenças" value={formData.doencas} onChange={handleChange} /></div>
      <div className="mb-2"><input className="form-control" type="date" name="entrada" value={formData.entrada} onChange={handleChange} /></div>
      <div className="mb-2"><input className="form-control" type="date" name="saida" value={formData.saida} onChange={handleChange} /></div>
      <div className="mb-3"><textarea className="form-control" name="observacoes" placeholder="Observações" value={formData.observacoes} onChange={handleChange} /></div>

      <button className="btn btn-primary me-2" type="submit">{id ? 'Guardar alterações' : 'Adicionar'}</button>
      <button className="btn btn-secondary" type="button" onClick={() => navigate('/')}>Cancelar</button>
    </form>
  );
}

export default FormAdicionarAnimal;
