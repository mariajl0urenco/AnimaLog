import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import HistoricoVacinas from './HistoricoVacinas';
import HistoricoTestes from './HistoricoTestes';
import AdicionarVacina from './AdicionarVacina';
import AdicionarTeste from './AdicionarTeste';
import EditarTeste from './EditarTeste';
import axios from 'axios';
import imagemPlaceholder from '../assets/sem-foto.jpg';
import './FichaAnimal.css';

const cap = txt => txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : 'N/D';

export default function FichaAnimal({ animal, show, onHide, onEditar, onAtualizado, tipo }) {
  const [vacinas, setVacinas] = useState([]);
  const [testes, setTestes] = useState([]);
  const [showHist, setShowHist] = useState(false);
  const [showHistTestes, setShowHistTestes] = useState(false);
  const [showAddVacina, setShowAddVacina] = useState(false);
  const [showAddTeste, setShowAddTeste] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [showEditTeste, setShowEditTeste] = useState(false);
  const [testeSelecionado, setTesteSelecionado] = useState(null);

  const [showAdop, setShowAdop] = useState(false);
  const [adoptData, setAdoptData] = useState({ dados: '' });
  const [showFalec, setShowFalec] = useState(false);
  const [falecData, setFalecData] = useState({ data: '', motivo: '' });
  const [disponivelAdocao, setDisponivelAdocao] = useState(false);

  useEffect(() => {
    if (animal && show) {
      axios.get(`https://animalog-backend.onrender.com/animais/${animal.id}/vacinas`).then(r => setVacinas(r.data)).catch(console.error);
      axios.get(`https://animalog-backend.onrender.com/animais/${animal.id}/testes`).then(r => setTestes(r.data)).catch(console.error);
      setObservacoes(animal.observacoes || '');
	  setDisponivelAdocao(animal.disponivel_adocao || false);
    }
  }, [animal, show]);

  if (!animal) return null;

  const vacinaMaisRecente = vacinas[0];
  const testeMaisRecente = testes[0];

  const guardarObservacoes = async () => {
    try {
      await axios.put(`https://animalog-backend.onrender.com/animais/${animal.id}`, {
        ...animal,
        observacoes
      });
      onAtualizado?.();
      alert("Observações atualizadas.");
    } catch (e) {
      alert('Erro ao guardar observações');
      console.error(e);
    }
  };
  
    const atualizarDisponivelAdocao = async (novoEstado) => {
    try {
      setDisponivelAdocao(novoEstado);
      await axios.put(`https://animalog-backend.onrender.com/animais/${animal.id}`, {
        ...animal,
        disponivel_adocao: novoEstado
      });
      onAtualizado?.();
    } catch (e) {
      alert('Erro ao atualizar estado de adoção');
      console.error(e);
    }
  };

  const removerAnimal = async () => {
    if (!window.confirm("Tens a certeza que queres remover este animal?")) return;
    try {
      await axios.delete(`https://animalog-backend.onrender.com/animais/${animal.id}`);
      onAtualizado?.();
      onHide();
    } catch (err) {
      alert("Erro ao remover animal.");
      console.error(err);
    }
  };

  const enviarAdopcao = async () => {
    try {
      await axios.put(`https://animalog-backend.onrender.com/animais/${animal.id}`, {
        ...animal,
        saida: new Date().toISOString().slice(0,10),
        motivo_saida: 'adocao',
        dados_adotante: adoptData.dados
      });
      onAtualizado?.();
      setShowAdop(false);
      onHide();
    } catch (e) {
      alert('Erro ao registar adoção');
      console.error(e);
    }
  };

  const enviarFalecimento = async () => {
    try {
      await axios.put(`https://animalog-backend.onrender.com/animais/${animal.id}`, {
        ...animal,
        saida: falecData.data,
        motivo_saida: 'falecimento',
        observacoes: `${animal.observacoes || ''}\n[Falecimento] ${falecData.motivo}`
      });
      onAtualizado?.();
      setShowFalec(false);
      onHide();
    } catch (e) {
      alert('Erro ao registar falecimento');
      console.error(e);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton onHide={onHide}>
          <Modal.Title>Ficha de {animal.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
		<div className="row">
  <div className="col-md-4 mb-3">
    <img
      src={animal.foto || imagemPlaceholder}
      alt={animal.nome}
      className="img-fluid rounded shadow-sm"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = imagemPlaceholder;
      }}
    />
  </div>

  <div className="col-md-8">
		
              <p><strong>Chip:</strong> {animal.chip}</p>
              <p><strong>Espécie:</strong> {cap(animal.especie)}</p>
              <p><strong>Género:</strong> {cap(animal.sexo)}</p>
              <p><strong>Box:</strong> {animal.box || 'N/D'}</p>
              <p><strong>Idade:</strong> {animal.idade ? `${animal.idade} anos` : 'N/D'}</p>
              <p><strong>Entrada:</strong> {animal.entrada?.slice(0,10) || 'N/D'}</p>
              <p><strong>Desparasitação:</strong> {animal.desparasitado ? 'Sim' : 'Não'} {animal.produto_desparasitado ? '— ' + animal.produto_desparasitado : ''} {animal.data_desparasitado ? '— ' + animal.data_desparasitado.slice(0,10) : ''}</p>
              <p><strong>Esterilizado:</strong> {animal.esterilizado ? 'Sim' : 'Não'} {animal.data_esterilizacao ? '— ' + animal.data_esterilizacao.slice(0,10) : ''}</p>
              <p><strong>Comportamento:</strong> {animal.comportamento || 'N/D'}</p>
              <p><strong>Peso:</strong> {animal.peso || 'N/D'} kg</p>
              <p><strong>Titular:</strong> {animal.titular ? 'Sim' : 'Não'}</p>
              <p><strong>Motivo de Entrada:</strong> {animal.motivo_entrada}</p>

              <p>
                <strong>Teste mais recente:</strong>{' '}
                {testeMaisRecente
                  ? `${testeMaisRecente.nome || 'Teste'} — ${testeMaisRecente.resultado === 'pos' ? 'Positivo' : 'Negativo'} (${testeMaisRecente.data?.slice(0,10) || 'sem data'}) ${testeMaisRecente.resultado === 'pos' ? (testeMaisRecente.tratamento_iniciado ? '✅' : '❌') : ''}`
                  : 'N/D'}
              </p>

              <Button variant="outline-primary" size="sm" className="me-2 mb-2" onClick={() => setShowHistTestes(true)}>Ver histórico de testes</Button>
              <Button variant="outline-success" size="sm" className="mb-2" onClick={() => setShowAddTeste(true)}>+ Teste</Button>

              <p>
                <strong>Vacina mais recente:</strong>{' '}
                {vacinaMaisRecente ? `${vacinaMaisRecente.nome} (${vacinaMaisRecente.data?.slice(0,10)})` : 'N/D'}
              </p>

              <Button variant="outline-primary" size="sm" className="me-2 mb-2" onClick={() => setShowHist(true)}>Ver histórico de vacinas</Button>
              <Button variant="outline-success" size="sm" className="mb-2" onClick={() => setShowAddVacina(true)}>+ Vacina</Button>

              <Form.Group className="mt-3">
                <Form.Label><strong>Observações:</strong></Form.Label>
                <Form.Control as="textarea" rows={3} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
                <Button variant="outline-secondary" size="sm" className="mt-2" onClick={guardarObservacoes}>Guardar Observações</Button>
              </Form.Group>
			  
			                <Form.Group className="mt-3">
                <Form.Check
                  type="checkbox"
                  label="Disponível para Adoção"
                  checked={disponivelAdocao}
                  onChange={(e) => atualizarDisponivelAdocao(e.target.checked)}
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

<Modal.Footer className="justify-content-between">
  <div>
    <Button variant="success" className="me-2" onClick={() => setShowAdop(true)}>🏠 Adoção</Button>
    <Button variant="dark" onClick={() => setShowFalec(true)}>🌈 Falecimento</Button>
  </div>
  <div>
    <Button variant="danger" className="me-2" onClick={removerAnimal}>🗑️ Remover</Button>
    {tipo === 'tecnico' && (
      <Button variant="primary" onClick={() => onEditar(animal.id)}>Editar</Button>
    )}
  </div>
</Modal.Footer>

      </Modal>

      {/* Modais externos */}
      <HistoricoVacinas show={showHist} vacinas={vacinas} onHide={() => setShowHist(false)} />
      <HistoricoTestes show={showHistTestes} testes={testes} onHide={() => setShowHistTestes(false)} onEditar={t => { setTesteSelecionado(t); setShowEditTeste(true); }} />
      <AdicionarVacina show={showAddVacina} onHide={() => setShowAddVacina(false)} onGuardar={async v => {
        await axios.post(`https://animalog-backend.onrender.com/animais/${animal.id}/vacinas`, v);
        const r = await axios.get(`https://animalog-backend.onrender.com/animais/${animal.id}/vacinas`);
        setVacinas(r.data);
      }} />
      <AdicionarTeste show={showAddTeste} onHide={() => setShowAddTeste(false)} onGuardar={async t => {
        await axios.post(`https://animalog-backend.onrender.com/animais/${animal.id}/testes`, t);
        const r = await axios.get(`https://animalog-backend.onrender.com/animais/${animal.id}/testes`);
        setTestes(r.data);
      }} />
      <EditarTeste show={showEditTeste} teste={testeSelecionado} onHide={() => setShowEditTeste(false)} onGuardar={async t => {
        await axios.put(`https://animalog-backend.onrender.com/animais/testes/${t.id}`, t);
        const r = await axios.get(`https://animalog-backend.onrender.com/animais/${animal.id}/testes`);
        setTestes(r.data);
      }} />
	  
	  {showAdop && (
  <Modal show onHide={() => setShowAdop(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirmar Adoção</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group>
        <Form.Label>Dados do Adotante:</Form.Label>
        <Form.Control
          type="text"
          value={adoptData.dados}
          onChange={e => setAdoptData({ dados: e.target.value })}
          placeholder="Nome, contacto, etc."
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowAdop(false)}>Cancelar</Button>
      <Button variant="success" onClick={enviarAdopcao}>Confirmar Adoção</Button>
    </Modal.Footer>
  </Modal>
)}

{showFalec && (
  <Modal show onHide={() => setShowFalec(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Registar Falecimento</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group>
        <Form.Label>Data do Falecimento:</Form.Label>
        <Form.Control
          type="date"
          value={falecData.data}
          onChange={e => setFalecData({ ...falecData, data: e.target.value })}
        />
      </Form.Group>
      <Form.Group className="mt-2">
        <Form.Label>Motivo:</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={falecData.motivo}
          onChange={e => setFalecData({ ...falecData, motivo: e.target.value })}
          placeholder="Descreve o motivo"
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowFalec(false)}>Cancelar</Button>
      <Button variant="dark" onClick={enviarFalecimento}>Confirmar</Button>
    </Modal.Footer>
  </Modal>
)}
	  
    </>
  );
}
