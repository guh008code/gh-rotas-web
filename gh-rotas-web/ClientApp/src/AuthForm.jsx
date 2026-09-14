import { useState } from 'react';
import { api } from './api';
import { Field, Notice } from './Fields';
export default function AuthForm({ register, onLogin, onRegistered, message }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.email = values.email.trim();
    values.name = values.name?.trim();
    setError('');
    if (register && !values.name) return setError('Informe seu nome completo.');
    if (register && values.password !== values.confirmPassword) return setError('As senhas precisam ser iguais.');
    setBusy(true);
    try {
      if (register) { await api.register(values); onRegistered(); }
      else onLogin(await api.login(values));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="auth-card" aria-labelledby="form-title"><h2 id="form-title">{register ? 'Crie sua conta' : 'Acesse sua conta'}</h2><p className="card-intro">{register ? 'Preencha seus dados para começar.' : 'Entre com seus dados para continuar.'}</p><Notice success={message.startsWith('Conta criada')}>{message}</Notice><Notice>{error}</Notice><form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
    {register && <Field label="Nome completo" name="name" autoComplete="name" placeholder="Como você se chama?" required maxLength={150}/>}
    <Field label="E-mail" name="email" type="email" autoComplete="username" placeholder="seu@email.com" required maxLength={254}/>
    <Field label="Senha" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} placeholder="Digite sua senha" required/>
    {register && <Field label="Confirmar senha" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repita sua senha" required/>}
    <button className="primary" type="submit">{busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}</button>
  </fieldset></form><p className="card-bottom">{register ? 'Já tem uma conta?' : 'Não tem uma conta?'} <a href={register ? '#/login' : '#/cadastro'}>{register ? 'Entrar' : 'Cadastre-se'}</a></p></section>;
}

