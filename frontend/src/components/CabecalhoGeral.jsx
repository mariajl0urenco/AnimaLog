// src/components/CabecalhoGeral.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CabecalhoGeral.css';

export default function CabecalhoGeral({ tipo, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="cabecalho">
      <div className="logo-titulo" onClick={() => navigate('/')}>AnimaLog</div>
      <nav className="menu-navegacao">
        {tipo && (
          <>
            <Link to="/" className="botao-menu">Animais no Canil</Link>
            {tipo === 'tecnico' && (
              <>
                <Link to="/historico" className="botao-menu">Histórico</Link>
                <Link to="/boxes" className="botao-menu">BOX's</Link>
                <Link to="/pedidos" className="botao-menu">Pedidos</Link>
              </>
            )}
            <Link to="/formulario" className="botao-menu botao-verde">+ Animal</Link>
            {tipo === 'tecnico' && (
              <Link to="/gestao" className="botao-menu botao-amarelo">Utilizadores</Link>
            )}
            <button className="botao-menu botao-vermelho" onClick={onLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
