// src/components/ListaAnimais.jsx
import React, { useEffect, useState } from 'react';
import axios            from 'axios';
import { useNavigate }  from 'react-router-dom';
import ReactPaginate    from 'react-paginate';
import FichaAnimal      from './FichaAnimal';
import './ListaAnimais.css';
import imagemPlaceholder from '../assets/sem-foto.jpg';

export default function ListaAnimais() {
  const [animais, setAnimais]         = useState([]);
  const [pagina,  setPagina]          = useState(0);
  const [filtroEspecie, setEspecie]   = useState('todos');
  const [pesquisa, setPesquisa]       = useState('');          
  const [sel, setSel]                 = useState(null);
  const [show, setShow]               = useState(false);
  const navigate = useNavigate();

  const porPagina = 16;

  /* ── carrega lista ── */
  useEffect(() => {
    axios.get('http://localhost:3001/animais')
         .then(r => setAnimais(r.data))
         .catch(console.error);
  }, []);

  /* ── filtros ── */
  const ativos = animais.filter(a => !a.saida);

  const porEspecie = filtroEspecie === 'todos'
    ? ativos
    : ativos.filter(a => a.especie?.toLowerCase() === filtroEspecie);

  const porPesquisa = pesquisa.trim()
    ? porEspecie.filter(a =>
        a.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        a.chip?.includes(pesquisa))
    : porEspecie;

  /* ── paginação ── */
  const totalPaginas = Math.ceil(porPesquisa.length / porPagina);
  const inicio       = pagina * porPagina;
  const visiveis     = porPesquisa.slice(inicio, inicio + porPagina);

  const mudaPagina = ({ selected }) => setPagina(selected);

  /* ── abre ficha ── */
  const abreFicha = a => { setSel(a); setShow(true); };

  return (
    <div>
      {/* cabeçalho + filtros */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h2 className="mb-0 me-auto">Animais no Canil</h2>

        {/* pesquisa */}
        <input
          type="text"
          placeholder="🔍 Nome ou Chip"
          className="form-control"
          style={{ maxWidth: '220px' }}
          value={pesquisa}
          onChange={e => { setPesquisa(e.target.value); setPagina(0); }}
        />

        {/* seletor espécie */}
        <select
          className="form-select w-auto"
          value={filtroEspecie}
          onChange={e => { setEspecie(e.target.value); setPagina(0); }}
        >
          <option value="todos">Todos</option>
          <option value="canina">Canina</option>
          <option value="felina">Felina</option>
        </select>
      </div>

      {/* cards */}
      <div className="row">
        {visiveis.length === 0 ? (
          <p className="text-muted">Nenhum animal encontrado.</p>
        ) : (
          visiveis.map(a => (
            <div className="col-12 col-sm-6 col-md-3 mb-4" key={a.id}>
              <div
                className="card h-100 shadow-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => abreFicha(a)}
              >
                <img
                  src={a.foto
                        ? `http://localhost:3001/animais/uploads/${a.foto}`
                        : imagemPlaceholder}
                  className="card-img-top"
                  alt={a.nome}
                  style={{ objectFit: 'cover', height: '180px' }}
                />
                <div className="card-body">
                  <h5 className="card-title mb-0">{a.nome}</h5>
                  <h6 className="card-subtitle text-muted mb-2 text-capitalize">
                    {a.especie}
                  </h6>

                  <p className="card-text small">
                    <strong>Chip:</strong> {a.chip}<br />
                    <strong>Género:</strong>{' '}
                    <span className="text-capitalize">{a.sexo || 'N/D'}</span><br />
                    <strong>Box:</strong> {a.box || 'N/D'}<br />
                    <strong>Idade:</strong> {a.idade || 'N/D'}<br />
                    <strong>Entrada:</strong> {a.entrada?.slice(0, 10) || 'N/D'}<br />
                    <strong>Esterilizado:</strong> {a.esterilizado ? 'Sim' : 'Não'}<br />
                    <strong>Desparasitado:</strong> {a.desparasitado ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* paginação */}
      {totalPaginas > 1 && (
        <ReactPaginate
          previousLabel={'← Anterior'}
          nextLabel={'Próxima →'}
          pageCount={totalPaginas}
          onPageChange={mudaPagina}
          containerClassName="pagination justify-content-center mt-4"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          activeClassName="active"
        />
      )}

      {/* ficha individual */}
      <FichaAnimal
        show={show}
        onHide={() => setShow(false)}
        animal={sel}
        onEditar={id => navigate(`/editar-animal/${id}`)}
        onRemover={id => {
          if (window.confirm('Tem a certeza que quer remover este animal?')) {
            axios.delete(`http://localhost:3001/animais/${id}`)
                 .then(() => {
                   setAnimais(animais.filter(x => x.id !== id));
                   setShow(false);
                 })
                 .catch(console.error);
          }
        }}
      />
    </div>
  );
}
