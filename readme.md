# 📚 Murabei Books - Sistema de Gerenciamento de Livros

## 🌐 **DEMO LIVE**

**🚀 Acesse a aplicação em produção:**

**[https://murabeibooks.lukavieira.tech/](https://murabeibooks.lukavieira.tech/)**

A aplicação está hospedada em produção e totalmente funcional. Você pode:

- ✅ Navegar pelos livros da biblioteca
- ✅ Usar os filtros avançados (título, autor, editora, sinopse, páginas, formato)
- ✅ Criar, editar e excluir livros
- ✅ Testar a responsividade em diferentes dispositivos
- ✅ Compartilhar filtros específicos via URL

_A aplicação foi desenvolvida entre sexta-feira à noite e domingo. Ao longo desse documento, você encontrará uma breve descrição do projeto e das decisões técnicas que foram tomadas e as melhorias que podem ser implementadas (visto que foi feito em 3 dias)._

---

## 🚀 Projeto de Gerenciamento de Livros

Este é um sistema completo de gerenciamento de livros desenvolvido com **Next.js 14** (frontend) e **Python Flask** (backend), executando em containers Docker.
O projeto foi desenvolvido como parte de um teste técnico para a **Murabei Data Science**.

## 📋 Funcionalidades

- Listagem paginada de livros
- Criação de novos livros
- Edição de livros existentes
- Exclusão de livros

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas **3000** (frontend) e **5000** (backend) disponíveis

### 🔧 Instalação e Execução

#### 1. Build do Backend

```bash
cd backend
./build.bash
```

#### 2. Build do Frontend

```bash
cd .. (para voltar para a raiz do projeto)
cd frontend/
./build.bash
```

#### 3. Subir os Serviços

```bash
cd .. (para voltar para a raiz do projeto)
cd _docker-compose
./docker-up.bash
```

#### 4. Acessar a Aplicação

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **API Docs**: [http://localhost:5000/docs](http://localhost:5000/docs)

---

#### 5. Executar os Testes E2E (Cypress)

Verifique se seu frontend realmente está rodando na porta 3000.

Pare o container caso esteja rodando e va para a raiz do projeto

```bash
cd _docker-compose
./docker-e2e-env-up.bash
cd .. (para voltar para a raiz do projeto)
cd frontend/
cd codes/

npm run cypress:open # testes com a ferramenta visual do cypress
## ou
npm run cypress:run # testes no terminal
```

Para voltar para o ambiente de desenvolvimento, pare o container e execute o bash ./docker-up.bash

## 🏗️ Decisões Técnicas

### 🐳 **Containerização e Orquestração**

**Docker Multi-Service**: A aplicação foi containerizada com Docker e orquestrada via Docker Compose, permitindo que frontend e backend rodem juntos de forma isolada e reproduzível. O frontend possui sua própria imagem Docker otimizada com multi-stage builds para produção.

### 🔍 **Sistema de Filtros Avançados**

#### **Filtros Individuais e Acumulativos**

Implementamos um sistema robusto que permite:

- **Filtros individuais**: Cada campo (título, autor, editora, sinopse, páginas, formato) funciona independentemente
- **Filtros acumulativos**: Múltiplos filtros podem ser combinados simultaneamente (ex: título + editora + faixa de páginas)
- **Persistência via URL**: Os filtros são sincronizados com a URL, permitindo compartilhamento e navegação com estado preservado

#### **Arquitetura Modular e Extensível**

```typescript
// Estrutura que permite fácil adição de novos filtros
interface BookFilters {
  title?: string;
  author?: string;
  publisher?: string;
  // Novos filtros podem ser adicionados aqui facilmente
}
```

O componente `FiltersSidebar` é completamente independente e pode ser reutilizado em outras telas. A arquitetura permite adicionar novos campos de filtro sem modificar a lógica central.

### ⚡ **Performance e Otimização**

#### **Debounce para Busca**

Implementamos debounce de 500ms na busca por texto para evitar chamadas excessivas à API

#### **Server-Side Rendering (SSR)**

- Filtros aplicados no servidor para SEO e performance inicial
- Hidratação suave no cliente para interatividade
- Cache otimizado do Next.js para respostas rápidas

### 🎨 **Interface de Usuário**

#### **shadcn/ui + Tailwind CSS**

Utilizamos exclusivamente componentes da biblioteca shadcn/ui para garantir:

- **Consistência visual**: Design system unificado
- **Acessibilidade**: Componentes com ARIA labels e navegação por teclado
- **Responsividade**: Mobile-first design
- **Customização**: Temas e variantes facilmente modificáveis

#### **Estados Vazios e Loading**

Tratamento completo de estados da aplicação:

- **Loading states**: Skeletons durante carregamento
- **Estados vazios**: Mensagens informativas quando não há resultados
- **Estados de erro**: Feedback claro para problemas de conectividade
- **Filtros parciais**: Indicadores visuais de filtros ativos

### 🏛️ **Gerenciamento de Estado Escalável**

#### **URL-Based State Management - A Solução Mais Escalável**

Implementamos gerenciamento de estado baseado em URL, que é **a melhor opção para filtros** no Next.js 13/14, superando bibliotecas como Redux ou Zustand:

**Por que URL + useSearchParams é a abordagem mais escalável:**

- ✅ **Compartilhamento de Estado**: URLs podem ser compartilhadas, bookmarkadas e enviadas
- ✅ **SSR Nativo**: Funciona perfeitamente com Server Components sem hidratação complexa
- ✅ **Navegação Intuitiva**: Back/forward do navegador preserva estado automaticamente
- ✅ **SEO Otimizado**: URLs semânticas indexáveis por motores de busca
- ✅ **Cache Inteligente**: Compatível com sistema de cache do Next.js
- ✅ **Sincronização Automática**: Estado sempre sincronizado entre server e client

**Implementação Real:**

```typescript
// Server Component - recebe filtros via searchParams
export default function HomePage({ searchParams }: PageProps) {
  const filters = parseSearchParams(searchParams);
  const booksData = await fetchBooks(filters); // SSR otimizado
  // ...
}

// Client Component - sincroniza com URL
const searchParams = useSearchParams();
const router = useRouter();

const updateFilters = (newFilters: BookFilters) => {
  const params = new URLSearchParams();
  Object.entries(newFilters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  router.push(`/?${params.toString()}`);
};
```

#### **Fetch Nativo Otimizado para SSR**

Utilizamos o **fetch nativo do Next.js** em vez de bibliotecas como Axios, pois é otimizado para SSR:

```typescript
// request.ts - Fetch otimizado com cache
const requestOptions: RequestInit = {
  headers: { "Content-Type": "application/json" },
  ...options,
};

// Cache automático no servidor para performance
if (isServer && (!options.method || options.method === "GET")) {
  requestOptions.next = {
    revalidate: API_CONFIG.CACHE_DURATION, // Cache inteligente
    tags: ["api-data"], // Invalidação seletiva
  };
}

const response = await fetch(url, requestOptions);
```

**Vantagens do Fetch Nativo:**

- ⚡ **Performance**: Cache automático e revalidação inteligente
- 🔄 **Streaming**: Suporte nativo a Server Components
- 📦 **Bundle Size**: Sem dependências externas
- 🛠️ **Integração**: Funciona perfeitamente com App Router

### 🧪 **Estratégia de Testes E2E**

#### **Cypress com Sistema de Mocks Inteligente**

Desenvolvi uma solução para contornar limitações do Cypress com SSR:

**🚨 Problema Identificado**:
Os interceptors do Cypress não funcionam com Next.js SSR, pois as requisições acontecem no servidor durante o Server-Side Rendering, antes da hidratação no cliente.

**💡 Solução Implementada**:

**1. Sistema de Detecção de Ambiente:**

```typescript
// request.ts - Detecção inteligente de ambiente de teste
const isCypress = process.env.NEXT_PUBLIC_IS_CYPRESS_TEST === "true";

if (isCypress) {
  console.log("🧪 Test mode detected - using mock data");
  // Retorna dados mockados com filtros funcionais
  return filteredMockResponse;
}
```

**2. Docker Compose Específico para E2E:**

```yaml
# docker-compose-e2e.yml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_IS_CYPRESS_TEST=true # Ativa modo de teste
```

**3. Script de Inicialização para Testes:**

```bash
# docker-e2e-env-up.bash
docker compose -f docker-compose-e2e.yml up --force-recreate
```

**4. Mocks com Filtros Funcionais:**

```typescript
// Sistema de mocks que simula filtros reais
let filteredBooks = [...MOCK_BOOKS_RESPONSE.books];

// Aplica filtros nos dados mockados
if (title) {
  filteredBooks = filteredBooks.filter((book) =>
    book.title.toLowerCase().includes(title.toLowerCase())
  );
}
// ... outros filtros (author, publisher, format, pages)
```

**🎯 Cobertura Completa de Testes**:

- ✅ **00-mock-verification**: Garante dados mockados (6 livros)
- ✅ **01-home-page**: Testa carregamento e responsividade
- ✅ **02-search-and-filters**: Valida filtros individuais e combinados
- ✅ **03-book-management**: Testa CRUD completo
- ✅ **04-pagination-and-navigation**: Valida navegação entre páginas

**🔧 Vantagens da Solução:**

- 🎯 **Dados Mockados**: Sempre os mesmos 6 livros para testes consistentes
- ⚡ **Performance**: Sem dependência de backend real durante testes
- 🔄 **Filtros Funcionais**: Mocks simulam comportamento real da API
- 🐳 **Isolamento**: Ambiente de teste completamente isolado via Docker

### 🏗️ **Arquitetura Frontend**

#### **Next.js 14 App Router**

- **Server Components**: Para performance e SEO
- **Client Components**: Para interatividade
- **Server Actions**: Para operações de dados
- **Streaming**: Para carregamento progressivo

#### **Organização de Código**

```
src/
├── app/          # App Router (páginas e layouts)
├── components/   # Componentes reutilizáveis
│   └── ui/      # shadcn/ui components
├── lib/         # Utilitários e APIs
│   ├── api/     # Chamadas para backend
│   ├── types/   # Definições TypeScript
│   └── utils/   # Helpers e mocks
└── hooks/       # Custom React Hooks
```

### 🔧 **Backend (Python Flask)**

#### **Arquitetura Limpa**

- **Separação de responsabilidades**: Models, Services, Routes, Filters
- **Sistema de filtros modular**: Facilita adição de novos filtros
- **Middleware customizado**: Logging e tratamento de erros
- **Container de dependências**: Injeção de dependências

#### **API RESTful**

- **Endpoints semânticos**: `/api/books`, `/api/authors`
- **Filtros via query params**: Suporte a múltiplos filtros
- **Paginação**: Controle de performance

### 🚀 **DevOps**

#### **Docker Compose**

- **Orquestração**: Frontend + Backend + Banco
- **Logs centralizados**: Debugging facilitado
- **Rede isolada**: Comunicação segura entre serviços

---

## 📋 Funcionalidades

### 🔍 Sistema de Filtros Avançados

- Busca por título, autor, editora, sinopse
- Filtros por número de páginas (min/max)
- Filtros por formato do livro
- Ordenação customizável
- **Filtros acumulativos** - combine múltiplos critérios
- **Debounce** para otimização de performance
- **Sincronização com URL** - compartilhe filtros via link

### 📚 Gerenciamento de Livros

- Listagem paginada de livros
- Criação de novos livros
- Edição de livros existentes
- Exclusão de livros
- Estados vazios tratados

### 🎨 Interface de Usuário

- Design responsivo (mobile-first)
- Componentes reutilizáveis (shadcn/ui)
- Animações suaves (Framer Motion)
- Loading states e error handling

### 🧪 Testes

- **Cypress E2E**: Cobertura completa dos fluxos

---

## 📖 Documentação Detalhada

### 🎯 Frontend

- [📘 Documentação do Frontend](./frontend/codes/README.md)

### ⚙️ Backend

- [📗 Documentação da API](./backend/README.md)

## 📁 Estrutura do Projeto

```
murabei-books/
├── 📁 _docker-compose/          # Configurações Docker
│   ├── docker-compose.yml      # Orquestração dos serviços
│   ├── docker-compose-e2e.yml # Orquestração dos serviços para testes E2E
│   ├── docker-up.bash         # Script de inicialização
│   ├── docker-e2e-env-up.bash # Script de inicialização para testes E2E
│   └── docker.log             # Logs centralizados
│
├── 📁 backend/                 # API Python Flask
│   ├── 📁 core/               # Configurações centrais
│   │   ├── __init__.py       # Inicialização do módulo
│   │   └── container.py      # Container de dependências
│   ├── 📁 models/             # Modelos de dados (SQLAlchemy)
│   │   ├── __init__.py       # Inicialização do módulo
│   │   ├── book.py          # Modelo de livros
│   │   └── author.py        # Modelo de autores
│   ├── 📁 routes/             # Endpoints da API
│   │   ├── __init__.py       # Inicialização do módulo
│   │   ├── books.py         # Rotas de livros
│   │   ├── authors.py       # Rotas de autores
│   │   └── health.py        # Health check
│   ├── 📁 services/           # Lógica de negócio
│   │   ├── __init__.py       # Inicialização do módulo
│   │   ├── book_service.py  # Serviços de livros
│   │   └── database_service.py # Serviços de banco
│   ├── 📁 filters/            # Sistema de filtros
│   │   ├── __init__.py       # Inicialização do módulo
│   │   ├── base_filter.py   # Filtro base
│   │   └── book_filters.py  # Filtros de livros
│   ├── 📁 middleware/         # Middlewares da aplicação
│   │   ├── __init__.py       # Inicialização do módulo
│   │   └── logging_middleware.py # Middleware de logs
│   ├── app.py                # Aplicação principal Flask
│   ├── config.py             # Configurações da aplicação
│   ├── db.sqlite             # Banco de dados SQLite
│   ├── books.json            # Dados de exemplo
│   ├── requirements.txt      # Dependências Python
│   ├── Dockerfile            # Container do backend
│   ├── build.bash           # Script de build
│   └── README_REFACTORING.md # Documentação de refatoração
│
├── 📁 frontend/               # Aplicação Next.js
│   └── codes/                # Código fonte do frontend
│       ├── 📁 src/           # Código fonte principal
│       │   ├── 📁 app/       # App Router (Next.js 14)
│       │   │   ├── page.tsx  # Página principal
│       │   │   ├── layout.tsx # Layout da aplicação
│       │   │   ├── globals.css # Estilos globais
│       │   │   ├── favicon.ico # Ícone da aplicação
│       │   │   └── fonts/    # Fontes customizadas
│       │   ├── 📁 components/ # Componentes React
│       │   │   ├── 📁 ui/    # Componentes shadcn/ui
│       │   │   │   ├── button.tsx # Botões
│       │   │   │   ├── input.tsx  # Inputs
│       │   │   │   ├── dialog.tsx # Modais
│       │   │   │   ├── card.tsx   # Cards
│       │   │   │   └── ... # Outros componentes UI
│       │   │   ├── BooksGrid.tsx # Grid de livros
│       │   │   ├── BooksList.tsx # Lista de livros
│       │   │   ├── FiltersSidebar.tsx # Sidebar de filtros
│       │   │   ├── SearchBar.tsx # Barra de busca
│       │   │   ├── Pagination.tsx # Paginação
│       │   │   ├── CreateBookModal.tsx # Modal de criação
│       │   │   ├── EditBookModal.tsx # Modal de edição
│       │   │   ├── BookActionsDropdown.tsx # Ações dos livros
│       │   │   └── HomePageClient.tsx # Cliente da home
│       │   ├── 📁 lib/        # Bibliotecas e utilitários
│       │   │   ├── 📁 api/    # Chamadas para API
│       │   │   │   ├── books.ts # API de livros
│       │   │   │   ├── authors.ts # API de autores
│       │   │   │   ├── filters.ts # API de filtros
│       │   │   │   └── index.ts # Exportações
│       │   │   ├── 📁 types/  # Definições TypeScript
│       │   │   │   └── index.ts # Tipos principais
│       │   │   ├── 📁 utils/  # Utilitários
│       │   │   │   └── request.ts # Cliente HTTP + Mocks
│       │   │   ├── 📁 actions/ # Server Actions
│       │   │   └── 📁 config/ # Configurações
│       │   ├── 📁 hooks/      # Custom React Hooks
│       │   └── 📁 utils/      # Utilitários gerais
│       ├── 📁 cypress/        # Testes E2E
│       │   ├── 📁 e2e/        # Testes end-to-end
│       │   │   ├── 00-mock-verification.cy.ts # Verificação de mocks
│       │   │   ├── 01-home-page.cy.ts # Testes da home
│       │   │   ├── 02-search-and-filters.cy.ts # Testes de filtros
│       │   │   ├── 03-book-management.cy.ts # Testes CRUD
│       │   │   └── 04-pagination-and-navigation.cy.ts # Testes de navegação
│       │   ├── 📁 support/    # Configurações do Cypress
│       │   ├── 📁 component/  # Testes de componentes
│       │   ├── 📁 screenshots/ # Screenshots dos testes
│       │   └── 📁 videos/     # Vídeos dos testes
│       ├── cypress.config.ts  # Configuração do Cypress
│       ├── next.config.mjs    # Configuração do Next.js
│       ├── tailwind.config.ts # Configuração do Tailwind
│       ├── tsconfig.json      # Configuração TypeScript
│       ├── package.json       # Dependências e scripts
│       ├── components.json    # Configuração shadcn/ui
│       ├── postcss.config.mjs # Configuração PostCSS
│       ├── .eslintrc.json     # Configuração ESLint
│       ├── Dockerfile         # Container do frontend
│       ├── build.bash         # Script de build
│       └── README.md          # Documentação do frontend
│
└── README.md                 # Esta documentação
```

---

## 🚀 **POSSÍVEIS MELHORIAS E PRÓXIMOS PASSOS**

### ⏰ **Contexto do Desenvolvimento**

Este projeto foi desenvolvido em **apenas 3 dias** (sexta-feira à noite, sábado e domingo). Dado o tempo limitado, priorizei a implementação das funcionalidades core e uma arquitetura sólida que permitisse futuras expansões.

---

### 🎨 **Melhorias Visuais e UX**

#### **Dashboard e Analytics**

- 📊 **Métricas visuais**: Gráficos de distribuição por gênero, autores mais populares, anos de publicação
- 📈 **Dashboard administrativo**: Estatísticas de uso, livros mais visualizados, filtros mais utilizados
- 🎯 **Recomendações**: Sistema de recomendação baseado em preferências do usuário

#### **Interface Avançada**

- 🔍 **Busca com autocomplete**: Sugestões em tempo real de títulos, autores e editoras
- 🏷️ **Sistema de tags**: Tags visuais para categorização (ficção, técnico, romance, etc.)
- ⭐ **Sistema de avaliações**: Ratings e reviews dos livros
- 🖼️ **Capas de livros**: Upload e exibição de capas dos livros
- 🌙 **Tema escuro/claro**: Toggle para alternar entre temas
- 📱 **PWA (Progressive Web App)**: Instalação como app mobile

#### **Componentes Avançados**

- 📋 **Visualização em lista/tabela**: Alternativa ao grid atual
- 🔄 **Drag & Drop**: Reorganização de livros por prioridade
- 📊 **Filtros visuais**: Sliders para páginas, checkboxes para categorias
- 🎨 **Animações**: Transições mais sofisticadas com Framer Motion

---

### 🔧 **Melhorias de Backend e API**

#### **APIs Não Utilizadas**

Atualmente o frontend utiliza **apenas a API de livros** (`/api/v1/books`). As seguintes APIs estão implementadas no backend mas **não são utilizadas**:

```python
#  APIs NÃO UTILIZADAS:
/api/v1/authors        # Lista de autores
/api/v1/subjects       # Lista de assuntos/categorias
/api/v1/publishers     # Lista de editoras
/api/v1/filter-options # Opções dinâmicas para filtros
```

#### **Implementações Futuras**

**1. Aproveitamento das APIs Existentes:**

```typescript
// Implementar autocomplete usando APIs existentes
const [authors, setAuthors] = useState<Author[]>([]);
const [publishers, setPublishers] = useState<Publisher[]>([]);

useEffect(() => {
  // Carregar dados para autocomplete
  authorsApi.getAuthors().then(setAuthors);
  filtersApi.getPublishers().then(setPublishers);
}, []);
```

**2. Novas Funcionalidades de API:**

- 🔐 **Autenticação JWT**: Sistema de login/logout com diferentes níveis de acesso
- 📤 **Import/Export**: Upload de CSV/JSON para importação em massa
- 🔄 **Sincronização**: APIs para sincronizar com bibliotecas externas (Google Books, Amazon)
- 📊 **Analytics API**: Endpoints para métricas e relatórios
- 🖼️ **Upload de arquivos**: API para upload de capas de livros
- 🔍 **Busca full-text**: Implementação com Elasticsearch ou similar

**3. Melhorias de Performance:**

- ⚡ **Cache Redis**: Cache de consultas frequentes
- 📄 **Paginação cursor-based**: Para datasets muito grandes
- 🗜️ **Compressão**: Gzip nas respostas da API
- 🔄 **Rate limiting**: Proteção contra abuso da API

---

### 🏗️ **Melhorias de Arquitetura**

#### **Frontend**

- 🧪 **Storybook**: Documentação visual dos componentes
- 📱 **Capacitor**: Transformar em app nativo iOS/Android
- 🚀 **Edge Functions**: Usar Vercel Edge para performance global

#### **Backend**

- 🗄️ **PostgreSQL**: Migração do SQLite para banco mais robusto
- 🔒 **Segurança**: Implementar CORS, rate limiting, validação de dados
- 📈 **Observabilidade**: Logs estruturados, métricas, tracing
- 🐳 **Kubernetes**: Orquestração para produção escalável
- 🔄 **CI/CD**: Pipeline automatizado com GitHub Actions

---

### 📋 **Funcionalidades Avançadas**

#### **Sistema de Usuários**

- 👤 **Perfis de usuário**: Admin, bibliotecário, leitor
- 📚 **Listas pessoais**: "Quero ler", "Lidos", "Favoritos"
- 👥 **Social**: Compartilhamento de listas entre usuários

#### **Integração Externa**

- 📖 **Google Books API**: Busca automática de informações de livros
- 📧 **Notificações**: Email/push para novos livros ou atualizações
- 📊 **Relatórios**: Geração de PDFs com estatísticas da biblioteca

---

### 🎯 **Priorização das Melhorias**

**🚀 Prioridade ALTA (curto prazo):**

1. Implementar uso das APIs existentes (autores, editoras, subjects)
2. Sistema de capas de livros
3. Busca com autocomplete
4. Tema escuro/claro

**⚡ Prioridade MÉDIA (médio prazo):**

1. Dashboard com analytics
2. Sistema de avaliações
3. PWA e instalação mobile
4. Migração para PostgreSQL

**🔮 Prioridade BAIXA (longo prazo):**

1. Sistema de usuários completo
2. Integração com APIs externas
3. Deploy em Kubernetes
4. App nativo iOS/Android

---

### 💡 **Considerações Finais**

Apesar do tempo limitado, consegui entregar uma aplicação **totalmente funcional** com:

- ✅ **Arquitetura escalável** (frontend e backend)
- ✅ **Filtros avançados** funcionando perfeitamente
- ✅ **CRUD completo** para livros
- ✅ **Testes E2E** com cobertura abrangente
- ✅ **Design responsivo** e acessível
- ✅ **Deploy em produção** funcionando

As melhorias listadas acima demonstram a **visão técnica** para evolução do sistema e podem ser implementadas gradualmente conforme a necessidade do negócio.
