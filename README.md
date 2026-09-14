# GH Rotas — portal do usuário

Interface React hospedada pelo ASP.NET Core 8. Cadastro, autenticação e perfil são atendidos pela GH Rotas API, sem banco de dados neste projeto.

## Executar pelo Visual Studio

1. Inicie o projeto da API em `https://localhost:7229`.
2. Abra `gh-rotas-web.sln`, defina `gh-rotas-web` como projeto de inicialização e selecione o perfil `https`.
3. Pressione F5. O portal abre em `https://localhost:7157`.

Requisitos: .NET SDK 8 ou superior e Node.js 18.16+ (preferencialmente uma versão LTS atual). O build do .NET instala as dependências na primeira execução e compila o React automaticamente. Os certificados HTTPS de desenvolvimento devem ser confiáveis; se necessário, execute `dotnet dev-certs https --trust`.

Pelo terminal, na pasta da solução:

```powershell
dotnet run --project gh-rotas-web --launch-profile https
```

Para desenvolvimento React com atualização automática, mantenha também o portal .NET em execução com o perfil `https` (esse perfil inclui a porta HTTP 5262), e execute em outro terminal:

```powershell
cd gh-rotas-web/ClientApp
npm ci
npm run dev
```

Abra `http://localhost:5173/app/`. O Vite encaminha `/api/auth` para o portal .NET na porta 5262.

## Integração com a API

O navegador chama o próprio portal, que encaminha somente as três rotas autorizadas para a API externa. Assim não é necessário habilitar CORS na API para esta integração. O token Bearer é encaminhado na consulta do perfil; o portal não cria usuários nem valida senhas por conta própria.

A URL da API está configurada em `gh-rotas-web/appsettings.json`, na propriedade `AuthApi:BaseUrl`, atualmente `https://localhost:7229`. Pode ser substituída pela variável de ambiente `AuthApi__BaseUrl`. Em produção, configure o endereço real da API; localhost aponta para a máquina que executa o portal.

O arquivo público `ClientApp/public/api-config.json` usa `baseUrl: "/"` para acessar as rotas no mesmo domínio do portal. Não inclua segredos nesse arquivo. Os mapeamentos de payload estão em `ClientApp/src/api.js`.

| Operação | Método e rota | Contrato |
| --- | --- | --- |
| Cadastro | POST `/api/auth/cadastro` | `{ name, email, phone, password, birthDate }` |
| Login | POST `/api/auth/login` | `{ email, password }` → `{ accessToken, tokenType, expiresIn, user }` |
| Perfil | GET `/api/auth/perfil` | Bearer token → `{ id, name, email, phone }` |

Todos os campos de cadastro são obrigatórios. A data é enviada em `YYYY-MM-DD`, sem conversão de fuso horário. A senha deve ter de 12 a 128 caracteres, conforme o Swagger. O telefone aceita de 8 a 25 caracteres entre números, espaços, parênteses, hífen e sinal de mais no início. A confirmação da senha não é enviada à API. A validação definitiva continua sendo responsabilidade da API.

Após cadastrar, a tela volta ao login. Após autenticar, o portal consulta o perfil com o token recebido. O token fica apenas em memória: recarregar a página exige novo login. Sair limpa a sessão local, sem revogação no servidor. Uma resposta 401 no perfil encerra a sessão. Não há renovação automática de token nem recuperação de senha.

Se a API estiver desligada ou seu certificado não for confiável, o portal apresenta erro de conexão. O encaminhamento preserva os códigos HTTP da API; falha de conexão retorna 502 e timeout retorna 504. Não há desativação da validação de certificados TLS.

## Publicar

```powershell
dotnet publish gh-rotas-web -c Release
```

Os arquivos React são incluídos em `wwwroot/app`. Configure a URL da API no ambiente de destino e use HTTPS. O projeto contém apenas a interface React e o host ASP.NET Core; as páginas Razor e os arquivos do template original foram removidos.
