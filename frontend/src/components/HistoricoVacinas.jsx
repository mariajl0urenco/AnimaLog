import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function HistoricoVacinas({ vacinas = [], show, onHide }) {
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
              <li className="list-group-item" key={index}>
                <strong>{vac.nome}</strong> — {vac.data?.slice(0, 10) || 'Sem data'}
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
