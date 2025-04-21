// src/components/FichaAnimal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import HistoricoVacinas   from './HistoricoVacinas';
import AdicionarVacina    from './AdicionarVacina';
import axios              from 'axios';
import imagemPlaceholder  from '../assets/sem-foto.jpg';
import './FichaAnimal.css';

/* ─── helpers ────────────────────────────────────────────── */
const cap = txt => txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : 'N/D';

export default function FichaAnimal({
  animal, show, onHide, onEditar, onAtualizado
}) {
  const [vacinas,       setVacinas]       = useState([]);
  const [showHist,      setShowHist]      = useState(false);
  const [showAdd,       setShowAdd]       = useState(false);

  /* adopção / falecimento */
  const [showAdop,      setShowAdop]      = useState(false);
  const [adoptData,     setAdoptData]     = useState({ dados:'' });
  const [showFalec,     setShowFalec]     = useState(false);
  const [falecData,     setFalecData]     = useState({ data:'', motivo:'' });

  useEffect(() => {
    if (animal && show) {
      axios.get(`http://localhost:3001/animais/${animal.id}/vacinas`)
           .then(r => setVacinas(r.data))
           .catch(console.error);
    }
  }, [animal, show]);

  if (!animal) return null;

  const tratamentoIcon = animal.tratamento_iniciado ? '✅' : '❌';
  const vacinaMaisRecente = vacinas[0];

  /* ─── adopção / falecimento API calls ─── */
  const enviarAdopcao = async () => {
    try{
      await axios.put(`http://localhost:3001/animais/${animal.id}`, {
        ...animal,
        saida       : new Date().toISOString().slice(0,10),
        motivo_saida: 'adocao',
        dados_adotante: adoptData.dados
      });
      onAtualizado?.();     // opcional para refrescar lista
      setShowAdop(false);
      onHide();
    }catch(e){ alert('Erro ao registar adoção'); console.error(e); }
  };

  const enviarFalecimento = async () => {
    try{
      await axios.put(`http://localhost:3001/animais/${animal.id}`, {
        ...animal,
        saida       : falecData.data,
        motivo_saida: 'falecimento',
        observacoes : `${animal.observacoes || ''}\n[Falecimento] ${falecData.motivo}`
      });
      onAtualizado?.();
      setShowFalec(false);
      onHide();
    }catch(e){ alert('Erro ao registar falecimento'); console.error(e); }
  };

  return (
    <>
      {/* ────────── MODAL PRINCIPAL ────────── */}
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ficha de {animal.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            {/* foto */}
            <div className="col-md-4 mb-3">
              <img
                src={animal.foto
                      ? `http://localhost:3001/animais/uploads/${animal.foto}`
                      : imagemPlaceholder}
                alt={animal.nome}
                className="img-fluid rounded shadow-sm"
              />
            </div>

            {/* dados */}
            <div className="col-md-8">
              <p><strong>Chip:</strong> {animal.chip}</p>
              <p><strong>Espécie:</strong> {cap(animal.especie)}</p>
              <p><strong>Género:</strong> {cap(animal.sexo)}</p>
              <p><strong>Box:</strong> {animal.box || 'N/D'}</p>
              <p><strong>Idade:</strong> {animal.idade ? `${animal.idade} anos` : 'N/D'}</p>
              <p><strong>Entrada:</strong> {animal.entrada?.slice(0,10) || 'N/D'}</p>

              {/* Desparasitação */}
              <p>
                <strong>Desparasitação:</strong> {animal.desparasitado ? 'Sim' : 'Não'}
                {animal.desparasitado && (
                  <> — {animal.produto_desparasitado || 'Produto N/D'} — {animal.data_desparasitado?.slice(0,10) || 'Data N/D'}</>
                )}
              </p>

              <p><strong>Esterilizado:</strong> {animal.esterilizado ? 'Sim' : 'Não'}</p>
              <p><strong>Comportamento:</strong> {animal.comportamento || 'N/D'}</p>
              <p><strong>Peso:</strong> {animal.peso || 'N/D'} kg</p>
              <p><strong>Titular:</strong> {animal.titular ? 'Sim' : 'Não'}</p>
              <p><strong>Motivo de Entrada:</strong> {animal.motivo_entrada}</p>

              {/* Testes com ícone */}
              <p>
                <strong>Testes:</strong>{' '}
                {animal.testes === 'pos' ? 'Positivo' : animal.testes === 'neg' ? 'Negativo' : 'N/D'}
                {' '}({animal.data_testes?.slice(0,10) || 'Sem data'}){' '}
                {animal.testes === 'pos' && <span className="ms-1">{tratamentoIcon}</span>}
              </p>

              {/* Tratamento/Medicação */}
              <p>
                <strong>Tratamento/Medicação:</strong> {animal.tratamento || 'N/D'}
              </p>

              {/* Vacina recente + botões */}
              <p>
                <strong>Vacina mais recente:</strong>{' '}
                {vacinaMaisRecente
                  ? `${vacinaMaisRecente.nome} (${vacinaMaisRecente.data?.slice(0,10)})`
                  : 'N/D'}
                <br/>
                <Button variant="outline-primary" size="sm" className="mt-2 me-2"
                        onClick={() => setShowHist(true)}>
                  Ver histórico de vacinas
                </Button>
                <Button variant="outline-success" size="sm" className="mt-2"
                        onClick={() => setShowAdd(true)}>
                  + Adicionar vacina
                </Button>
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <div>
            {/* BOTÕES ADOÇÃO / FALECIMENTO */}
            <Button variant="success" className="me-2" onClick={() => setShowAdop(true)}>
              🏠 Adoção
            </Button>
            <Button variant="dark" onClick={() => setShowFalec(true)}>
              🌈 Falecimento
            </Button>
          </div>

          <div>
            <Button variant="secondary" onClick={() => onEditar(animal.id)}>Editar</Button>
            <Button variant="primary" className="ms-2" onClick={onHide}>Fechar</Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* ────────── MODAIS SECUNDÁRIOS ────────── */}
      <HistoricoVacinas
        vacinas={vacinas}
        show={showHist}
        onHide={() => setShowHist(false)}
      />

      <AdicionarVacina
        show={showAdd}
        onHide={() => setShowAdd(false)}
        onGuardar={async v => {
          await axios.post(`http://localhost:3001/animais/${animal.id}/vacinas`, v);
          const r = await axios.get(`http://localhost:3001/animais/${animal.id}/vacinas`);
          setVacinas(r.data);
        }}
      />

      {/* MODAL ADOÇÃO */}
      <Modal show={showAdop} onHide={() => setShowAdop(false)} centered>
        <Modal.Header closeButton><Modal.Title>Registar Adoção</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Dados do Adotante</Form.Label>
            <Form.Control as="textarea" rows={3}
                          value={adoptData.dados}
                          onChange={e => setAdoptData({ dados:e.target.value })}/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdop(false)}>Cancelar</Button>
          <Button variant="success" onClick={enviarAdopcao}>Confirmar</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL FALECIMENTO */}
      <Modal show={showFalec} onHide={() => setShowFalec(false)} centered>
        <Modal.Header closeButton><Modal.Title>Registar Falecimento</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Data</Form.Label>
            <Form.Control type="date"
                          value={falecData.data}
                          onChange={e => setFalecData({...falecData, data:e.target.value})}/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Motivo / Observações</Form.Label>
            <Form.Control as="textarea" rows={3}
                          value={falecData.motivo}
                          onChange={e => setFalecData({...falecData, motivo:e.target.value})}/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFalec(false)}>Cancelar</Button>
          <Button variant="dark" onClick={enviarFalecimento}>Confirmar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
