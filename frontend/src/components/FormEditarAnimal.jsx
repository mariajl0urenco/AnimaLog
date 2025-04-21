// src/components/FormEditarAnimal.jsx
import React, { useEffect, useState } from 'react';
import axios                          from 'axios';
import { useNavigate, useParams }     from 'react-router-dom';
import CropImage                      from './CropImage';
import './FormAnimal.css';

export default function FormEditarAnimal() {
  /* ───── estado ───── */
  const [formData, setFormData] = useState({
    nome:'', especie:'', chip:'', entrada:'', motivo_entrada:'', saida:'',
    idade:'', data_nascimento:'', peso:'',
    vacinas:[], doencas:'', observacoes:'', comportamento:'',
    sexo:'', esterilizado:false, desparasitado:false,
    testes:'', data_testes:'',                      // ← NOVO
    tratamento:'', tratamento_iniciado:false,
    titular:false, box:'', concelho:'', local_ocorrencia:'',
    raca:'', cor:''
  });
  const [boxes, setBoxes]         = useState([]);
  const [removidas, setRemovidas] = useState([]);
  const [imgPreview, setImgPrev]  = useState(null);
  const [imgFinal, setImgFinal]   = useState(null);
  const [showCrop, setShowCrop]   = useState(false);

  const navigate = useNavigate();
  const { id }   = useParams();

  /* ───── carrega animal, vacinas e boxes ───── */
  useEffect(() => {
    (async () => {
      try {
        const [aRes, vRes, bRes] = await Promise.all([
          axios.get(`http://localhost:3001/animais/${id}`),
          axios.get(`http://localhost:3001/animais/${id}/vacinas`),
          axios.get('http://localhost:3001/boxes/nome')
        ]);
        const a = aRes.data;
        setFormData({
          ...a,
          idade: a.idade || '',
          data_nascimento: a.data_nascimento || '',
          data_testes: a.data_testes || '',          // ← ler do backend
          esterilizado: !!a.esterilizado,
          desparasitado: !!a.desparasitado,
          titular: !!a.titular,
          vacinas: Array.isArray(vRes.data) ? vRes.data : []
        });
        setBoxes(bRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    })();
  }, [id]);

  /* ───── handlers ───── */
  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  /* Vacinas */
  const handleVacinaChange = (i, campo, val) =>
    setFormData(p => {
      const arr = [...p.vacinas];
      arr[i] = { ...arr[i], [campo]: val };
      return { ...p, vacinas: arr };
    });

  const addVacina = () =>
    setFormData(p => ({ ...p, vacinas: [...p.vacinas, { nome:'', data:'' }] }));

  const removeVacina = i =>
    setFormData(p => {
      const vac = p.vacinas[i];
      if (vac.id) setRemovidas(r => [...r, vac.id]);
      return { ...p, vacinas: p.vacinas.filter((_, idx) => idx !== i) };
    });

  /* Imagem */
  const handlePic = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImgPrev(r.result); setShowCrop(true); };
    r.readAsDataURL(f);
  };

  /* ───── submit ───── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.especie || !formData.chip ||
        !formData.entrada || !formData.motivo_entrada) {
      alert('Preenche Nome, Espécie, Chip, Data e Motivo de Entrada.');
      return;
    }
    if (formData.chip.length !== 15) {
      alert('O número de chip deve ter exatamente 15 dígitos.');
      return;
    }
    try {
      const { vacinas, ...animalData } = formData;
      await axios.put(`http://localhost:3001/animais/${id}`, animalData);

      /* apaga vacinas marcadas */
      await Promise.all(removidas.map(vId =>
        axios.delete(`http://localhost:3001/animais/vacinas/${vId}`)));

      /* adiciona vacinas novas */
      for (const vac of vacinas)
        if (!vac.id)
          await axios.post(`http://localhost:3001/animais/${id}/vacinas`, vac);

      /* foto opcional */
      if (imgFinal instanceof Blob) {
        const fd = new FormData();
        fd.append('foto', imgFinal, 'animal.jpg');
        await axios.put(`http://localhost:3001/animais/${id}/foto`, fd);
      }

      alert('Animal atualizado com sucesso!');
      navigate('/');
    } catch (err) {
      console.error('Erro ao guardar alterações:', err);
      alert('Erro ao guardar alterações.');
    }
  };

  /* ───── render ───── */
  return (
    <form onSubmit={handleSubmit} className="form-animal" encType="multipart/form-data">
      <h2>Editar Animal</h2>

      {/* principais */}
      <div className="mb-3">
        <label>Nome *</label>
        <input name="nome" value={formData.nome} onChange={handleChange}
               className="form-control" required />
      </div>
      <div className="mb-3">
        <label>Chip (15 dígitos) *</label>
        <input name="chip" value={formData.chip} maxLength={15}
               onChange={handleChange} className="form-control" required />
      </div>
      <div className="mb-3">
        <label>Data de Entrada *</label>
        <input type="date" name="entrada"
               value={formData.entrada?.slice(0,10) || ''}
               onChange={handleChange} className="form-control" required />
      </div>
      <div className="mb-3">
        <label>Motivo de Entrada *</label>
        <select name="motivo_entrada" value={formData.motivo_entrada}
                onChange={handleChange} className="form-select" required>
          <option value="">-- Selecione --</option>
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

      {/* idade / nascimento / peso */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label>Idade (anos)</label>
          <input type="number" name="idade" min="0"
                 value={formData.idade || ''}
                 onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-4">
          <label>Data de Nascimento</label>
          <input type="date" name="data_nascimento"
                 value={formData.data_nascimento?.slice(0,10) || ''}
                 onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-4">
          <label>Peso (kg)</label>
          <input type="number" name="peso" min="0"
                 value={formData.peso || ''}
                 onChange={handleChange} className="form-control" />
        </div>
      </div>

      {/* box */}
      <div className="mb-3">
        <label>Box de Acolhimento</label>
        <select name="box" value={formData.box || ''}
                onChange={handleChange} className="form-select">
          <option value="">-- Sem box --</option>
          {boxes.map((b,i)=>(
            <option key={i} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* vacinas */}
      <h4>Vacinas</h4>
      {formData.vacinas.map((v,i)=>(
        <div key={v.id||i} className="d-flex gap-2 mb-2 align-items-center">
          <input className="form-control" placeholder="Nome"
                 value={v.nome}
                 onChange={e=>handleVacinaChange(i,'nome',e.target.value)} />
          <input type="date" className="form-control"
                 value={v.data?.slice(0,10) || ''}
                 onChange={e=>handleVacinaChange(i,'data',e.target.value)} />
          <button type="button" className="btn btn-outline-danger btn-sm"
                  onClick={()=>removeVacina(i)}>✖</button>
        </div>
      ))}
      <button type="button" className="btn btn-outline-success mb-4"
              onClick={addVacina}>+ Adicionar Vacina</button>

      {/* esterilizado / desparasitado */}
      <div className="form-check mb-2">
        <input type="checkbox" name="esterilizado"
               checked={formData.esterilizado}
               onChange={handleChange} className="form-check-input me-2" />
        <label className="form-check-label">Esterilizado</label>
      </div>
      <div className="form-check mb-2">
        <input type="checkbox" name="desparasitado"
               checked={formData.desparasitado}
               onChange={handleChange} className="form-check-input me-2" />
        <label className="form-check-label">Desparasitado</label>
      </div>

      {/* testes + data + tratamento */}
      <div className="mb-3">
        <label>Testes</label>
        <select name="testes" value={formData.testes}
                onChange={handleChange} className="form-select">
          <option value="">-- Resultado --</option>
          <option value="pos">Positivo ✅</option>
          <option value="neg">Negativo ❌</option>
        </select>
      </div>
      <div className="mb-3">
        <label>Data dos Testes</label>
        <input type="date" name="data_testes"
               value={formData.data_testes?.slice(0,10) || ''}
               onChange={handleChange} className="form-control" />
      </div>
      <div className="mb-3">
        <label>Tratamento / Medicação</label>
        <input name="tratamento" value={formData.tratamento}
               onChange={handleChange} className="form-control"
               placeholder="Descreva o tratamento ou medicação" />
      </div>
      <div className="form-check mb-3">
        <input type="checkbox" name="tratamento_iniciado"
               checked={formData.tratamento_iniciado}
               onChange={handleChange} className="form-check-input me-2" />
        <label className="form-check-label">Tratamento Iniciado</label>
      </div>

      {/* raça / cor */}
      <input name="raca" value={formData.raca}
             onChange={handleChange} placeholder="Raça"
             className="form-control mb-2" />
      <input name="cor" value={formData.cor}
             onChange={handleChange} placeholder="Cor"
             className="form-control mb-3" />

      {/* nova foto */}
      <div className="mb-3">
        <label>Nova Foto (opcional)</label>
        <input type="file" accept="image/*"
               className="form-control" onChange={handlePic} />
      </div>

      <button className="btn btn-primary me-2" type="submit">Guardar Alterações</button>
      <button className="btn btn-secondary" type="button"
              onClick={() => navigate('/')}>Cancelar</button>

      {showCrop && (
        <CropImage
          image={imgPreview} show
          onClose={()=>setShowCrop(false)}
          onCropComplete={blob=>{ setImgFinal(blob); setShowCrop(false); }}
        />
      )}
    </form>
  );
}
