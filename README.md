# Asksuite test (frontend)

Este é um projeto frontend desenvolvido com Vue.js, utilizando o framework Quasar para componentes de UI.

## Tecnologias Utilizadas

- **Vue 3** como framework
- **Quasar** como biblioteca de componentes
- **Pinia** para gerenciamento de estado
- **JavaScript**

## Pré-requisitos
- Node.js 20+

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/ricrdev-eng/ask-test-frontend
cd ask-test-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
API_URL=https://ask-test-production.up.railway.app
NODE_ENV=production
```

### 4. Rodando com backend local (Caso queira utilizar o banco de produçao, apenas mantenha o .env com NODE_ENV PRODUCTION)
Altere:
```env
NODE_ENV=DEV
API_URL=http://localhost:8080
```

---

## Iniciar servidor de desenvolvimento

```bash
npm run dev
```

## Build para produção

```bash
npm run build
```

---

## Vídeo no YouTube

Showcase do projeto:  
https://www.youtube.com/watch?v=Qglql7EONIs
