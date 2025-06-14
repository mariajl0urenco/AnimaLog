import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

function ModalPedidoVisita({ show, onHide, animais }) {
  const [idAnimal, setIdAnimal] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [data, setData] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://animalog-backend.onrender.com/pedidos-visita', {
        id_animal: idAnimal,
        nome,
        email,
        telemovel,
        data_visita: data,
      });
      setMensagem('Pedido enviado com sucesso!');
      setNome('');
      setEmail('');
      setTelemovel('');
      setData('');
      setIdAnimal('');
    } catch (err) {
      setMensagem('Erro ao enviar pedido.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agendar Visita</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Animal</Form.Label>
            <Form.Select value={idAnimal} onChange={e => setIdAnimal(e.target.value)} required>
              <option value="">-- Selecionar Animal --</option>
              {animais.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Nome</Form.Label>
            <Form.Control value={nome} onChange={e => setNome(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Telemóvel</Form.Label>
            <Form.Control
              type="tel"
              placeholder="912345678"
              value={telemovel}
              onChange={e => setTelemovel(e.target.value)}
              pattern="[0-9]{9}"
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Data da Visita</Form.Label>
            <Form.Control type="date" value={data} onChange={e => setData(e.target.value)} required />
          </Form.Group>
          {mensagem && <div className="mt-2 text-success">{mensagem}</div>}
          <Button type="submit" className="mt-3 w-100">Enviar Pedido</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ModalPedidoVisita;
