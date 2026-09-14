import { useEffect, useState } from 'react';
import { api } from './api';
import { Notice } from './Fields';
export default function Profile({ token, onExpired }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(''); setProfile(null);
    api.profile(token, controller.signal).then(value => { if (!controller.signal.aborted) setProfile(value); }).catch(err => {
      if (controller.signal.aborted) return;
      if (err.status === 401) onExpired(); else setError(err.message);
    });
    return () => controller.abort();
  }, [token, attempt, onExpired]);
  return <main className="profile"><h1>Meu perfil</h1><p className="subtitle">Suas informações de cadastro, em um só lugar.</p><Notice>{error}</Notice>{error ? <button className="secondary" onClick={() => setAttempt(attempt + 1)}>Tentar novamente</button> : !profile ? <p role="status">Carregando seu perfil…</p> : <><div className="identity"><div className="avatar" aria-hidden="true">{profile.name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'}</div><div><h2>{profile.name || 'Usuário'}</h2><p>{profile.email || 'E-mail não informado'}</p></div></div><section aria-labelledby="details-title"><h2 className="details-title" id="details-title">Dados pessoais</h2><dl>{[['Nome completo', profile.name], ['E-mail', profile.email], ['Telefone', profile.phone], ['Identificação', profile.id]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Não informado'}</dd></div>)}</dl></section></>}</main>;
}
