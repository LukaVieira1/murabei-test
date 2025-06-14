# Murabei test

## Description

Esse e o teste para Desenvolvedor FullStack na Murabei Data Science, usando Docker, Python, Nextjs and sqlite3.

O objetivo deste teste e avaliar a capcidade do desenvolvedor em criar uma aplicacao Frontend e integra-la em uma API Python. Toda a aplicacao e mantida em containers Docker, e roda usando docker compose. Esta e a mesma arquitetura usada em todos os projetos internos da Murabei.

## Instrucoes

O repositorio e dividido em 3 pastas:

- \_docker-compose
- backend
- frontend

Na pasta **_\_docker-compose_**, estao os arquivos responsaveis por subir todas as imagens Docker. Um **docker-compose.yml**, que possui as informacoes de quais containers e imagens devem subir; um script **docker-up.bash** que sobe os containers baseado no arquivo **docker-compose.yml**; e um arquivo **docker.log**, que armazena todos os logs da aplicacao.

Ja na pasta **_backend_** esta a API de livros, em Python Flask. Esta API tem uma gama de operacoes basicas, como listagem de livros, criacao, busca por autor e titulo. Esta API ja esta pre-pronta, mas pode ser alterada de acordo com a sua necessidade, sem problemas.

Esta pasta possui um script **build.bash**, que builda a imagem docker a ser utilizada no **docker-compose.yml**.

E, a pasta **_frontend_**, onde devem ser colocados codigos do FE. Aqui na Murabei, utilizamos o NextJS como framework de React, logo, seu FE deve ser desenolvido em NextJS, pelo menos, na versao 13, que ja possui **_Server Components_** e **_Server Actions_**.

## Inicializacao

Clone o repositorio do Github, e va na pasta **_backend_**, e rode o script **_build.bash_**. Esse script ira buildar uma imagem docker local para o seu backend. Depois, va na pasta **_\_docker-compose_** e rode o script **_docker-up.bash_**, que ira subir o **docker-compose.yml**, subindo todos os servicos.

## Objetivos do Teste

O objetivo deste teste e avaliar a capacidade do desenvolvedor em refatorar e ajustar uma codebase inicial. O teste possui uma base de dados em SQLite3, que possui dados de livros, autores, editores e etc. A aplicacao atual lista e retorna apenas poucos items.

O desenvolvedor devera:
- Refatorar o codigo;
- Alterar o filtro para permitir que mais de um campo possa ser buscado ao mesmo tempo (concomitante);
- Criar uma arquitetura de filtros que permite a inclusao de novo filtros ao longo do tempo e forma facil e segura;

O FE deve rodar junto com os outros servicos em docker, ou seja, deve ser adicionado um servico ao **docker-compose.yml** com o nome frontend. Para isso, o FE precisa de um **_Dockerfile_**, e de um script **_build.bash_**, como o servico da API.

**IMPORTANTE**: ao rodar o **docker-compose.yml**, o FE deve subir junto com os outros servicos.

## Avaliacao

Aqui vao os pontos que sera avaliados no teste:

**_Obrigatorios_**

**_Funcionais_**
- O FE deve possuir uma imagem docker, e rodar junto com os outros servicos no **_docker-compose.yml_** (1 ponto)
- Os filtros deverao estar funcionais, filtrando por cada campo individualmente (1 ponto)
- Os filtros poderao ser acumulados, ou seja, ao buscar por titulo E editora, o resultado sera a combinacao dos campos (2 pontos)
- As telas devem ser feitas usando componentes da biblioteca [shadcn/ui](https://ui.shadcn.com/) (1 ponto)
- Estados vazios tratados (sem resultados, filtros parciais). (1 pt)
- Performance: Filtros com debounce para evitar chamadas excessivas à API. (Bônus 1 pt)


**_Codigo_**
- O filtro e um componente independente to resto da tela (1 ponto);
- O filtro permite que outros campos possam ser adicionados posteriormente (1 ponto);
- O filtro devera implementar alguma forma de Gerenciamento de estado escalável (2 pontos);
- O filtro deve ser testado, de preferencia com uma ferramenta e2e, como o Cypress (2 pontos);

**Total: 7 pontos**

**_Pontos extras_**

- Fazer o deploy publico da aplicacao em qualquer servico que aceite as imagens docker (1 ponto)
- Adicionar testes (unitarios ou end-to-end) (1 pontos)
- Uso do Typescript (1 ponto)

**Total: 3 pontos**

### Criterios tecnicos

Alem da avaliacao das funcionalidades do FE, tambem serao levados em consideracao aspectos tecnicos como:

- Componentizacao:
  - Criacao de componentes reutilizaveis
- Organizacao
  - Clareza e legibilidade do codigo
  - Comentarios e documentacao
  - Organizacao clara das pastas e arquivos
- Principios
  - Clean Code
  - DRY
