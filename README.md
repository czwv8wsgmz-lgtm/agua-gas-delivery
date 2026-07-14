# 📷 Camera Sharing - Compartilhamento de Câmera

Aplicação web para compartilhar sua câmera frontal via internet. O usuário pode iniciar a câmera, visualizar o preview em tempo real e enviar o vídeo para um servidor backend.

## 🎯 Funcionalidades

✅ **Acesso à câmera frontal** - Usa a API `getUserMedia` do navegador

✅ **Preview em tempo real** - Visualize o stream da câmera antes de compartilhar

✅ **Compartilhamento via Internet** - Envie vídeos para o servidor backend

✅ **Gravação automática** - Grava 5 segundos de vídeo ao clicar em "Compartilhar"

✅ **API REST** - Endpoints para gerenciar vídeos

✅ **Armazenamento de vídeos** - Salva os vídeos no servidor

✅ **Interface responsiva** - Funciona em desktop e mobile

## 🏗️ Estrutura do Projeto

```
.
├── frontend/
│   ├── index.html      # Página principal
│   ├── style.css       # Estilos
│   └── app.js          # Lógica JavaScript
├── backend/
│   ├── server.js       # Servidor Express
│   ├── package.json    # Dependências
│   ├── uploads/        # Pasta de armazenamento de vídeos
│   └── .gitignore
└── README.md
```

## 📋 Pré-requisitos

- **Node.js** (v14 ou superior)
- **npm** (v6 ou superior)
- **Navegador moderno** com suporte a getUserMedia

## 🚀 Como Usar

### 1️⃣ Instalar Dependências (Backend)

```bash
cd backend
npm install
```

### 2️⃣ Iniciar o Servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (com auto-reload)
npm run dev
```

O servidor rodará em `http://localhost:3000`

### 3️⃣ Abrir a Aplicação

Abra seu navegador e acesse:

```
http://localhost:3000
```

Ou se estiver usando Live Server:

```
http://localhost:5500/frontend/
```

### 4️⃣ Usar a Aplicação

1. Clique em **"▶️ Iniciar Câmera"**
2. Permita acesso à câmera quando solicitado
3. Veja o preview da câmera frontal
4. Clique em **"🌐 Compartilhar via Internet"**
5. O vídeo será gravado por 5 segundos e enviado ao servidor
6. Aguarde a confirmação de sucesso

## 📡 API REST Endpoints

### POST `/api/compartilhar-video`
Compartilha um vídeo da câmera

**Request:**
```
Content-Type: multipart/form-data
video: <arquivo de vídeo>
timestamp: ISO timestamp (opcional)
```

**Response:**
```json
{
  "success": true,
  "message": "Vídeo recebido com sucesso!",
  "id": "uuid-do-vídeo",
  "filename": "video_uuid.webm",
  "size": 1024000
}
```

### GET `/api/videos`
Lista todos os vídeos armazenados

**Response:**
```json
{
  "total": 5,
  "videos": [
    {
      "id": "uuid",
      "filename": "video_uuid.webm",
      "size": 1024000,
      "uploadedAt": "2024-01-01T10:30:00Z",
      "timestamp": "2024-01-01T10:30:00Z"
    }
  ]
}
```

### GET `/api/videos/:id`
Obter detalhes de um vídeo específico

**Response:**
```json
{
  "id": "uuid",
  "filename": "video_uuid.webm",
  "size": 1024000,
  "uploadedAt": "2024-01-01T10:30:00Z",
  "timestamp": "2024-01-01T10:30:00Z",
  "path": "/uploads/video_uuid.webm"
}
```

### GET `/uploads/:filename`
Baixar um vídeo

### DELETE `/api/videos/:id`
Deletar um vídeo

### GET `/api/health`
Verificar status do servidor

## 🎨 Personalização

### Alterar duração da gravação

Em `frontend/app.js`, linha ~80:

```javascript
// Mudar 5000 para a duração desejada em milissegundos
setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}, 5000); // ← Altere aqui (em ms)
```

### Alterar qualidade da câmera

Em `frontend/app.js`, linha ~18:

```javascript
video: {
    facingMode: 'user',
    width: { ideal: 1280 },  // ← Altere aqui
    height: { ideal: 720 }   // ← Altere aqui
}
```

### Alterar porto do servidor

Em `backend/server.js`, linha ~14:

```javascript
const PORT = process.env.PORT || 3000; // ← Altere o número
```

Ou via variável de ambiente:

```bash
PORT=5000 npm start
```

## 🔒 Segurança

⚠️ **Nota Importante**: Esta é uma aplicação de exemplo. Para usar em produção:

1. ✅ Implemente autenticação/autorização
2. ✅ Valide uploads de arquivos
3. ✅ Use HTTPS obrigatoriamente
4. ✅ Implemente rate limiting
5. ✅ Configure CORS adequadamente
6. ✅ Use banco de dados em vez de array em memória
7. ✅ Implemente criptografia de vídeos
8. ✅ Monitore e limpe uploads antigos

## 🐛 Troubleshooting

### "Erro ao acessar câmera"
- Verificar permissões de câmera no navegador
- Tentar em outro navegador
- Usar HTTPS em produção (getUserMedia requer contexto seguro)

### "Erro na conexão"
- Verificar se o servidor backend está rodando
- Verificar se a URL da API está correta
- Verificar configurações de CORS

### Vídeo não aparece no preview
- Verificar se a câmera não está sendo usada por outro aplicativo
- Tentar reiniciar o navegador
- Verificar permissões do sistema operacional

## 📦 Dependências Backend

- **express** - Framework web
- **cors** - Middleware de CORS
- **multer** - Middleware para upload de arquivos
- **uuid** - Geração de IDs únicos
- **nodemon** (dev) - Auto-reload em desenvolvimento

## 📝 Licença

MIT

## 🤝 Contribuindo

Sinta-se livre para fazer fork, criar issues e pull requests!

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para compartilhamento de câmera via internet**
