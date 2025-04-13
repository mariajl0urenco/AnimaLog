import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaAnimais from './components/ListaAnimais';
import FormAdicionarAnimal from './components/FormAdicionarAnimal';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="container py-4">
        <h1 className="text-center mb-4">🐾 AnimaLog - Gestão de Animais</h1>
        <Routes>
          <Route path="/" element={<ListaAnimais />} />
          <Route path="/formulario" element={<FormAdicionarAnimal />} />
          <Route path="/editar/:id" element={<FormAdicionarAnimal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
