import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function HistoricoTestes({ testes = [], show, onHide, onEditar }) {
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
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onEditar?.(t)}
                >
                  ✎ Editar
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

export default HistoricoTestes;
