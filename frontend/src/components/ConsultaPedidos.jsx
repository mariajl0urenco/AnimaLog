import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ConsultaPedidos.css';

function ConsultaPedidos() {
  const [pedidos, setPedidos] = useState([]);

  const carregarPedidos = () => {
    axios.get('https://animalog-backend.onrender.com/pedidos-visita')
      .then(res => setPedidos(res.data))
      .catch(err => console.error('Erro ao buscar pedidos:', err));
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const eliminarPedido = (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este pedido?')) return;
    axios.delete(`https://animalog-backend.onrender.com/pedidos-visita/${id}`)
      .then(() => carregarPedidos())
      .catch(() => alert('Erro ao eliminar pedido.'));
  };

  const alterarEstado = (id, novoEstado) => {
    axios.patch(`https://animalog-backend.onrender.com/pedidos-visita/${id}`, { estado: novoEstado })
      .then(() => carregarPedidos())
      .catch(() => alert('Erro ao alterar estado.'));
  };

  return (
    <div className="container">
      <h2 className="my-4">📋 Pedidos de Visita</h2>
      <table className="tabela-pedidos">
        <thead className="table-light">
          <tr>
            <th>Animal</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telemóvel</th>
            <th>Data da Visita</th>
            <th>Estado</th>
            <th>Registado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>{p.nome_animal}</td>
              <td>{p.nome}</td>
              <td>{p.email}</td>
              <td>{p.telemovel || 'N/D'}</td>
              <td>{new Date(p.data_visita).toLocaleDateString()}</td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={p.estado}
                  onChange={(e) => alterarEstado(p.id, e.target.value)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </td>
              <td>{new Date(p.criado_em).toLocaleString()}</td>
              <td>
                <button className="btn-eliminar" onClick={() => eliminarPedido(p.id)}>
  🗑️ Eliminar
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ConsultaPedidos;
