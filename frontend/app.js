let stream = null;
let mediaRecorder = null;
let chunks = [];
const API_URL = 'http://localhost:3000';

// Iniciar a câmera
async function iniciarCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // Câmera frontal
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });

        const video = document.getElementById('videoPreview');
        video.srcObject = stream;

        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('shareBtn').disabled = false;
        
        atualizarStatus('✅ Câmera iniciada com sucesso!', 'success');
    } catch (erro) {
        atualizarStatus('❌ Erro ao acessar câmera: ' + erro.message, 'error');
    }
}

// Parar a câmera
function pararCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    document.getElementById('videoPreview').srcObject = null;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('shareBtn').disabled = true;
    
    atualizarStatus('⏹️ Câmera parada', 'info');
}

// Compartilhar câmera via Internet
async function compartilharCamera() {
    if (!stream) {
        atualizarStatus('❌ Nenhuma câmera ativa', 'error');
        return;
    }

    try {
        // Iniciar gravação
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8,opus'
        });
        chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            enviarParaServidor(blob);
        };

        mediaRecorder.onerror = (event) => {
            atualizarStatus('❌ Erro na gravação: ' + event.error, 'error');
        };

        mediaRecorder.start();
        atualizarStatus('🔴 Câmera sendo compartilhada... (5s)', 'info');

        // Parar após 5 segundos (ajuste conforme necessário)
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        }, 5000);

    } catch (erro) {
        atualizarStatus('❌ Erro ao compartilhar: ' + erro.message, 'error');
    }
}

// Enviar vídeo para o servidor
async function enviarParaServidor(blob) {
    try {
        const formData = new FormData();
        formData.append('video', blob, 'stream_' + Date.now() + '.webm');
        formData.append('timestamp', new Date().toISOString());

        atualizarStatus('📤 Enviando vídeo...', 'info');

        const response = await fetch(`${API_URL}/api/compartilhar-video`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            atualizarStatus('✅ Vídeo enviado com sucesso! ID: ' + (data.id || 'N/A'), 'success');
        } else {
            const error = await response.json();
            atualizarStatus('❌ Erro ao enviar vídeo: ' + (error.message || 'Erro desconhecido'), 'error');
        }
    } catch (erro) {
        atualizarStatus('❌ Erro na conexão: ' + erro.message, 'error');
    }
}

// Atualizar status
function atualizarStatus(mensagem, tipo = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = mensagem;
    statusDiv.className = 'status ' + tipo;
}

// Verificar compatibilidade do navegador
window.addEventListener('load', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        atualizarStatus('❌ Seu navegador não suporta acesso à câmera', 'error');
        document.getElementById('startBtn').disabled = true;
    }
});