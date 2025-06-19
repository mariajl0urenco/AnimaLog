import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import ModalInfo from './ModalInfo';

export default function CabecalhoPublico({ onAgendarVisita }) {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div
        className="p-4 mb-4 shadow-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        {/* Linha com logo, frase e botões */}
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          {/* Logótipo à esquerda */}
          <img src={logo} alt="Animalog" style={{ height: '200px' }} />

          {/* Frase no centro */}
          <div className="text-center flex-grow-1">
            <p
              style={{
                fontSize: '1.1rem',
                color: '#333',
                margin: '0',
                fontStyle: 'italic',
              }}
            >
              “Adotar é um ato de amor que muda duas vidas.”
            </p>
          </div>

          {/* Botões à direita */}
          <div className="d-flex gap-2">
            <button
              style={{
                backgroundColor: '#adb5bd',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => setShowInfo(true)}
            >
              Informações
            </button>

            <button
              style={{
                backgroundColor: '#5c7cfa',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={onAgendarVisita}
            >
              Agendar Visita
            </button>

            <button
              style={{
                backgroundColor: '#20c997',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/login')}
            >
              Entrar como Funcionário
            </button>
          </div>
        </div>

        <hr />

        {/* Título e subtítulo */}
        <div className="text-center">
          <h2 className="fw-bold mb-1">Animais para Adoção</h2>
          <p className="text-muted mb-0">
            Consulte aqui os animais disponíveis para adoção! Caso pretenda, pode realizar um pedido de visita e posteriormente será contactado.
          </p>
        </div>

        <ModalInfo show={showInfo} onHide={() => setShowInfo(false)} />
      </div>
    </>
  );
}
