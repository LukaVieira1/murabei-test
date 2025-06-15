# 🔧 Backend - Murabei Books API

API RESTful para gerenciamento de livros desenvolvida com **Python Flask**, **SQLAlchemy** e arquitetura limpa.

## 🚀 Tecnologias Utilizadas

- **Framework**: Flask 3.0.3
- **Banco de Dados**: SQLite3 com SQLAlchemy
- **Arquitetura**: Clean Architecture com DI Container
- **Validação**: Sistema de filtros modular
- **Logging**: Middleware customizado
- **CORS**: Flask-CORS para integração frontend
- **Containerização**: Docker

## 📁 Estrutura do Projeto

```
backend/
├── 📁 core/                    # Configurações centrais
│   ├── __init__.py            # Inicialização do módulo
│   └── container.py           # Container de dependências (DI)
│
├── 📁 models/                 # Modelos de dados (SQLAlchemy)
│   ├── __init__.py           # Inicialização do módulo
│   ├── book.py              # Modelo de livros
│   └── author.py            # Modelo de autores
│
├── 📁 routes/                 # Endpoints da API
│   ├── __init__.py           # Inicialização do módulo
│   ├── books.py             # Rotas de livros (CRUD + filtros)
│   ├── authors.py           # Rotas de autores
│   └── health.py            # Health check e status
│
├── 📁 services/               # Lógica de negócio
│   ├── __init__.py           # Inicialização do módulo
│   ├── book_service.py      # Serviços de livros
│   └── database_service.py  # Gerenciamento de banco
│
├── 📁 filters/                # Sistema de filtros modular
│   ├── __init__.py           # Inicialização do módulo
│   ├── base_filter.py       # Classe base abstrata
│   └── book_filters.py      # Filtros específicos de livros
│
├── 📁 middleware/             # Middlewares da aplicação
│   ├── __init__.py           # Inicialização do módulo
│   └── logging_middleware.py # Middleware de logs
│
├── app.py                    # Aplicação principal Flask
├── config.py                 # Configurações da aplicação
├── requirements.txt          # Dependências Python
├── Dockerfile               # Container do backend
└── db.sqlite                # Banco de dados SQLite
```

## 🏗️ Arquitetura e Decisões Técnicas

### **Clean Architecture**

Implementamos separação clara de responsabilidades:

```python
# Camada de Apresentação (Routes)
@books_bp.route('/books', methods=['GET'])
def get_books():
    book_service = get_book_service()  # DI Container
    return book_service.get_books_with_filters(filters)

# Camada de Negócio (Services)
class BookService:
    def get_books_with_filters(self, filters):
        # Aplica filtros e regras de negócio
        return self.db_service.execute_query(query)

# Camada de Dados (Database Service)
class DatabaseService:
    def execute_query(self, query, params):
        # Execução segura de queries
```

### **Container de Dependências**

Sistema de injeção de dependências para desacoplamento:

```python
# core/container.py
class Container:
    def register_singleton(self, name, factory):
        # Registra serviços como singleton

    def get(self, name):
        # Resolve dependências automaticamente

# Uso na aplicação
container.register_singleton('database_service', create_db_service)
container.register_singleton('book_service', create_book_service)
```

### **Sistema de Filtros Escalável**

#### **Arquitetura Modular**

```python
# filters/base_filter.py
class BaseFilter(ABC):
    @abstractmethod
    def apply(self, query_builder, value):
        pass

    @abstractmethod
    def is_valid(self, value):
        pass

# filters/book_filters.py
class TextFilter(BaseFilter):
    def apply(self, query_builder, value):
        return query_builder.filter(self.field.ilike(f'%{value}%'))

class NumericRangeFilter(BaseFilter):
    def apply(self, query_builder, value):
        if 'min' in value:
            query_builder = query_builder.filter(self.field >= value['min'])
        if 'max' in value:
            query_builder = query_builder.filter(self.field <= value['max'])
        return query_builder
```

#### **Tipos de Filtros Disponíveis**

1. **TextFilter** - Busca parcial (LIKE)

   - Campos: `title`, `author`, `publisher`, `synopsis`, `subjects`
   - Exemplo: `?title=Harry&author=Rowling`

2. **ExactFilter** - Busca exata (=)

   - Campos: `format`, `edition`
   - Exemplo: `?format=Hardcover`

3. **NumericRangeFilter** - Filtros numéricos com min/max

   - Campos: `pages`, `isbn13`
   - Exemplo: `?pages_min=100&pages_max=500`

4. **MultiValueFilter** - Múltiplos valores (IN)
   - Campos: `subjects`, `format`
   - Exemplo: `?subjects=Fiction,Drama`

### **Middleware de Logging**

Sistema de logging centralizado para auditoria:

```python
# middleware/logging_middleware.py
def setup_request_logging(app):
    @app.before_request
    def log_request():
        logger.info(f"{request.method} {request.path}")

    @app.after_request
    def log_response(response):
        logger.info(f"Response: {response.status_code}")
        return response
```

## 🌐 API Endpoints

### **📚 Books**

#### `GET /api/v1/books`

Lista livros com filtros avançados, paginação e ordenação.

**Parâmetros de Query:**

