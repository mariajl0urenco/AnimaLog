import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

function HistoricoTestes({ testes = [], show, onHide, onEditar, onAtualizar }) {

  const eliminarTeste = async (id) => {
    if (!window.confirm("Eliminar este teste?")) return;
    try {
      await axios.delete(`https://animalog-backend.onrender.com/animais/testes/${id}`);
      onAtualizar?.();
    } catch (e) {
      alert('Erro ao eliminar teste');
      console.error(e);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Histórico de Testes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {testes.length === 0 ? (
          <p className="text-muted">Este animal não tem testes registados.</p>
        ) : (
          <ul className="list-group">
            {testes.map((t, index) => (
              <li className="list-group-item d-flex justify-content-between align-items-start" key={index}>
                <div>
                  <strong>{t.nome}</strong> — {t.resultado === 'pos' ? 'Positivo' : 'Negativo'} ({t.data?.slice(0, 10) || 'Sem data'})
                  {t.tratamento && (
                    <div>
                      <small>Tratamento: {t.tratamento}</small><br />
                      <small>Iniciado: {t.tratamento_iniciado ? 'Sim' : 'Não'}</small>
                    </div>
                  )}
                </div>
                <div className="d-flex flex-column gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => onEditar?.(t)}
                  >
                    ✎
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => eliminarTeste(t.id)}
                  >
                    🗑️
                  </Button>
                </div>
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

export default HistoricoTestes;
