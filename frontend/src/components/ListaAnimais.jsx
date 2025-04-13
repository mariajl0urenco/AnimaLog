import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ListaAnimais() {
  const [animais, setAnimais] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/animais')
      .then(response => setAnimais(response.data))
      .catch(error => console.error('Erro ao buscar animais:', error));
  }, []);

  const removerAnimal = async (id) => {
    if (!window.confirm('Tens a certeza que queres remover este animal?')) return;
    try {
      await axios.delete(`http://localhost:3001/animais/${id}`);
      setAnimais(animais.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao remover animal.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Lista de Animais</h2>
        <button className="btn btn-success" onClick={() => navigate('/formulario')}>+ Adicionar Animal</button>
      </div>

      <div className="row">
        {animais.map(animal => (
          <div className="col-md-6 col-lg-4 mb-4" key={animal.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{animal.nome}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{animal.especie}</h6>
                <p className="card-text">
                  <strong>Chip:</strong> {animal.chip}<br />
                  <strong>Observações:</strong> {animal.observacoes || 'Sem observações.'}
                </p>
                <button className="btn btn-primary btn-sm me-2" onClick={() => navigate(`/editar/${animal.id}`)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => removerAnimal(animal.id)}>Remover</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListaAnimais;
