import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import ModalInfo from './ModalInfo'; // novo import

export default function CabecalhoPublico({ onAgendarVisita }) {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="p-4 mb-4 rounded shadow-sm bg-light bg-opacity-75">
      <div className="d-flex justify-content-center mb-3">
        <img src={logo} alt="Animalog" style={{ height: '250px' }} />
      </div>
<hr />
      <div className="d-flex justify-content-center mb-3 gap-2 flex-wrap">
        <button className="btn btn-outline-secondary" onClick={onAgendarVisita}>
          Agendar Visita
        </button>
		<button className="btn btn-outline-secondary" onClick={() => setShowInfo(true)}>
          Informações
        </button>
        <button className="btn btn-outline-info" onClick={() => navigate('/login')}>
          Entrar como Funcionário
        </button>
      </div>
<hr />
      <div className="text-center">
        <h2 className="fw-bold mb-1">Animais para Adoção</h2>
        <p className="text-muted mb-0">
          Consulte aqui os animais disponíveis para adoção! Caso pretenda, pode realizar um pedido de visita e posteriormente será contactado.
        </p>
      </div>

      <ModalInfo show={showInfo} onHide={() => setShowInfo(false)} />
    </div>
  );
}
