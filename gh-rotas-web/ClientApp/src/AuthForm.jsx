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
    values.phone = values.phone?.trim();
    setError('');
    if (register && !values.name) return setError('Informe seu nome completo.');
    if (register && !/^\+?[0-9 ()-]{8,25}$/.test(values.phone)) return setError('Informe um telefone válido, com 8 a 25 caracteres.');
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
    {register && <><Field label="Telefone" name="phone" type="tel" autoComplete="tel" placeholder="(11) 99999-9999" required minLength={8} maxLength={25}/><Field label="Data de nascimento" name="birthDate" type="date" autoComplete="bday" required/></>}
    <Field label="Senha" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} placeholder={register ? 'De 12 a 128 caracteres' : 'Digite sua senha'} required minLength={register ? 12 : undefined} maxLength={128}/>
    {register && <Field label="Confirmar senha" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repita sua senha" required minLength={12} maxLength={128}/>}
    <button className="primary" type="submit">{busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}</button>
  </fieldset></form><p className="card-bottom">{register ? 'Já tem uma conta?' : 'Não tem uma conta?'} <a href={register ? '#/login' : '#/cadastro'}>{register ? 'Entrar' : 'Cadastre-se'}</a></p></section>;
}
