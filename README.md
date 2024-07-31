# API de Gerenciamento de Investimentos

Este projeto é uma API robusta para gerenciar investimentos, implementada com NestJS e Docker. A API lida com uma grande quantidade de dados e é projetada para garantir escalabilidade e desempenho.

## Requisitos Funcionais

1. **Criação de Investimento**:
   - Endpoint para criar um investimento, incluindo proprietário, data de criação e valor inicial.
   - Garantia de que nenhum investimento seja negativo.

2. **Visualização de Investimento**:
   - Endpoints para visualizar detalhes de um investimento, incluindo valor inicial, saldo esperado (considerando ganhos compostos) e histórico de retiradas.

3. **Retirada de Investimento**:
   - Endpoint para realizar retiradas de um investimento, calculando ganhos acumulados e aplicando impostos conforme a idade do investimento.

4. **Lista de Investimentos**:
   - Endpoints para listar investimentos de um usuário com suporte a paginação e filtragem por status.

## Detalhes Técnicos

- **Ganhos de Investimento**:
  - Rendimentos de 0,52% ao mês com cálculos precisos para ganhos compostos.

- **Tributação**:
  - Impostos sobre retiradas com base na idade do investimento:
    - Menos de um ano: 22,5%.
    - Entre um e dois anos: 18,5%.
    - Mais de dois anos: 15%.

- **Arquitetura e Padrões**:
  - Implementação seguindo o padrão MVC (Model-View-Controller) com princípios SOLID e boas práticas de design de software.

- **Cache e Performance**:
  - Estratégias de cache integradas para otimizar consultas frequentes e melhorar a performance da API.

- **Segurança e Autenticação**:
  - Autenticação baseada em JWT (JSON Web Tokens) com middleware para verificar a validade dos tokens.
  - Comunicação via HTTPS.
  - Proteção contra SQL Injection e XSS (Cross-Site Scripting).
  - Rate limiting para prevenção de ataques de força bruta.

- **Documentação e Testes**:
  - Documentação da API disponível em [Swagger/OpenAPI](https://localhost:3000/convertax/api/v1/docs).
  - Testes unitários abrangentes para validação da funcionalidade da API.



### Configuração do Ambiente
1. **Clone o repositório**:
   ```[bash](https://github.com/diegoandcontroll/desafio-backendconvertax.git)
  git clone <[URL_DO_REPOSITORIO](https://github.com/diegoandcontroll/desafio-backendconvertax.git)>
  create .env copy .env.example
  mkdir secrets
  cd secrets
  mkcert create-cert
  mkcert create-ca

## Configuração e Execução com Docker
  docker compose up -d
### Instalando Dependências
  npm i 

### Configuração do prisma 
  npx prisma migrate dev --name init
  npx prisma generate

### Executando Projeto
  npm run start:dev
