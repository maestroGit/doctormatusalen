// calculoDuracion.js
// Funciones para calcular la duración total de videos en segundos, minutos y horas

// Convierte una duración ISO 8601 (PT#H#M#S) a segundos
function durationToSeconds(duration) {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}

// Suma el total de segundos de todos los videos
function calcularTotalSegundos(videos) {
    return videos.reduce((acc, v) => acc + durationToSeconds(v.duracion || v.duration), 0);
}

// Devuelve un string legible con horas, minutos y segundos
function formatoDuracion(totalSeconds) {
    const horas = Math.floor(totalSeconds / 3600);
    const minutos = Math.floor((totalSeconds % 3600) / 60);
    const segundos = totalSeconds % 60;
    let texto = '';
    if (horas > 0) texto += horas + 'h ';
    if (minutos > 0 || horas > 0) texto += minutos + 'm ';
    texto += segundos + 's';
    return texto;
}

// Exportar para uso global en navegador
window.durationToSeconds = durationToSeconds;
window.calcularTotalSegundos = calcularTotalSegundos;
window.formatoDuracion = formatoDuracion;
