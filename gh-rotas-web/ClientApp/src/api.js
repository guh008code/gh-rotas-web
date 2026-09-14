// Contrato confirmado no Swagger da GH Rotas API.
export const contract = {
  register: ({ name, email, phone, password, birthDate }) => ({ name, email, phone, password, birthDate }),
  login: ({ email, password }) => ({ email, password }),
  token: (data) => data?.accessToken,
  profile: (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('A API retornou um perfil inválido.');
    return Object.fromEntries(['id', 'name', 'email', 'phone'].map(key => [key, typeof data[key] === 'string' || typeof data[key] === 'number' ? String(data[key]) : '']));
  }
};
let configuration;
export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
async function config() {
  if (configuration) return configuration;
  const response = await fetch(`${import.meta.env.BASE_URL}api-config.json`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Não foi possível carregar a configuração de acesso.');
  const value = await response.json();
  if (!value.baseUrl) throw new Error('O acesso ainda não está disponível. Aguarde a configuração da plataforma.');
  configuration = value;
  return value;
}
async function request(operation, { body, token, signal } = {}) {
  try {
    const settings = await config();
    const url = new URL(settings.baseUrl.replace(/\/$/, '') + '/' + settings.endpoints[operation].replace(/^\//, ''), window.location.origin);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('O endereço da plataforma deve utilizar HTTPS.');
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, 15000);
    try {
      const response = await fetch(url, {
        method: body ? 'POST' : 'GET', signal: controller.signal, cache: 'no-store', credentials: 'omit',
        headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      if (!response.ok) {
        const message = response.status === 401 ? (operation === 'login' ? 'E-mail ou senha inválidos.' : 'Sua sessão expirou. Entre novamente.')
          : response.status === 403 ? 'Você não tem permissão para acessar estes dados.'
          : response.status === 502 ? 'Não foi possível conectar à API. Verifique se ela está em execução.'
          : response.status === 504 ? 'A API demorou demais para responder. Tente novamente.'
          : response.status === 409 ? 'Já existe uma conta com este e-mail.'
          : response.status === 429 ? 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
          : response.status === 400 || response.status === 422 ? 'Confira os dados informados e tente novamente.'
          : 'Não foi possível concluir a solicitação. Tente novamente.';
        throw new ApiError(message, response.status);
      }
      if (operation === 'register') return;
      return await response.json();
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') throw new Error('A solicitação demorou demais. Tente novamente.');
    if (error instanceof TypeError) throw new Error('Não foi possível conectar à plataforma. Verifique sua conexão e tente novamente.');
    if (error instanceof SyntaxError) throw new Error('A plataforma retornou uma resposta inválida.');
    throw error;
  }
}
export const api = {
  register: (fields) => request('register', { body: contract.register(fields) }),
  login: async (fields) => {
    const token = contract.token(await request('login', { body: contract.login(fields) }));
    if (typeof token !== 'string' || !token.trim()) throw new Error('A plataforma não retornou uma autenticação válida.');
    return token;
  },
  profile: async (token, signal) => contract.profile(await request('profile', { token, signal }))
};