```
# Filtros de texto
?title=string          # Filtro por título
?author=string         # Filtro por autor
?publisher=string      # Filtro por editora
?subjects=string       # Filtro por assuntos
?synopsis=string       # Filtro por sinopse

# Filtros numéricos
?pages_min=number      # Número mínimo de páginas
?pages_max=number      # Número máximo de páginas

# Filtros exatos
?format=string         # Formato exato (Digital/Physical)

# Paginação
?page=number           # Número da página (padrão: 1)
?page_size=number      # Itens por página (padrão: 10, máx: 100)

# Ordenação
?order_by=string       # Campo para ordenação
?order_direction=ASC|DESC  # Direção da ordenação
```

**Resposta:**

```json
{
  "books": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "publisher": "Pearson",
      "pages": 464,
      "format": "Digital",
      "subjects": "Programming, Software Engineering"
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 10,
    "total_count": 50,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "title": "Clean"
  }
}
```

#### `GET /api/v1/books/{id}`

Busca livro por ID.

#### `POST /api/v1/books`

Cria novo livro.

**Body:**

```json
{
  "title": "Novo Livro",
  "author": "Autor",
  "publisher": "Editora",
  "pages": 300,
  "format": "Digital",
  "subjects": "Ficção, Drama"
}
```

#### `PUT /api/v1/books/{id}`

Atualiza livro existente.

#### `DELETE /api/v1/books/{id}`

Remove livro.

### **📊 Metadata**

#### `GET /api/v1/subjects`

Lista todos os assuntos disponíveis.

#### `GET /api/v1/publishers`

Lista todas as editoras disponíveis.

#### `GET /api/v1/filter-options`

Retorna opções disponíveis para filtros.

### **🏥 Health Check**

#### `GET /health`

Status da aplicação e conectividade do banco.

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

## 🔒 Segurança

### **Prevenção de SQL Injection**

```python
# Uso de prepared statements
def execute_query(self, query, params=None):
    cursor = self.connection.cursor()
    cursor.execute(query, params or [])
    return cursor.fetchall()
```

### **Validação de Input**

```python
# Validação rigorosa em todos os filtros
class TextFilter(BaseFilter):
    def is_valid(self, value):
        return isinstance(value, str) and len(value.strip()) > 0
```

### **Tratamento de Erros**

```python
@app.errorhandler(ValueError)
def handle_value_error(error):
    logger.warning(f"Validation error: {error}")
    return jsonify({
        'error': 'Validation error',
        'message': str(error)
    }), 400
```

## 🚀 Como Executar

### **Desenvolvimento Local**

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar aplicação
python app.py
```

### **Docker**

```bash
# Build da imagem
docker build -t backend .

# Executar container
docker run -p 5000:5000 backend
```

### **Produção com Gunicorn**

```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

## 📋 Configurações

### **Variáveis de Ambiente**

```bash
FLASK_ENV=development          # Ambiente (development/production)
DATABASE_PATH=db.sqlite        # Caminho do banco SQLite
HOST=0.0.0.0                  # Host da aplicação
PORT=5000                     # Porta da aplicação
DEBUG=True                    # Modo debug
LOG_LEVEL=INFO                # Nível de log
CORS_ORIGINS=*                # Origens permitidas para CORS
```

### **Configuração do Flask**

```python
# config.py
class Config:
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'db.sqlite')
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
```

## 🧪 Exemplos de Uso

### **Busca Simples**

```bash
curl "http://localhost:5000/api/v1/books?title=Python"
```

### **Filtros Múltiplos**

```bash
curl "http://localhost:5000/api/v1/books?title=Clean&author=Martin&pages_min=200"
```

### **Paginação e Ordenação**

```bash
curl "http://localhost:5000/api/v1/books?page=2&page_size=20&order_by=title&order_direction=ASC"
```

### **Criar Livro**

```bash
curl -X POST "http://localhost:5000/api/v1/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Livro",
    "author": "Autor Exemplo",
    "publisher": "Editora Exemplo",
    "pages": 300,
    "format": "Digital"
  }'
```

## 🔧 Extensibilidade

### **Adicionando Novos Filtros**

1. **Criar filtro customizado:**

```python
# filters/book_filters.py
class DateRangeFilter(BaseFilter):
    def apply(self, query_builder, value):
        if 'start' in value:
            query_builder = query_builder.filter(self.field >= value['start'])
        if 'end' in value:
            query_builder = query_builder.filter(self.field <= value['end'])
        return query_builder

    def is_valid(self, value):
        return isinstance(value, dict) and ('start' in value or 'end' in value)
```

2. **Registrar no BookService:**

```python
# services/book_service.py
def _initialize_filters(self):
    self.available_filters = [
        # ... filtros existentes
        DateRangeFilter('publication_date'),
    ]
```

3. **Usar na API:**

```bash
GET /api/v1/books?publication_date_start=2020-01-01&publication_date_end=2023-12-31
```

## 📊 Performance

- **Queries Otimizadas**: Uso de índices e prepared statements
- **Paginação**: Controle de memória com page_size limitado
- **Connection Pooling**: Reutilização de conexões de banco
- **Logging Eficiente**: Logs estruturados para debugging

## 🐳 Docker

### **Dockerfile Multi-Stage**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

## 🔗 Links Úteis

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)
- [Gunicorn](https://gunicorn.org/)

---

**Desenvolvido com ❤️ para Murabei Data Science**
