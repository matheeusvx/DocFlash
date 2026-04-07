# 🚀 DocFlash

> Transforme PDFs e documentos em insights claros e acionáveis em segundos.

---

## 📌 Sobre o projeto

O **DocFlash** é uma aplicação web full-stack que permite ao usuário enviar documentos (PDF ou TXT), extrair seu conteúdo e gerar automaticamente:

- ✅ Resumo executivo  
- ✅ Pontos-chave  
- ✅ Próximas ações  

O objetivo é reduzir o tempo de leitura e facilitar a tomada de decisão a partir de documentos extensos.

---

## 🎯 Proposta de valor

Em vez de apenas resumir textos, o DocFlash transforma documentos em **insights estruturados e acionáveis**, melhorando:

- compreensão rápida  
- organização da informação  
- produtividade  

---

## 🧠 Tecnologias utilizadas

### Frontend
- React
- Vite
- CSS customizado

### Backend
- Node.js
- Express
- Multer (upload de arquivos)
- pdf-parse (extração de texto)

### Estrutura do backend

- `server.js` → ponto de entrada da aplicação
- `src/` → lógica organizada em camadas

### Inteligência Artificial
- Google Gemini API (geração de insights)

---

## ⚙️ Arquitetura

O projeto segue uma arquitetura organizada em camadas:

```
server/
  src/
    controllers/
    services/
    routes/
    middleware/
    utils/

client/
  src/
    components/
```

### Separação de responsabilidades:

- **Controller** → gerencia requisições  
- **Service** → lógica de negócio (IA + processamento)  
- **Middleware** → upload e validações  
- **Frontend** → UI e experiência do usuário  

---

## 🔄 Fluxo da aplicação

1. Usuário faz upload de um arquivo (PDF ou TXT)  
2. Backend extrai o texto  
3. O texto é enviado para a IA (Gemini)  
4. A IA retorna:
   - resumo  
   - pontos-chave  
   - ações sugeridas  
5. Frontend renderiza os resultados  

---

## 🧪 Funcionalidades

- Upload de PDF e TXT  
- Extração automática de texto  
- Geração de insights com IA  
- Interface limpa e responsiva  
- Tratamento de erros e fallback inteligente  
- Normalização de respostas da IA  

---

## ⚠️ Tratamento de edge cases

O sistema trata cenários como:

- PDFs sem texto (escaneados)  
- respostas inválidas da IA  
- arquivos vazios ou inválidos  
- normalização de JSON da IA  

---

## 🔐 Configuração de ambiente

Crie um arquivo `.env` na raiz do projeto:

```
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
PORT=3002
CLIENT_URL=http://localhost:5173
```

---

## ▶️ Como rodar o projeto

### 🔹 Backend

```
cd server
npm install
npm start
```

---

### 🔹 Frontend

```
cd client
npm install
npm run dev
```

---

### 🌐 Acesse no navegador

```
http://localhost:5173
```

---

## 🖥️ Demonstração

A aplicação permite:

- Upload de arquivos  
- Visualização de insights estruturados  
- Interação simples e objetiva  

---

## 💡 Decisões técnicas

- Arquitetura em camadas para escalabilidade  
- Uso de IA com estrutura JSON padronizada  
- Separação clara entre frontend e backend  
- Tratamento defensivo de respostas da IA  

---

## 🚧 Melhorias futuras

- Suporte a DOCX  
- Histórico de documentos  
- Exportação dos resultados  
- Autenticação de usuários  
- Diferentes tipos de resumo  
- Upload múltiplo  

---

## 🤖 Uso de IA no desenvolvimento

Ferramentas de IA foram utilizadas para:

- acelerar a estruturação do projeto  
- auxiliar na implementação  
- sugerir melhorias  

Todo o desenvolvimento foi supervisionado manualmente.

---

## 🎥 Apresentação em vídeo

*(Adicionar link aqui)*

---

## 📂 Repositório

https://github.com/matheeusxv/DocFlash

---

## 👨‍💻 Autor

Matheus Morelli

---

## 📌 Considerações finais

Este projeto foi desenvolvido com foco em:

- clareza de solução  
- qualidade de código  
- experiência do usuário  
- aplicação prática de IA  
