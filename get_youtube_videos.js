// Reemplaza 'YOUR_API_KEY' con tu clave de Google Cloud
// Reemplaza 'CHANNEL_ID' con el ID del canal de YouTube


import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.YOUTUBE_API_KEY; // <-- Lee la clave desde .env
const channelId = 'UCl82VvswZDxdrNfr7mh_tAg'; // Canal Doctor Matusalén (correcto)

const youtube = google.youtube({ version: 'v3', auth: apiKey });

// Convierte una duración ISO 8601 (PT#M#S, PT#H#M#S, etc) a segundos
function durationToSeconds(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Suma el total de segundos de todos los videos
function calcularTotalSegundos(videos) {
  return videos.reduce((acc, v) => acc + durationToSeconds(v.duration), 0);
}

async function getAllVideos(channelId) {
  let videos = [];
  let seenIds = new Set();
  let nextPageToken = '';
  let page = 1;
  const maxTries = 3;

  do {
    let tries = 0;
    let res, ids = [];
    while (tries < maxTries) {
      res = await youtube.search.list({
        channelId,
        part: 'id',
        maxResults: 50,
        order: 'date',
        pageToken: nextPageToken,
        type: 'video',
      });
      ids = res.data.items.map(item => item.id.videoId);
      console.log(`Página ${page} intento ${tries+1}: search.items.length = ${ids.length}, nextPageToken = ${res.data.nextPageToken}`);
      if (ids.length === 50 || !res.data.nextPageToken) break;
      tries++;
      if (tries < maxTries) {
        console.warn(`Reintentando página ${page}...`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (ids.length < 50 && res.data.nextPageToken) {
      console.warn(`Advertencia: página ${page} solo devolvió ${ids.length} videos tras ${maxTries} intentos.`);
    }
    if (ids.length === 0) break;
    const details = await youtube.videos.list({
      id: ids.join(','),
      part: 'snippet,contentDetails,statistics',
      maxResults: 50,
    });
    let nuevos = 0;
    for (const item of details.data.items) {
      if (!seenIds.has(item.id)) {
        videos.push({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
          duration: item.contentDetails.duration,
          statistics: item.statistics
        });
        seenIds.add(item.id);
        nuevos++;
      }
    }
    console.log(`Página ${page}: descargados ${nuevos} videos nuevos (total acumulado: ${videos.length})`);
    nextPageToken = res.data.nextPageToken;
    page++;
  } while (nextPageToken);
  return videos;
}


// Ejecutar solo si es el módulo principal
if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1] === import.meta.url.replace('file://','')) {
  (async () => {
    let prevVideos = [];
    let prevIds = new Set();
    const path = 'videos_matusalen.json';
    if (fs.existsSync(path)) {
      try {
        prevVideos = JSON.parse(fs.readFileSync(path, 'utf8'));
        prevVideos.forEach(v => prevIds.add(v.id));
        console.log(`Cargados ${prevVideos.length} videos previos.`);
      } catch (e) {
        console.warn('No se pudo leer videos_matusalen.json, se sobrescribirá.');
      }
    }
    const videos = await getAllVideos(channelId);
    let nuevos = 0;
    for (const v of videos) {
      if (!prevIds.has(v.id)) {
        prevVideos.push(v);
        nuevos++;
      }
    }
    // Eliminar duplicados por si acaso
    const unique = Object.values(prevVideos.reduce((acc, v) => { acc[v.id] = v; return acc; }, {}));
    fs.writeFileSync(path, JSON.stringify(unique, null, 2));
    console.log(`Guardados ${unique.length} videos en videos_matusalen.json (${nuevos} nuevos añadidos)`);

    // Calcular y mostrar el total de segundos acumulados
    const totalSegundos = calcularTotalSegundos(unique);
    console.log(`Duración total acumulada de videos: ${totalSegundos} segundos (${(totalSegundos/60).toFixed(2)} minutos, ${(totalSegundos/3600).toFixed(2)} horas)`);
  })();
}
