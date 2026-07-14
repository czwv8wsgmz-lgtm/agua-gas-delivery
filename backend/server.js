const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Criar pasta de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração de CORS
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuração do Multer para upload de vídeos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        cb(null, `video_${uniqueId}.webm`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de vídeo são permitidos'));
        }
    }
});

// Array para armazenar metadados dos vídeos (em produção, usar BD)
let videos = [];

// Rotas

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// POST - Receber vídeo
app.post('/api/compartilhar-video', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo foi enviado' });
        }

        const videoData = {
            id: uuidv4(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            timestamp: req.body.timestamp || new Date().toISOString(),
            uploadedAt: new Date(),
            path: `/uploads/${req.file.filename}`
        };

        videos.push(videoData);

        console.log(`✅ Vídeo recebido: ${videoData.filename}`);
        console.log(`📊 Tamanho: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

        res.json({
            success: true,
            message: 'Vídeo recebido com sucesso!',
            id: videoData.id,
            filename: videoData.filename,
            size: videoData.size
        });
    } catch (error) {
        console.error('❌ Erro ao processar vídeo:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao processar vídeo: ' + error.message 
        });
    }
});

// GET - Listar todos os vídeos
app.get('/api/videos', (req, res) => {
    res.json({
        total: videos.length,
        videos: videos.map(v => ({
            id: v.id,
            filename: v.filename,
            size: v.size,
            uploadedAt: v.uploadedAt,
            timestamp: v.timestamp
        }))
    });
});

// GET - Obter detalhes de um vídeo específico
app.get('/api/videos/:id', (req, res) => {
    const video = videos.find(v => v.id === req.params.id);
    
    if (!video) {
        return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    res.json(video);
});

// GET - Download de um vídeo
app.get('/uploads/:filename', (req, res) => {
    const filepath = path.join(uploadsDir, req.params.filename);
    
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    res.download(filepath);
});

// DELETE - Deletar um vídeo
app.delete('/api/videos/:id', (req, res) => {
    const index = videos.findIndex(v => v.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    const video = videos[index];
    const filepath = path.join(uploadsDir, video.filename);

    // Deletar arquivo
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }

    // Remover do array
    videos.splice(index, 1);

    res.json({ success: true, message: 'Vídeo deletado com sucesso' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        videosStored: videos.length
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.message);
    res.status(500).json({ 
        success: false,
        message: err.message || 'Erro interno do servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n🚀 Servidor iniciado com sucesso!');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📁 Pasta de uploads: ${uploadsDir}`);
    console.log('\n✨ Pronto para receber vídeos!\n');
});

module.exports = app;