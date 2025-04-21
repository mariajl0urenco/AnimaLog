import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListaAnimais from './components/ListaAnimais';
import FormAdicionarAnimal from './components/FormAdicionarAnimal';
import HistoricoAnimais from './components/HistoricoAnimais';
import Boxes from './components/Boxes';
import FormEditarAnimal from './components/FormEditarAnimal'; // <- Certo!
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div
        style={{
          backgroundImage: 'url("/fundo-animais.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '120px',
          backgroundColor: '#fdfdfd',
          minHeight: '100vh'
        }}
      >
        <div className="container py-4">
          <h1 className="text-center mb-4">🐾 AnimaLog - Gestão de Animais</h1>

          <nav className="mb-4 d-flex flex-wrap justify-content-center gap-3">
            <Link className="btn btn-outline-primary" to="/">Animais no Canil</Link>
            <Link className="btn btn-outline-primary" to="/historico">Histórico de Animais</Link>
            <Link className="btn btn-outline-primary" to="/boxes">BOX's</Link>
            <Link className="btn btn-success" to="/formulario">+ Adicionar Animal</Link>
          </nav>

          <Routes>
            <Route path="/" element={<ListaAnimais />} />
            <Route path="/historico" element={<HistoricoAnimais />} />
            <Route path="/boxes" element={<Boxes />} />
            <Route path="/formulario" element={<FormAdicionarAnimal />} />
            <Route path="/editar-animal/:id" element={<FormEditarAnimal />} /> {/* <- Rota corrigida */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
