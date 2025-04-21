import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AdicionarVacina({ show, onHide, onGuardar }) {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');

  const guardarVacina = () => {
    if (!nome || !data) {
      alert('Preenche o nome e a data da vacina.');
      return;
    }
    onGuardar({ nome, data });
    setNome('');
    setData('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Vacina</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome da Vacina</Form.Label>
            <Form.Control
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Polivalente"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Data</Form.Label>
            <Form.Control
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={guardarVacina}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AdicionarVacina;
