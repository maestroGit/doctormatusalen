// Servidor Express para actualizar videos y transcripciones
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

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
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://0.0.0.0:${PORT}`);
});
