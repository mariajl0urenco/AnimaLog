import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { Modal, Button, Form } from 'react-bootstrap';
import './ListaAnimais.css';
import FichaAnimal from './FichaAnimal';

export default function HistoricoAnimais() {
  const [animais, setAnimais] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [pesq, setPesq] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [show, setShow] = useState(false);
  const [sel, setSel] = useState(null);
  const [dataReg, setDataReg] = useState('');
  const [motivoReg, setMotivoReg] = useState('');

  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/animais')
         .then(r => setAnimais(r.data))
         .catch(console.error);
  }, []);

  const historico = animais.filter(a => a.saida);
  const filtradoTipo = tipo === 'todos'
    ? historico
    : historico.filter(a => a.motivo_saida === (tipo === 'adocao' ? 'adocao' : 'falecimento'));
  const filtradoBusca = filtradoTipo.filter(a =>
    a.nome.toLowerCase().includes(pesq.toLowerCase()) ||
    a.chip.toLowerCase().includes(pesq.toLowerCase()));

  const porPagina = 16;
  const offset = pagina * porPagina;
  const paginados = filtradoBusca.slice(offset, offset + porPagina);
  const totalPags = Math.ceil(filtradoBusca.length / porPagina);

  const badge = mot => mot === 'adocao'
    ? <span className="badge bg-success position-absolute top-0 start-0 m-2">🏠 Adotado</span>
    : <span className="badge bg-danger position-absolute top-0 start-0 m-2">🌈 Faleceu</span>;

  const submeterRegresso = async () => {
    try {
      await axios.put(`http://localhost:3001/animais/${sel.id}/regresso`, {
        data_regresso: dataReg,
        motivo_volta: motivoReg
      });
      setAnimais(a => a.map(x => x.id === sel.id
        ? { ...x, saida: null, motivo_saida: null, motivo_volta: motivoReg }
        : x));
      setShow(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao registar regresso.');
    }
  };

  return (
    <div>
      <h2 className="mb-3">Histórico de Animais</h2>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <Form.Select
          style={{ maxWidth: '180px' }}
          value={tipo}
          onChange={e => { setTipo(e.target.value); setPagina(0); }}
        >
          <option value="todos">Todos</option>
          <option value="adocao">Adotados</option>
          <option value="falecimento">Falecidos</option>
        </Form.Select>

        <div className="flex-grow-1" style={{ maxWidth: '320px' }}>
          <Form.Control
            type="text"
            placeholder="🔍 Nome ou Chip"
            value={pesq}
            onChange={e => { setPesq(e.target.value); setPagina(0); }}
          />
        </div>
      </div>

      <div className="row">
        {paginados.length === 0
          ? <p className="text-muted">Nenhum animal com esse critério.</p>
          : paginados.map(a => (
            <div className="col-12 col-sm-6 col-md-3 mb-4" key={a.id}>
              <div className="card shadow-sm h-100 position-relative">
                {a.foto && (
                  <img
                    src={`http://localhost:3001/animais/uploads/${a.foto}`}
                    className="card-img-top"
                    style={{ objectFit: 'cover', maxHeight: '250px' }}
                    alt={a.nome}
                  />
                )}
                {badge(a.motivo_saida)}

                <div className="card-body">
                  <h5 className="card-title">{a.nome}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {a.especie.charAt(0).toUpperCase() + a.especie.slice(1)}
                  </h6>

                  <p className="card-text small">
                    <strong>Chip:</strong> {a.chip}<br />
                    <strong>Vacinas:</strong> {a.vacinas || 'N/D'}<br />
                    <strong>Doenças:</strong> {a.doencas || 'N/D'}<br />
                    <strong>Entrada:</strong> {a.entrada?.slice(0, 10) || 'N/D'}<br />
                    <strong>Saída:</strong> {a.saida?.slice(0, 10) || 'N/D'}<br />
                    <strong>Motivo:</strong> {a.motivo_saida === 'adocao' ? 'Adoção' : 'Falecimento'}<br />
                    {a.motivo_saida === 'adocao' && a.dados_adotante && (
                      <>
                        <strong>Dados do Adotante:</strong><br />
                        {a.dados_adotante}<br />
                      </>
                    )}
                    <strong>Observações:</strong> {a.observacoes || 'Sem observações.'}
                  </p>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => { setAnimalSelecionado(a); setMostrarFicha(true); }}
                  >
                    🔍 Ver Ficha
                  </Button>

                  {a.motivo_saida === 'adocao' && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => { setSel(a); setShow(true); }}
                    >
                      🔄 Reentrada
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <ReactPaginate
        previousLabel={'← Anterior'} nextLabel={'Próxima →'}
        pageCount={totalPags}
        onPageChange={({ selected }) => setPagina(selected)}
        containerClassName={'pagination justify-content-center mt-4'}
        pageClassName={'page-item'} pageLinkClassName={'page-link'}
        previousClassName={'page-item'} previousLinkClassName={'page-link'}
        nextClassName={'page-item'} nextLinkClassName={'page-link'}
        activeClassName={'active'}
      />

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reentrada no Canil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Indique a data de regresso e o motivo.</p>
          <Form.Group className="mb-3">
            <Form.Label>Data de Reentrada</Form.Label>
            <Form.Control
              type="date"
              value={dataReg}
              onChange={e => setDataReg(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Motivo</Form.Label>
            <Form.Control
              as="textarea" rows={2}
              value={motivoReg}
              onChange={e => setMotivoReg(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
          <Button variant="primary" onClick={submeterRegresso}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {mostrarFicha && animalSelecionado && (
        <FichaAnimal
          animal={animalSelecionado}
          show={mostrarFicha}
          onHide={() => setMostrarFicha(false)}
          onEditar={(id) => window.location.href = `/editar/${id}`}
          onAtualizado={() => {
            axios.get('http://localhost:3001/animais')
                 .then(r => setAnimais(r.data))
                 .catch(console.error);
          }}
        />
      )}
    </div>
  );
}
