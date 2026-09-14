# GH Rotas — portal do usuário

Interface React hospedada pelo projeto ASP.NET Core 8 existente. Sem banco de dados local: cadastro, autenticação e perfil serão atendidos pela API externa.

## Executar

Requisitos: .NET SDK 8 ou superior e Node.js 18.16+ (preferencialmente uma versão LTS atual).

Na pasta da solução:

```powershell
dotnet run --project gh-rotas-web --launch-profile https
```

Abra https://localhost:7157. O build do .NET instala as dependências na primeira execução e compila o React automaticamente. Também funciona ao iniciar pelo Visual Studio. Para desenvolvimento com atualização automática:

```powershell
cd gh-rotas-web/ClientApp
npm ci
npm run dev
```

Abra http://localhost:5173/app/. Para publicar, use `dotnet publish gh-rotas-web -c Release`; os arquivos compilados são incluídos em wwwroot/app.

## Conectar a futura API

Edite `gh-rotas-web/ClientApp/public/api-config.json` e compile novamente. Também pode editar `wwwroot/app/api-config.json` no ambiente publicado. Esse arquivo é público: não coloque segredos nele.

- `baseUrl`: URL HTTPS da API, por exemplo `https://api.seudominio.com` (vazia por padrão).
- `endpoints.register`: POST de cadastro, provisoriamente `/auth/register`.
- `endpoints.login`: POST de login, provisoriamente `/auth/login`.
- `endpoints.profile`: GET de perfil, provisoriamente `/users/me`.

O contrato abaixo é apenas a proposta inicial, não uma exigência para a futura API. Os mapeamentos estão centralizados em `ClientApp/src/api.js`, no objeto `contract`.

```text
Cadastro: { name, email, password } → qualquer resposta HTTP 2xx
Login:    { email, password } → { accessToken: "..." }
Perfil:   Authorization: Bearer <accessToken> → { id, name, email, phone }
```

O cadastro volta ao login após a confirmação da API. O perfil mostra somente os quatro campos mapeados, sem exibir campos sensíveis adicionais. Campos opcionais ausentes aparecem como “Não informado”. A política de senha ficará a cargo da API; a interface exige senha preenchida e confirmação correspondente.

A API deve permitir CORS para a origem do portal (incluindo portas de desenvolvimento) e os cabeçalhos Content-Type e Authorization. A autenticação e autorização reais devem ser verificadas pela API em todas as consultas protegidas. Os dados de perfil nunca devem ser selecionados por um identificador enviado livremente pelo navegador: use o usuário autenticado pelo token.

Token mantido somente em memória, sem localStorage ou sessionStorage. Recarregar a página encerra a sessão local. Sair limpa os dados locais; não revoga o token no servidor, pois ainda não há endpoint de revogação. Resposta 401 no perfil encerra a sessão. Não há recuperação de senha, renovação automática de token ou dados fictícios: essas funcionalidades não fazem parte do escopo inicial.

A configuração vazia gera uma mensagem ao tentar acessar/cadastrar, sem chamar uma API ou simular sucesso. Quando os endpoints e exemplos reais estiverem disponíveis, ajuste os mapeamentos e valide a integração ponta a ponta.

O projeto utiliza somente a interface React. As páginas Razor e os arquivos estáticos do template original foram removidos. O ASP.NET Core hospeda os arquivos compilados em wwwroot/app e encaminha as rotas para a aplicação React.
