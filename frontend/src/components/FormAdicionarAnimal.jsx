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

  /* ───── Handlers ───── */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  if (
    !formData.nome.trim() ||
    !formData.especie ||
    !formData.chip ||
    !formData.entrada ||
    !formData.motivo_entrada
  ) {
    alert('Preenche Nome, Espécie, Chip, Data de Entrada e Motivo de Entrada.');
    return;
  }
  if (formData.chip.length !== 15) {
    alert('O número de chip deve ter exatamente 15 dígitos.');
    return;
  }

  try {
    let urlFoto = null;

    if (imagemFinal instanceof Blob) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_KEY
      );

      const nomeFicheiro = `animal_${formData.chip}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase
        .storage
        .from('fotos-animais')
        .upload(nomeFicheiro, imagemFinal, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('fotos-animais').getPublicUrl(nomeFicheiro);
      urlFoto = data.publicUrl;
    }

    const finalData = {
  ...formData,
  vacinas: JSON.stringify(formData.vacinas)
};

if (urlFoto) {
  finalData.foto = urlFoto;
}

    await axios.post('https://animalog-backend.onrender.com/animais', finalData);

    alert('Animal adicionado com sucesso!');
    navigate('/');
  } catch (err) {
    console.error(err);
    alert('Erro ao guardar animal.');
  }
};


  /* ───── Render ───── */
  return (
    <>
      <form
        className="form-animal"                
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2>Adicionar Animal</h2>

        {/* SEÇÃO PRINCIPAL */}
        <div className="section-box">
          <input
            type="text"
            name="nome"
            placeholder="Nome *"
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
            type="text"
            name="chip"
            placeholder="Chip (15 dígitos) *"
            className="form-control mb-2"
            value={formData.chip}
            onChange={handleChange}
            maxLength="15"
            required
          />

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
        </div>

        {/* DADOS OPCIONAIS */}
        <h4>Dados adicionais</h4>
        <div className="section-box">
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
            name="sexo"
            className="form-select mb-2"
            value={formData.sexo}
            onChange={handleChange}
          >
            <option value="">-- Sexo --</option>
            <option value="fêmea">Fêmea</option>
            <option value="macho">Macho</option>
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
            placeholder="Idade"
            className="form-control mb-2"
            value={formData.idade}
            onChange={handleChange}
          />
          <input
            type="number"
            name="peso"
            placeholder="Peso (kg)"
            className="form-control mb-2"
            value={formData.peso}
            onChange={handleChange}
          />
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
