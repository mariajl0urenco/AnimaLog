// src/components/Boxes.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { Card, Button, Badge } from 'react-bootstrap';

export default function Boxes() {
  const [nomesBoxes, setNomesBoxes] = useState([]);
  const [boxSelecionada, setBoxSelecionada] = useState('');
  const [animais, setAnimais] = useState([]);
  const [contagens, setContagens] = useState({});
  const [novaBox, setNovaBox] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);

  const animaisPorPagina = 16;
  const offset = paginaAtual * animaisPorPagina;
  const animaisPaginados = animais.slice(offset, offset + animaisPorPagina);
  const totalPaginas = Math.ceil(animais.length / animaisPorPagina);

  // carrega nomes de boxes e contagem de animais por box
useEffect(() => {
  async function fetchBoxesAndCounts() {
    try {
      const [boxesRes, animaisResRaw] = await Promise.all([
        axios.get('https://animalog-backend.onrender.com/boxes/nome'),
        axios.get('https://animalog-backend.onrender.com/animais')
      ]);

      const animaisSemSaida = animaisResRaw.data.filter(a => !a.saida);

      setNomesBoxes(boxesRes.data);

      const counts = {};
      animaisSemSaida.forEach(a => {
        if (a.box) counts[a.box] = (counts[a.box] || 0) + 1;
      });
      setContagens(counts);
    } catch (err) {
      console.error('Erro ao carregar boxes ou animais:', err);
    }
  }
  fetchBoxesAndCounts();
}, []);

  // carrega somente animais da box selecionada 
  useEffect(() => {
    if (!boxSelecionada) return;
    (async () => {
      try {
        const res = await axios.get('https://animalog-backend.onrender.com/animais');
        const filtrados = res.data.filter(a => a.box === boxSelecionada && !a.saida);
        setAnimais(filtrados);
        setPaginaAtual(0);
      } catch (err) {
        console.error('Erro ao carregar animais da box:', err);
      }
    })();
  }, [boxSelecionada]);

  const criarNovaBox = () => {
    const nome = novaBox.trim();
    if (!nome) return;
    if (!nomesBoxes.includes(nome)) {
      setNomesBoxes(prev => [...prev, nome]);
      setContagens(prev => ({ ...prev, [nome]: 0 }));
    }
    setBoxSelecionada(nome);
    setNovaBox('');
  };

  const mudarAnimalDeBox = async (animalId, novaBoxName) => {
    try {
      await axios.put(`https://animalog-backend.onrender.com/animais/${animalId}/box`, { box: novaBoxName });
      // atualiza lista e contagens
      setAnimais(curr => curr.filter(a => a.id !== animalId));
      setContagens(prev => {
        const updated = { ...prev };
        updated[boxSelecionada] = (updated[boxSelecionada] || 1) - 1;
        updated[novaBoxName] = (updated[novaBoxName] || 0) + 1;
        return updated;
      });
    } catch (err) {
      console.error('Erro ao mover animal de box:', err);
    }
  };

  const handlePageClick = ({ selected }) => {
    setPaginaAtual(selected);
  };

  return (
    <div>
      <h2 className="text-left mb-4">📍 Gestão de BOX's</h2>

      {/* ---------------------------
           Mostra todas as boxes
         --------------------------- */}
      <div className="d-flex flex-wrap gap-3 justify-content-left mb-5">
        {nomesBoxes.map((nome, i) => (
          <Card
            key={i}
            style={{ width: '10rem', cursor: 'pointer' }}
            className={nome === boxSelecionada ? 'border-primary shadow' : 'shadow-sm'}
            onClick={() => setBoxSelecionada(nome)}
          >
            <Card.Body className="text-left">
              <Card.Title className="mb-2">{nome}</Card.Title>
              <Badge bg="secondary">{contagens[nome] || 0} animais</Badge>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* ---------------------------
           Criação de nova box
         --------------------------- */}
      <div className="d-flex flex-wrap gap-3 justify-content-left mb-4">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Nova box"
          value={novaBox}
          onChange={(e) => setNovaBox(e.target.value)}
        />
        <Button variant="success" onClick={criarNovaBox}>+ Criar box</Button>
      </div>

      {/* ---------------------------
           Se tiver uma box selecionada,
           mostra os animais com paginação
         --------------------------- */}
      {boxSelecionada && (
        <>
          <h4 className="mb-3 text-left">
            Animais na Box <strong>{boxSelecionada}</strong>
          </h4>

          <div className="row">
            {animaisPaginados.map(animal => (
              <div className="col-12 col-sm-6 col-md-3 mb-4" key={animal.id}>
                <Card className="h-100 shadow-sm">
                  {animal.foto && (
                    <Card.Img
                      variant="top"
                      src={`https://animalog-backend.onrender.com/animais/uploads/${animal.foto}`}
                      style={{ objectFit: 'cover', height: '180px' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{animal.nome}</Card.Title>
                    <select
                      className="form-select"
                      value={animal.box}
                      onChange={(e) => mudarAnimalDeBox(animal.id, e.target.value)}
                    >
                      <option value="">Sem box</option>
                      {nomesBoxes.map((b, idx) => (
                        <option key={idx} value={b}>{b}</option>
                      ))}
                    </select>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          <ReactPaginate
            previousLabel={'← Anterior'}
            nextLabel={'Próxima →'}
            pageCount={totalPaginas}
            onPageChange={handlePageClick}
            containerClassName={'pagination justify-content-center mt-4'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            activeClassName={'active'}
          />
        </>
      )}
    </div>
  );
}
