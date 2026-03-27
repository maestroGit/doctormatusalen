// Servidor Express para actualizar videos y transcripciones
import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8080;

// Soporte para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Endpoint para actualizar videos
app.post('/update-videos', (req, res) => {
  exec('node get_youtube_videos.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando get_youtube_videos.js:', error);
      return res.status(500).json({ error: 'Error actualizando videos', details: stderr });
    }
    res.json({ message: 'Videos actualizados', output: stdout });
  });
});

// Endpoint para actualizar transcripciones
app.post('/update-transcripts', (req, res) => {
  exec('node get_youtube_transcripts.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando get_youtube_transcripts.js:', error);
      return res.status(500).json({ error: 'Error actualizando transcripciones', details: stderr });
    }
    res.json({ message: 'Transcripciones actualizadas', output: stdout });
  });
});

// Servir archivos estáticos (dashboard, json, etc)

// Redirigir la ruta raíz a doctormatusalen.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'doctormatusalen.html'));
});

app.use(express.static(__dirname));


app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://0.0.0.0:${PORT}`);
  console.log('[LOG] Servidor Express INICIADO');
});

process.on('SIGINT', () => {
  console.log('[LOG] Servidor Express DETENIDO por SIGINT (Ctrl+C)');
  // No llamamos process.exit() aquí para ver si el proceso se mantiene
});

process.on('SIGTERM', () => {
  console.log('[LOG] Servidor Express DETENIDO por SIGTERM');
  // No llamamos process.exit() aquí para ver si el proceso se mantiene
});

console.log('[LOG] Fin del archivo server.js alcanzado');
