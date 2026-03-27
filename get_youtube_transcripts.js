// Script para obtener transcripciones de videos de YouTube usando youtube-captions-scraper
// Instala primero: npm install youtube-captions-scraper

const fs = require('fs');
const { getSubtitles } = require('youtube-captions-scraper');

const videos = [{ id: '1zQ54WUwTRQ', title: 'Video de prueba' }]; // Solo el video solicitado

async function fetchTranscripts() {
  const results = [];
  for (const video of videos) {
    let transcript = null;
    try {
      transcript = await getSubtitles({
        videoID: video.id,
        lang: 'es'
      });
      results.push({
        id: video.id,
        title: video.title,
        transcript: transcript.map(line => line.text).join(' ')
      });
      console.log(`Transcripción ES obtenida para: ${video.title}`);
    } catch (e1) {
      try {
        transcript = await getSubtitles({
          videoID: video.id
        });
        results.push({
          id: video.id,
          title: video.title,
          transcript: transcript.map(line => line.text).join(' ')
        });
        console.log(`Transcripción (auto) obtenida para: ${video.title}`);
      } catch (e2) {
        results.push({
          id: video.id,
          title: video.title,
          transcript: ''
        });
        console.log(`No se encontró transcripción para: ${video.title}`);
      }
    }
  }
  fs.writeFileSync('transcripts_matusalen.json', JSON.stringify(results, null, 2));
  console.log('Transcripciones guardadas en transcripts_matusalen.json');
}

fetchTranscripts();
