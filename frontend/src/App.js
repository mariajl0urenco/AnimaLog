import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ListaAnimais from './components/ListaAnimais';
import FormAdicionarAnimal from './components/FormAdicionarAnimal';
import HistoricoAnimais from './components/HistoricoAnimais';
import Boxes from './components/Boxes';
import FormEditarAnimal from './components/FormEditarAnimal';
import Login from './components/Login';
import GestaoUtilizadores from './components/GestaoUtilizadores';
import ConsultaPublica from './components/ConsultaPublica';
import ConsultaPedidos from './components/ConsultaPedidos';
import CabecalhoGeral from './components/CabecalhoGeral';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function AppWrapper() {
  const [tipo, setTipo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tipoGuardado = localStorage.getItem('tipo');
    if (tipoGuardado) setTipo(tipoGuardado);
  }, []);

  const handleLogin = (tipoUser) => {
    setTipo(tipoUser);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    setTipo(null);
    navigate('/');
  };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      {/* Cabeçalho visível apenas para utilizadores autenticados */}
      {tipo && <CabecalhoGeral tipo={tipo} onLogout={handleLogout} />}

      <div className="container py-4 flex-grow-1">
        <Routes>
          {!tipo ? (
            <>
              <Route path="/" element={<ConsultaPublica />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
            </>
          ) : (
            <>
              <Route path="/" element={<ListaAnimais tipo={tipo} />} />
              {tipo === 'tecnico' && <Route path="/historico" element={<HistoricoAnimais />} />}
              {tipo === 'tecnico' && <Route path="/boxes" element={<Boxes />} />}
              {tipo === 'tecnico' && <Route path="/pedidos" element={<ConsultaPedidos />} />}
              <Route path="/formulario" element={<FormAdicionarAnimal />} />
              <Route path="/editar-animal/:id" element={<FormEditarAnimal />} />
              {tipo === 'tecnico' && <Route path="/gestao" element={<GestaoUtilizadores />} />}
            </>
          )}
        </Routes>
      </div>

      <footer className="text-center mt-4 py-3">
        ANIMALOG — Desenvolvido por Maria José Lourenço — 2025
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
