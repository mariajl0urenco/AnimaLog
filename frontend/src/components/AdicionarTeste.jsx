// src/components/AdicionarTeste.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AdicionarTeste({ show, onHide, onGuardar }) {
  const [dados, setDados] = useState({
    nome: '',
    resultado: '',
    data: '',
    tratamento: '',
    tratamento_iniciado: false
  });

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setDados(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const guardar = () => {
    if (!dados.nome || !dados.resultado || !dados.data) {
      alert("Preenche os campos obrigatórios: nome, resultado e data.");
      return;
    }
    onGuardar?.(dados);
    onHide();
    setDados({ nome: '', resultado: '', data: '', tratamento: '', tratamento_iniciado: false });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Teste</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Nome do Teste *</Form.Label>
          <Form.Control name="nome" value={dados.nome} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Resultado *</Form.Label>
          <Form.Select name="resultado" value={dados.resultado} onChange={handleChange}>
            <option value="">-- Selecionar --</option>
            <option value="pos">Positivo</option>
            <option value="neg">Negativo</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Data *</Form.Label>
          <Form.Control type="date" name="data" value={dados.data} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Tratamento</Form.Label>
          <Form.Control name="tratamento" value={dados.tratamento} onChange={handleChange} />
        </Form.Group>

        <Form.Check
          type="checkbox"
          name="tratamento_iniciado"
          label="Tratamento iniciado"
          checked={dados.tratamento_iniciado}
          onChange={handleChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="success" onClick={guardar}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AdicionarTeste;
