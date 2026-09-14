import { useCallback, useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import Profile from './Profile';
export default function App() {
  const [route, setRoute] = useState(location.hash);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const update = () => { setRoute(location.hash); setMessage(''); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const expired = useCallback(() => { setToken(null); setMessage('Sua sessão expirou. Entre novamente.'); history.replaceState(null, '', '#/login'); setRoute('#/login'); }, []);
  const register = route === '#/cadastro';
  function registered() { history.replaceState(null, '', '#/login'); setRoute('#/login'); setMessage('Conta criada com sucesso! Entre com seu e-mail e senha.'); }
  function login(value) { setToken(value); setMessage(''); history.replaceState(null, '', '#/perfil'); setRoute('#/perfil'); }
  function logout() { setToken(null); setMessage(''); history.replaceState(null, '', '#/login'); setRoute('#/login'); }
  return <div className="shell"><header><a className="brand" href={token ? '#/perfil' : '#/login'} aria-label="GH Rotas, início">GH Rotas</a>{token && <button className="secondary" onClick={logout}>Sair</button>}</header>{token ? <Profile token={token} onExpired={expired}/> : <main className="auth-layout"><section className="welcome"><h1>{register ? <>Comece por aqui.<br/>Seu acesso, simplificado.</> : <>Seu acesso.<br/>Tudo em um só lugar.</>}</h1><p>{register ? 'Crie sua conta para acessar a plataforma e consultar seu perfil.' : 'Acesse sua conta e consulte seus dados de forma simples.'}</p><div className="welcome-link"><span>{register ? 'Já faz parte da plataforma?' : 'Ainda não tem uma conta?'}</span><a href={register ? '#/login' : '#/cadastro'}>{register ? 'Acessar minha conta' : 'Criar minha conta'}</a></div></section><AuthForm key={register ? 'register' : 'login'} register={register} onLogin={login} onRegistered={registered} message={message}/></main>}<footer>GH Rotas • Portal do usuário</footer></div>;
}
