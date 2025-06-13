import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ModalPedidoVisita from './ModalPedidoVisita';
import CabecalhoPublico from './CabecalhoPublico';
import ReactPaginate from 'react-paginate';
import 'bootstrap/dist/css/bootstrap.min.css';

function ConsultaPublica() {
  const [animais, setAnimais] = useState([]);
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const animaisPorPagina = 16;
  const offset = paginaAtual * animaisPorPagina;

  useEffect(() => {
    axios.get('http://localhost:3001/animais/publico/adocao')
      .then(res => setAnimais(res.data))
      .catch(err => console.error('Erro ao buscar animais:', err));
  }, []);

  const animaisFiltrados = animais.filter(a => {
    if (filtroEspecie === 'Todos') return true;
    return a.especie?.toLowerCase() === filtroEspecie.toLowerCase();
  });

  const animaisPaginados = animaisFiltrados.slice(offset, offset + animaisPorPagina);
  const totalPaginas = Math.ceil(animaisFiltrados.length / animaisPorPagina);

  const handlePageClick = ({ selected }) => setPaginaAtual(selected);

  return (
    <div className="container py-4">
      <CabecalhoPublico onAgendarVisita={() => setModalAberto(true)} />

      <div className="mb-3 d-flex align-items-center">
        <label className="me-2 fw-bold">Filtrar por espécie:</label>
        <select
          className="form-select w-auto"
          value={filtroEspecie}
          onChange={(e) => {
            setFiltroEspecie(e.target.value);
            setPaginaAtual(0);
          }}
        >
          <option value="Todos">Todos</option>
          <option value="Canina">Canina</option>
          <option value="Felina">Felina</option>
        </select>
      </div>

      {animaisFiltrados.length === 0 ? (
        <p>Nenhum animal disponível para adoção no momento.</p>
      ) : (
        <>
          <div className="row">
            {animaisPaginados.map(animal => (
              <div key={animal.id} className="col-12 col-sm-6 col-md-3 mb-4">
                <div className="card h-100 shadow">
                  {animal.foto ? (
                    <img
                      src={`http://localhost:3001/animais/uploads/${animal.foto}`}
                      alt={animal.nome}
                      className="card-img-top"
                      style={{ objectFit: 'cover', height: '250px' }}
                    />
                  ) : (
                    <div className="bg-secondary text-white d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
                      Sem foto
                    </div>
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{animal.nome}</h5>
                    <p className="card-text">
                      <strong>Espécie:</strong> {animal.especie?.charAt(0).toUpperCase() + animal.especie?.slice(1) || 'N/D'}<br />
                      <strong>Sexo:</strong> {animal.sexo?.charAt(0).toUpperCase() + animal.sexo?.slice(1) || 'N/D'}<br />
                      <strong>Esterilizado:</strong> {animal.esterilizado ? 'Sim' : 'Não'}<br />
                      <strong>Idade:</strong> {animal.idade ? `${animal.idade} anos` : 'N/D'}
                    </p>
                  </div>
                </div>
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

      <ModalPedidoVisita
        show={modalAberto}
        onHide={() => setModalAberto(false)}
        animais={animais}
      />
    </div>
  );
}

export default ConsultaPublica;
