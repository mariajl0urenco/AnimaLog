// src/components/FormAdicionarAnimal.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CropImage from './CropImage';
import './FormAnimal.css';                     

export default function FormAdicionarAnimal() {
  const [formData, setFormData] = useState({
    nome: '',
    especie: '',
    chip: '',
    entrada: '',
    raca: '',
    cor: '',
    box: '',
    sexo: '',
    esterilizado: '',
	desparasitado: '',
  disponivel_adocao: '',
  testes: [],
    nascimento: '',
    idade: '',
    peso: '',
    vacinas: [],
    titular: '',
    motivo_entrada: '',
    concelho: '',
    local_ocorrencia: ''
  });
  
  const [imagemPreview, setImagemPreview] = useState(null);
  const [imagemFinal, setImagemFinal] = useState(null);
  const [mostrarCropper, setMostrarCropper] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const navigate = useNavigate();

  /* ───── Carrega lista de BOXs ───── */
  useEffect(() => {
    axios.get('https://animalog-backend.onrender.com/boxes/nome')
      .then(res => setBoxes(res.data))
      .catch(console.error);
  }, []);

  /* ───── Lógica entre Data de Nascimento e Idade ───── */
  useEffect(() => {
    if (formData.nascimento) {
      const nasc = new Date(formData.nascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
      if (!isNaN(idade)) {
        setFormData(prev => ({ ...prev, idade: idade.toString() }));
      }
    }
  }, [formData.nascimento]);

  const handleChange = e => {
    const { name, value } = e.target;

    // Se o usuário alterar o campo "idade" manualmente, limpo a data de nascimento
    if (name === "idade" && value) {
      setFormData(prev => ({ ...prev, idade: value, nascimento: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVacinaChange = (i, field, value) => {
    const v = [...formData.vacinas];
    v[i][field] = value;
    setFormData(prev => ({ ...prev, vacinas: v }));
  };

  const adicionarVacina = () =>
    setFormData(prev => ({
      ...prev,
      vacinas: [...prev.vacinas, { nome: '', data: '' }]
    }));

  const handleImagemSelecionada = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagemPreview(reader.result);
      setMostrarCropper(true);
    };
    reader.readAsDataURL(file);
  };

  /* ───── SUBMIT ───── */
  const handleSubmit = async e => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    if (
      !formData.nome.trim() ||
      !formData.especie ||
      !formData.entrada ||
      !formData.motivo_entrada ||
      !formData.sexo ||
      (!formData.idade && !formData.nascimento)
    ) {
      alert('Preenche todos os campos obrigatórios: Nome / Nº de processo, Espécie, Data de Entrada, Motivo de Entrada, Sexo e Idade ou Data de Nascimento.');
      return;
    }

    // Se o chip for preenchido, valida o tamanho
    if (formData.chip && formData.chip.length !== 15) {
      alert('O número de chip deve ter exatamente 15 dígitos.');
      return;
    }

    // Prepara FormData para envio multipart
    const data = new FormData();
	Object.entries(formData).forEach(([key, val]) => {
  if (key === 'vacinas') {
    data.append('vacinas', JSON.stringify(val));
  } else if (key === 'testes') {
    const testesCorrigidos = val.map(t => ({
      ...t,
      tratamento_iniciado:
        t.tratamento_iniciado?.toLowerCase?.() === 'sim' ? true : false
    }));
    data.append('testes', JSON.stringify(testesCorrigidos));
  } else if (['esterilizado', 'titular', 'desparasitado', 'disponivel_adocao'].includes(key)) {
    const valor = typeof val === 'string' ? val.toLowerCase() : '';
    data.append(key, valor === 'sim' ? 'true' : 'false');
  } else {
    data.append(key, val);
  }
});



    if (imagemFinal instanceof Blob) data.append('foto', imagemFinal, 'animal.jpg');

    try {
      await axios.post('https://animalog-backend.onrender.com/animais', data);
      alert('Animal adicionado com sucesso!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar animal.');
    }
  };

  return (
    <>
      <form className="form-animal" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Adicionar Animal</h2>

        {/* ───── BLOCO OBRIGATÓRIO ───── */}
        <div className="section-box">
          <input
            type="text"
            name="nome"
            placeholder="Nome / Nº de processo *"
            className="form-control mb-2"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <select
            name="especie"
            className="form-select mb-2"
            value={formData.especie}
            onChange={handleChange}
            required
          >
            <option value="">-- Espécie * --</option>
            <option value="canina">Canina</option>
            <option value="felina">Felina</option>
          </select>

          <input
            type="date"
            name="entrada"
            className="form-control mb-2"
            value={formData.entrada}
            onChange={handleChange}
            required
          />

          <select
            name="motivo_entrada"
            className="form-select mb-2"
            value={formData.motivo_entrada}
            onChange={handleChange}
            required
          >
            <option value="">-- Motivo de Entrada * --</option>
            <option value="Entrega por Detentor">Entrega por Detentor</option>
            <option value="Entrega por Não Detentor">Entrega por Não Detentor</option>
            <option value="Entrega por Autoridade Policial">Entrega por Autoridade Policial</option>
            <option value="Entrega por Entidade Rodoviária">Entrega por Entidade Rodoviária</option>
            <option value="Recolha de Animal Errante">Recolha de Animal Errante</option>
            <option value="Recolha de Animal a Particular">Recolha de Animal a Particular</option>
            <option value="Sequestro Sanitário">Sequestro Sanitário</option>
            <option value="Apreendido">Apreendido</option>
          </select>

          <select
            name="sexo"
            className="form-select mb-2"
            value={formData.sexo}
            onChange={handleChange}
            required
          >
            <option value="">-- Sexo * --</option>
            <option value="fêmea">Fêmea</option>
            <option value="macho">Macho</option>
          </select>

          <label>Data de Nascimento</label>
          <input
            type="date"
            name="nascimento"
            className="form-control mb-2"
            value={formData.nascimento}
            onChange={handleChange}
          />

          <input
            type="number"
            name="idade"
            placeholder="Idade *"
            className="form-control mb-2"
            value={formData.idade}
            onChange={handleChange}
            required={!formData.nascimento}
          />
        </div>

        {/* ───── BLOCO DE DADOS ADICIONAIS ───── */}
        <h4>Dados adicionais</h4>
        <div className="section-box">
          <input
            type="text"
            name="chip"
            placeholder="Chip (15 dígitos)"
            className="form-control mb-2"
            value={formData.chip}
            onChange={handleChange}
            maxLength="15"
          />
          <input
            type="text"
            name="raca"
            placeholder="Raça"
            className="form-control mb-2"
            value={formData.raca}
            onChange={handleChange}
          />
          <input
            type="text"
            name="cor"
            placeholder="Cor"
            className="form-control mb-2"
            value={formData.cor}
            onChange={handleChange}
          />
          <select
            name="box"
            className="form-select mb-2"
            value={formData.box}
            onChange={handleChange}
          >
            <option value="">-- Box de Acolhimento --</option>
            {boxes.map((b, i) => <option key={i} value={b}>{b}</option>)}
          </select>
          <select
            name="esterilizado"
            className="form-select mb-2"
            value={formData.esterilizado}
            onChange={handleChange}
          >
            <option value="">-- Esterilizado/Castrado --</option>
            <option value="sim">Sim</option>
            <option value="não">Não</option>
          </select>
          <input
            type="number"
            name="peso"
            placeholder="Peso (kg)"
            className="form-control mb-2"
            value={formData.peso}
            onChange={handleChange}
          />
          {/* Outros campos opcionais, se houver */}
        </div>

        {/* VACINAS */}
        <h4>Vacinas</h4>
        <div className="section-box">
          {formData.vacinas.map((vac, idx) => (
            <div key={idx} className="vacina-row d-flex gap-2 mb-1">
              <input
                type="text"
                className="form-control"
                placeholder="Nome"
                value={vac.nome}
                onChange={e => handleVacinaChange(idx, 'nome', e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                value={vac.data}
                onChange={e => handleVacinaChange(idx, 'data', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={adicionarVacina}
          >
            + Adicionar vacina
          </button>
        </div>

{/* TESTES */}
<h4>Testes</h4>
<div className="section-box">
  {formData.testes.map((teste, idx) => (
    <div key={idx} className="teste-row d-flex gap-2 mb-2 align-items-center">
      <input
        type="text"
        className="form-control"
        placeholder="Nome do Teste"
        value={teste.nome}
        onChange={e => {
          const novos = [...formData.testes];
          novos[idx].nome = e.target.value;
          setFormData(prev => ({ ...prev, testes: novos }));
        }}
      />
      <select
  className="form-select"
  value={teste.resultado}
  onChange={e => {
    const novos = [...formData.testes];
    novos[idx].resultado = e.target.value.toLowerCase(); 
    setFormData(prev => ({ ...prev, testes: novos }));
  }}
>
  <option value="">-- Resultado --</option>
  <option value="positivo">Positivo</option>
  <option value="negativo">Negativo</option>
</select>
      <select
        className="form-select"
        value={teste.tratamento_iniciado}
        onChange={e => {
          const novos = [...formData.testes];
          novos[idx].tratamento_iniciado = e.target.value;
          setFormData(prev => ({ ...prev, testes: novos }));
        }}
      >
        <option value="">Tratamento iniciado?</option>
        <option value="sim">Sim</option>
        <option value="não">Não</option>
      </select>

      {/* Botão de remover teste */}
      <button
        type="button"
        className="btn btn-outline-danger btn-sm"
        onClick={() => {
          const novos = formData.testes.filter((_, i) => i !== idx);
          setFormData(prev => ({ ...prev, testes: novos }));
        }}
        title="Remover teste"
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    className="btn btn-outline-info btn-sm mt-2"
    onClick={() =>
      setFormData(prev => ({
        ...prev,
        testes: [...prev.testes, { nome: '', resultado: '', tratamento_iniciado: '' }]
      }))
    }
  >
    + Adicionar teste
  </button>
</div>


        {/* OUTROS */}
        <h4>Outros</h4>
        <div className="section-box">
          <select
            name="titular"
            className="form-select mb-2"
            value={formData.titular}
            onChange={handleChange}
          >
            <option value="">-- Titular --</option>
            <option value="sim">Sim</option>
            <option value="não">Não</option>
          </select>
          <input
            type="text"
            name="concelho"
            placeholder="Concelho"
            className="form-control mb-2"
            value={formData.concelho}
            onChange={handleChange}
          />
          <input
            type="text"
            name="local_ocorrencia"
            placeholder="Local de Ocorrência"
            className="form-control mb-2"
            value={formData.local_ocorrencia}
            onChange={handleChange}
          />
        </div>

<h4>Disponível para adoção?</h4>
<div className="section-box mb-3">
  <select
    name="disponivel_adocao"
    className="form-select"
    value={formData.disponivel_adocao}
    onChange={handleChange}
  >
    <option value="">-- Selecionar --</option>
    <option value="sim">Sim</option>
    <option value="não">Não</option>
  </select>
</div>

        {/* FOTO */}
        <h4>Fotografia</h4>
        <div className="section-box mb-3">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImagemSelecionada}
          />
        </div>

        {/* Botões */}
        <button className="btn btn-primary me-2" type="submit">
          Adicionar
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => navigate('/')}
        >
          Cancelar
        </button>
      </form>

      {/* Cropper */}
      <CropImage
        image={imagemPreview}
        show={mostrarCropper}
        onClose={() => setMostrarCropper(false)}
        onCropComplete={blob => {
          setImagemFinal(blob);
          setMostrarCropper(false);
        }}
      />
    </>
  );
}

