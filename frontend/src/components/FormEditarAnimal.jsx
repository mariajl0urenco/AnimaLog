import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CropImage from './CropImage';
import './FormAnimal.css';

export default function FormEditarAnimal() {
  const [formData, setFormData] = useState({
    nome:'', especie:'', chip:'', entrada:'', motivo_entrada:'',
    idade:'', data_nascimento:'', peso:'', raca:'', cor:'',
    vacinas:[], testes:[], doencas:'', observacoes:'', comportamento:'',
    esterilizado:false, data_esterilizacao:'',
    desparasitado:false, produto_desparasitado:'', data_desparasitado:'',
    tratamento:'', tratamento_iniciado:false,
    titular:false, disponivel_adocao:false,
    box:'', concelho:'', local_ocorrencia:''
  });

  const [boxes, setBoxes] = useState([]);
  const [removidasVacinas, setRemovidasVacinas] = useState([]);
  const [removidasTestes, setRemovidasTestes] = useState([]);
  const [imgPreview, setImgPrev] = useState(null);
  const [imgFinal, setImgFinal] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const [aRes, vRes, tRes, bRes] = await Promise.all([
          axios.get(`https://animalog-backend.onrender.com/animais/${id}`),
          axios.get(`https://animalog-backend.onrender.com/animais/${id}/vacinas`),
          axios.get(`https://animalog-backend.onrender.com/animais/${id}/testes`),
          axios.get('https://animalog-backend.onrender.com/boxes/nome')
        ]);
        const a = aRes.data;
        setFormData({
          ...a,
          idade: a.idade || '',
          data_nascimento: a.data_nascimento || '',
          data_esterilizacao: a.data_esterilizacao || '',
          data_desparasitado: a.data_desparasitado || '',
          esterilizado: !!a.esterilizado,
          desparasitado: !!a.desparasitado,
          tratamento_iniciado: !!a.tratamento_iniciado,
          titular: !!a.titular,
          disponivel_adocao: !!a.disponivel_adocao,
          vacinas: Array.isArray(vRes.data) ? vRes.data : [],
          testes: Array.isArray(tRes.data) ? tRes.data : []
        });
        setBoxes(bRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    })();
  }, [id]);

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVacinaChange = (i, campo, val) =>
    setFormData(p => {
      const arr = [...p.vacinas];
      arr[i] = { ...arr[i], [campo]: val };
      return { ...p, vacinas: arr };
    });

  const handleTesteChange = (i, campo, val) =>
    setFormData(p => {
      const arr = [...p.testes];
      arr[i] = { ...arr[i], [campo]: val };
      return { ...p, testes: arr };
    });

  const addVacina = () =>
    setFormData(p => ({ ...p, vacinas: [...p.vacinas, { nome:'', data:'' }] }));

  const addTeste = () =>
    setFormData(p => ({ ...p, testes: [...p.testes, { nome:'', resultado:'', data:'', tratamento:'', tratamento_iniciado:false }] }));

  const removeVacina = i =>
    setFormData(p => {
      const vac = p.vacinas[i];
      if (vac.id) setRemovidasVacinas(r => [...r, vac.id]);
      return { ...p, vacinas: p.vacinas.filter((_, idx) => idx !== i) };
    });

  const removeTeste = i =>
    setFormData(p => {
      const tst = p.testes[i];
      if (tst.id) setRemovidasTestes(r => [...r, tst.id]);
      return { ...p, testes: p.testes.filter((_, idx) => idx !== i) };
    });

  const handlePic = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImgPrev(r.result); setShowCrop(true); };
    r.readAsDataURL(f);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { vacinas, testes, ...animalData } = formData;
      await axios.put(`https://animalog-backend.onrender.com/animais/${id}`, animalData);

      await Promise.all(removidasVacinas.map(vId => axios.delete(`https://animalog-backend.onrender.com/animais/vacinas/${vId}`)));
      await Promise.all(removidasTestes.map(tId => axios.delete(`https://animalog-backend.onrender.com/animais/testes/${tId}`)));

      for (const vac of vacinas)
        if (!vac.id)
          await axios.post(`https://animalog-backend.onrender.com/animais/${id}/vacinas`, vac);

      for (const tst of testes)
        if (!tst.id)
          await axios.post(`https://animalog-backend.onrender.com/animais/${id}/testes`, tst);

      if (imgFinal instanceof Blob) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_KEY
  );

  const nomeFicheiro = `animal_${id}_${Date.now()}.jpg`;

  const { error: uploadError } = await supabase
    .storage
    .from('fotos-animais')
    .upload(nomeFicheiro, imgFinal, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('fotos-animais').getPublicUrl(nomeFicheiro);

  await axios.put(`https://animalog-backend.onrender.com/animais/${id}`, {
    ...formData,
    foto: data.publicUrl
  });
} else {
  await axios.put(`https://animalog-backend.onrender.com/animais/${id}`, formData);
}

      alert('Animal atualizado com sucesso!');
      navigate('/');
    } catch (err) {
      console.error('Erro ao guardar alterações:', err);
      alert('Erro ao guardar alterações.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-animal" encType="multipart/form-data">
      <h2>Editar Animal</h2>

      {/* Dados básicos */}
<div className="section-box">
  <label className="form-label">Nome</label>
  <input name="nome" value={formData.nome} onChange={handleChange} className="form-control mb-2" required />

  <label className="form-label">Chip</label>
  <input name="chip" value={formData.chip} onChange={handleChange} className="form-control mb-2" maxLength={15} required />

  <label className="form-label">Espécie</label>
  <select name="especie" value={formData.especie} onChange={handleChange} className="form-select mb-2" required>
    <option value="">-- Espécie --</option>
    <option value="canina">Canina</option>
    <option value="felina">Felina</option>
  </select>

  <label className="form-label">Raça</label>
  <input name="raca" value={formData.raca || ''} onChange={handleChange} className="form-control mb-2" />

  <label className="form-label">Cor</label>
  <input name="cor" value={formData.cor || ''} onChange={handleChange} className="form-control mb-2" />

  <label className="form-label">Data de Entrada</label>
  <input type="date" name="entrada" value={formData.entrada?.slice(0,10) || ''} onChange={handleChange} className="form-control mb-2" required />

  <label className="form-label">Motivo de Entrada</label>
  <select name="motivo_entrada" value={formData.motivo_entrada} onChange={handleChange} className="form-select">
    <option value="">-- Motivo de Entrada --</option>
    <option>Entrega por Detentor</option>
    <option>Entrega por Não Detentor</option>
    <option>Entrega por Autoridade Policial</option>
    <option>Entrega por Entidade Rodoviária</option>
    <option>Recolha de Animal Errante</option>
    <option>Recolha de Animal a Particular</option>
    <option>Sequestro Sanitário</option>
    <option>Apreendido</option>
  </select>
</div>


      {/* Dados adicionais */}
      <h4 className="mt-4">Dados adicionais</h4>
      <div className="section-box">
        <input type="number" name="idade" value={formData.idade || ''} onChange={handleChange} className="form-control mb-2" placeholder="Idade (anos)" />
        <input type="date" name="data_nascimento" value={formData.data_nascimento?.slice(0,10) || ''} onChange={handleChange} className="form-control mb-2" />
        <input type="number" name="peso" value={formData.peso || ''} onChange={handleChange} className="form-control mb-2" placeholder="Peso (kg)" />
        <select name="box" value={formData.box || ''} onChange={handleChange} className="form-select mb-2">
          <option value="">-- Box de Acolhimento --</option>
          {boxes.map((b,i)=>(<option key={i} value={b}>{b}</option>))}
        </select>
		
		<div className="form-check mb-2">
			<input
				type="checkbox"
				name="titular"
				checked={formData.titular}
				onChange={handleChange}
				className="form-check-input"
				id="check-titular"
			/>
			<label htmlFor="check-titular" className="form-check-label">
				Titular
			</label>
      </div>
	  
	  </div>

      {/* Comportamento */}
      <h4 className="mt-4">Comportamento</h4>
      <div className="section-box">
        <select
          className="form-select mb-2"
          value={['Dócil', 'Não Dócil'].includes(formData.comportamento) ? formData.comportamento : 'Outro'}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'Outro') {
              setFormData(p => ({ ...p, comportamento: '' }));
            } else {
              setFormData(p => ({ ...p, comportamento: value }));
            }
          }}
        >
          <option value="">-- Selecionar --</option>
          <option value="Dócil">Dócil</option>
          <option value="Não Dócil">Não Dócil</option>
          <option value="Outro">Outro (especificar)</option>
        </select>
        {(!['Dócil', 'Não Dócil'].includes(formData.comportamento)) && (
          <input
            type="text"
            name="comportamento"
            value={formData.comportamento}
            onChange={handleChange}
            className="form-control mb-2"
            placeholder="Escrever outro comportamento..."
          />
        )}
      </div>
      {/* Desparasitação e Esterilização */}
      <h4 className="mt-4">Desparasitação & Esterilização</h4>
      <div className="section-box">
        <div className="form-check mb-2">
          <input type="checkbox" name="desparasitado" checked={formData.desparasitado} onChange={handleChange} className="form-check-input" />
          <label className="form-check-label">Desparasitado</label>
        </div>
        {formData.desparasitado && (
          <>
            <input name="produto_desparasitado" value={formData.produto_desparasitado || ''} onChange={handleChange} className="form-control mb-2" placeholder="Produto Desparasitação" />
            <input type="date" name="data_desparasitado" value={formData.data_desparasitado?.slice(0,10) || ''} onChange={handleChange} className="form-control mb-2" />
          </>
        )}

        <div className="form-check mb-2">
          <input type="checkbox" name="esterilizado" checked={formData.esterilizado} onChange={handleChange} className="form-check-input" />
          <label className="form-check-label">Esterilizado/Castrado</label>
        </div>
        {formData.esterilizado && (
          <input type="date" name="data_esterilizacao" value={formData.data_esterilizacao?.slice(0,10) || ''} onChange={handleChange} className="form-control mb-2" />
        )}
      </div>

      {/* Testes e Tratamento */}
      <h4 className="mt-4">Testes & Tratamento</h4>
      <div className="section-box">
        {formData.testes.map((t, i) => (
          <div key={t.id || i} className="d-flex flex-column gap-2 mb-3 p-2 border rounded">
            <input
              className="form-control"
              placeholder="Nome do Teste"
              value={t.nome}
              onChange={e => handleTesteChange(i, 'nome', e.target.value)}
            />
            <select
              className="form-select"
              value={t.resultado}
              onChange={e => handleTesteChange(i, 'resultado', e.target.value)}
            >
              <option value="">-- Resultado --</option>
              <option value="pos">Positivo</option>
              <option value="neg">Negativo</option>
            </select>
            <input
              type="date"
              className="form-control"
              value={t.data?.slice(0,10) || ''}
              onChange={e => handleTesteChange(i, 'data', e.target.value)}
            />
            <input
              className="form-control"
              placeholder="Tratamento/Medicação"
              value={t.tratamento || ''}
              onChange={e => handleTesteChange(i, 'tratamento', e.target.value)}
            />
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={t.tratamento_iniciado}
                onChange={e => handleTesteChange(i, 'tratamento_iniciado', e.target.checked)}
              />
              <label className="form-check-label">Tratamento iniciado</label>
            </div>
            <button
				type="button"
				className="btn btn-outline-danger btn-sm align-self-start"
				onClick={() => removeTeste(i)}
			>
				✖
			</button>

          </div>
        ))}
        <button
			type="button"
			className="btn btn-outline-success btn-sm mt-2"
			onClick={addTeste}
		>
			+ Adicionar Teste
		</button>
	</div>

      {/* Vacinas */}
      <h4 className="mt-4">Vacinas</h4>
      <div className="section-box">
        {formData.vacinas.map((v,i)=>(
          <div key={v.id||i} className="d-flex gap-2 mb-2">
            <input className="form-control" placeholder="Nome" value={v.nome} onChange={e=>handleVacinaChange(i,'nome',e.target.value)} />
            <input type="date" className="form-control" value={v.data?.slice(0,10) || ''} onChange={e=>handleVacinaChange(i,'data',e.target.value)} />
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeVacina(i)}>✖</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline-success mt-2" onClick={addVacina}>+ Adicionar Vacina</button>
      </div>
	  
	  {/* Disponível para Adoção */}
<h4 className="mt-4">Adoção</h4>
<div className="section-box">
  <div className="form-check mb-2">
    <input
      type="checkbox"
      name="disponivel_adocao"
      checked={formData.disponivel_adocao}
      onChange={handleChange}
      className="form-check-input"
      id="check-disponivel-adocao"
    />
    <label htmlFor="check-disponivel-adocao" className="form-check-label">
      Disponível para Adoção
    </label>
  </div>
</div>


      {/* Fotografia */}
      <h4 className="mt-4">Fotografia</h4>
      <div className="section-box">
        <input type="file" accept="image/*" className="form-control mb-2" onChange={handlePic} />
      </div>

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-primary" type="submit">Guardar Alterações</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate('/')}>Cancelar</button>
      </div>

      {showCrop && (
        <CropImage
          image={imgPreview}
          show
          onClose={() => setShowCrop(false)}
          onCropComplete={blob => {
            setImgFinal(blob);
            setShowCrop(false);
          }}
        />
      )}
    </form>
  );
}

