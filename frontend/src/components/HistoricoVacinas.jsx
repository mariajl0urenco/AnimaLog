import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

function HistoricoVacinas({ vacinas = [], show, onHide, onAtualizar }) {

  const eliminarVacina = async (id) => {
    if (!window.confirm("Eliminar esta vacina?")) return;
    try {
      await axios.delete(`https://animalog-backend.onrender.com/animais/vacinas/${id}`);
      onAtualizar?.();
    } catch (e) {
      alert('Erro ao eliminar vacina');
      console.error(e);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Histórico de Vacinas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {vacinas.length === 0 ? (
          <p className="text-muted">Este animal não tem vacinas registadas.</p>
        ) : (
          <ul className="list-group">
            {vacinas.map((vac, index) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
                <span>
                  <strong>{vac.nome}</strong> — {vac.data?.slice(0, 10) || 'Sem data'}
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => eliminarVacina(vac.id)}
                >
                  🗑️
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Fechar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HistoricoVacinas;
