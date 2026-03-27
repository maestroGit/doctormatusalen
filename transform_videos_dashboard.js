// Script para transformar videos_matusalen.json al formato que espera el dashboard
// Genera videos_dashboard.json con las claves correctas

const fs = require('fs');

const videos = JSON.parse(fs.readFileSync('videos_matusalen.json', 'utf8'));

const transformed = videos.map(v => ({
  titulo: v.title,
  categoria: 'General', // Puedes mejorar esto con análisis de palabras clave
  contenido: v.description,
  fecha: v.publishedAt.split('T')[0],
  canal: 'Doctor Matusalén',
  url: `https://www.youtube.com/watch?v=${v.id}`
}));

fs.writeFileSync('videos_dashboard.json', JSON.stringify(transformed, null, 2));
console.log('Archivo videos_dashboard.json generado correctamente.');
