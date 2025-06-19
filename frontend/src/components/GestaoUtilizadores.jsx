import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Table, Modal } from 'react-bootstrap';
import './GestaoUtilizadores.css';

function GestaoUtilizadores() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('operacional');
  const [utilizadores, setUtilizadores] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [utilizadorAtual, setUtilizadorAtual] = useState(null);
  const [novaPassword, setNovaPassword] = useState('');

  const token = localStorage.getItem('token');

  const carregarUtilizadores = async () => {
    try {
      const res = await axios.get('https://animalog-backend.onrender.com/auth/listar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUtilizadores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarUtilizadores();
  }, []);

  const criarUtilizador = async (e) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);

    try {
      const res = await axios.post(
        'https://animalog-backend.onrender.com/auth/criar-utilizador',
        { nome, email, password, tipo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagem(res.data.mensagem);
      setNome(''); setEmail(''); setPassword(''); setTipo('operacional');
      carregarUtilizadores();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao criar utilizador.');
    }
  };

  const apagarUtilizador = async (id) => {
    if (!window.confirm('Tem a certeza que deseja apagar este utilizador?')) return;
    try {
      await axios.delete(`https://animalog-backend.onrender.com/auth/eliminar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarUtilizadores();
    } catch (err) {
      alert('Erro ao apagar utilizador.');
    }
  };

  const abrirModalEditar = (u) => {
    setUtilizadorAtual(u);
    setNovaPassword('');
    setModalEdit(true);
  };

  const guardarEdicao = async () => {
    try {
      await axios.put(`https://animalog-backend.onrender.com/auth/editar/${utilizadorAtual.id}`, {
        nome: utilizadorAtual.nome,
        email: utilizadorAtual.email,
        tipo: utilizadorAtual.tipo,
        novaPassword: novaPassword || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalEdit(false);
      carregarUtilizadores();
    } catch (err) {
      alert('Erro ao editar utilizador.');
    }
  };

  return (
    <div>
      <h2 className="mb-4">👤 Gestão de Utilizadores</h2>

      {mensagem && <Alert variant="success">{mensagem}</Alert>}
      {erro && <Alert variant="danger">{erro}</Alert>}

      <Form onSubmit={criarUtilizador} className="form-gestao-utilizador">
        <h5>Criar Novo Utilizador</h5>
        <Form.Group className="mb-2">
          <Form.Label>Nome</Form.Label>
          <Form.Control value={nome} onChange={e => setNome(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Palavra-passe</Form.Label>
          <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tipo</Form.Label>
          <Form.Select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="operacional">Assistente Operacional</option>
            <option value="tecnico">Assistente Técnico</option>
          </Form.Select>
        </Form.Group>
        <Button type="submit" variant="primary">Criar Utilizador</Button>
      </Form>

      <hr />

      <h5 className="mt-4">Utilizadores Existentes</h5>
      <Table className="tabela-utilizadores">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Opções</th>
          </tr>
        </thead>
        <tbody>
          {utilizadores.map(u => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.tipo}</td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => abrirModalEditar(u)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => apagarUtilizador(u.id)}>Apagar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={modalEdit} onHide={() => setModalEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Utilizador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {utilizadorAtual && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Nome</Form.Label>
                <Form.Control value={utilizadorAtual.nome} onChange={e => setUtilizadorAtual({ ...utilizadorAtual, nome: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control value={utilizadorAtual.email} onChange={e => setUtilizadorAtual({ ...utilizadorAtual, email: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Nova Password</Form.Label>
                <Form.Control type="password" value={novaPassword} onChange={e => setNovaPassword(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select value={utilizadorAtual.tipo} onChange={e => setUtilizadorAtual({ ...utilizadorAtual, tipo: e.target.value })}>
                  <option value="operacional">Assistente Operacional</option>
                  <option value="tecnico">Assistente Técnico</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEdit(false)}>Cancelar</Button>
          <Button variant="primary" onClick={guardarEdicao}>Guardar Alterações</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GestaoUtilizadores;
