import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function EditarTeste({ show, onHide, teste, onGuardar }) {
  const [dados, setDados] = useState({
    id: '',
    nome: '',
    resultado: '',
    data: '',
    tratamento: '',
    tratamento_iniciado: false
  });

  useEffect(() => {
    if (teste) {
      setDados({
        id: teste.id,
        nome: teste.nome || '',
        resultado: teste.resultado || '',
        data: teste.data?.slice(0, 10) || '',
        tratamento: teste.tratamento || '',
        tratamento_iniciado: teste.tratamento_iniciado || false
      });
    }
  }, [teste]);

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
  };

  if (!teste) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Teste</Modal.Title>
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
        <Button variant="primary" onClick={guardar}>Guardar Alterações</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditarTeste;
