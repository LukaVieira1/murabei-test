# 🎨 Frontend - Murabei Books

Sistema de gerenciamento de livros desenvolvido com **Next.js 14**, **TypeScript** e **shadcn/ui**.

## 🚀 Tecnologias Utilizadas

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Animações**: Framer Motion
- **Testes**: Cypress E2E
- **Containerização**: Docker

## 📁 Estrutura do Projeto

```
src/
├── 📁 app/                    # App Router (Next.js 14)
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout da aplicação
│   ├── globals.css           # Estilos globais
│   └── favicon.ico           # Ícone da aplicação
│
├── 📁 components/            # Componentes React
│   ├── 📁 ui/               # Componentes shadcn/ui
│   │   ├── button.tsx       # Botões
│   │   ├── input.tsx        # Inputs
│   │   ├── dialog.tsx       # Modais
│   │   ├── card.tsx         # Cards
│   │   └── ...              # Outros componentes UI
│   ├── BooksGrid.tsx        # Grid de livros
│   ├── BooksList.tsx        # Lista de livros
│   ├── FiltersSidebar.tsx   # Sidebar de filtros
│   ├── SearchBar.tsx        # Barra de busca com debounce
│   ├── Pagination.tsx       # Paginação
│   ├── CreateBookModal.tsx  # Modal de criação
│   ├── EditBookModal.tsx    # Modal de edição
│   └── HomePageClient.tsx   # Cliente da home
│
├── 📁 lib/                  # Bibliotecas e utilitários
│   ├── 📁 api/             # Chamadas para API
│   │   ├── books.ts        # API de livros
│   │   ├── authors.ts      # API de autores
│   │   └── index.ts        # Exportações
│   ├── 📁 types/           # Definições TypeScript
│   │   └── index.ts        # Tipos principais
│   ├── 📁 utils/           # Utilitários
│   │   └── request.ts      # Cliente HTTP + Sistema de Mocks
│   ├── 📁 actions/         # Server Actions
│   └── 📁 config/          # Configurações
│
└── 📁 hooks/               # Custom React Hooks
```

## 🏗️ Arquitetura e Decisões Técnicas

### **Next.js 14 App Router**

- **Server Components**: Para performance e SEO
- **Client Components**: Para interatividade
- **Server Actions**: Para operações de dados
- **Streaming**: Para carregamento progressivo

### **Gerenciamento de Estado Escalável**

Utilizamos **URL-based state management** em vez de Redux/Zustand:

```typescript
// Server Component - recebe filtros via searchParams
export default function HomePage({ searchParams }: PageProps) {
  const filters = parseSearchParams(searchParams);
  const booksData = await fetchBooks(filters); // SSR otimizado
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

**Vantagens:**

- ✅ URLs compartilháveis e bookmarkáveis
- ✅ SSR nativo sem hidratação complexa
- ✅ Navegação intuitiva (back/forward)
- ✅ SEO otimizado
- ✅ Cache inteligente do Next.js

### **Sistema de Filtros Avançados**

#### **Componente Modular e Extensível**

```typescript
interface BookFilters {
  title?: string;
  author?: string;
  publisher?: string;
  subjects?: string;
  synopsis?: string;
  pages_min?: number;
  pages_max?: number;
  format?: string;
  // Novos filtros podem ser adicionados facilmente
}
```

#### **Filtros Acumulativos**

- Múltiplos filtros podem ser combinados simultaneamente
- Exemplo: título + editora + faixa de páginas
- Persistência via URL para compartilhamento

#### **Debounce para Performance**

```typescript
// SearchBar.tsx - Hook customizado
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Uso: debounce de 500ms na busca por título
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

### **shadcn/ui + Tailwind CSS**

- **Design System**: Componentes consistentes e acessíveis
- **Customização**: Temas e variantes facilmente modificáveis
- **Responsividade**: Mobile-first design
- **Acessibilidade**: ARIA labels e navegação por teclado

### **Fetch Nativo Otimizado**

```typescript
// request.ts - Otimizado para SSR
const requestOptions: RequestInit = {
  headers: { "Content-Type": "application/json" },
  ...options,
};

// Cache automático no servidor
if (isServer && (!options.method || options.method === "GET")) {
  requestOptions.next = {
    revalidate: API_CONFIG.CACHE_DURATION,
    tags: ["api-data"],
  };
}
```

## 🧪 Testes E2E com Cypress

### **Sistema de Mocks Inteligente**

**Problema**: Cypress interceptors não funcionam com Next.js SSR.

**Solução**: Sistema de detecção de ambiente com mocks funcionais:

```typescript
// request.ts - Detecção de ambiente de teste
const isCypress = process.env.NEXT_PUBLIC_IS_CYPRESS_TEST === "true";

if (isCypress) {
  console.log("🧪 Test mode detected - using mock data");

  // Aplica filtros nos dados mockados
  let filteredBooks = [...MOCK_BOOKS_RESPONSE.books];

  if (title) {
    filteredBooks = filteredBooks.filter((book) =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  // ... outros filtros

  return filteredResponse;
}
```

### **Cobertura de Testes**

```
cypress/e2e/
├── 00-mock-verification.cy.ts     # Verifica dados mockados
├── 01-home-page.cy.ts            # Testa carregamento e UI
├── 02-search-and-filters.cy.ts   # Valida sistema de filtros
├── 03-book-management.cy.ts      # Testa CRUD completo
└── 04-pagination-and-navigation.cy.ts # Testa navegação
```

## 📋 Scripts Disponíveis

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "cypress:open": "cypress open",
  "cypress:run": "cypress run"
}
```

## 🎨 Componentes Principais

### **SearchBar**

- Busca por título com debounce de 500ms
- Sincronização automática com URL
- Botão de limpar filtros

### **FiltersSidebar**

- Filtros por texto (autor, editora, sinopse, assuntos)
- Filtros numéricos (páginas min/max)
- Ordenação customizável
- Aplicação e limpeza de filtros

### **BooksGrid/BooksList**

- Exibição responsiva de livros
- Estados de loading com skeletons
- Estados vazios tratados
- Ações de CRUD por livro

### **Modais (Create/Edit)**

- Formulários validados
- Formatação automática (preço, ISBN)
- Feedback visual de sucesso/erro

## 🔧 Configurações

### **Next.js** (`next.config.mjs`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações otimizadas
};
```

### **Tailwind CSS** (`tailwind.config.ts`)

- Configuração do shadcn/ui
- Cores customizadas
- Animações personalizadas

### **TypeScript** (`tsconfig.json`)

- Configuração estrita
- Path mapping para imports absolutos
- Tipos otimizados para Next.js 14
