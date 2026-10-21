// Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker aktif:', reg.scope))
      .catch(err => console.error('Gagal memuat Service Worker:', err));
  });
}

// 1. Deteksi Status Sinyal Online / Offline dengan animasi
const statusBadge = document.getElementById('connection-status');
const statusText = statusBadge.querySelector('.status-text');

function updateOnlineStatus() {
  if (navigator.onLine) {
    statusBadge.className = 'status-badge online';
    statusText.textContent = 'Online';
  } else {
    statusBadge.className = 'status-badge offline';
    statusText.textContent = 'Offline';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// 2. Hardware GPS Geolocation API
const gpsDisplay = document.getElementById('gps-display');
const btnGetLocation = document.getElementById('btn-get-location');
const btnShareCoords = document.getElementById('btn-share-coords');

function getGPSLocation() {
  gpsDisplay.textContent = '🛰️ Memindai satelit GPS...';

  if (!('geolocation' in navigator)) {
    gpsDisplay.textContent = '❌ Fitur GPS tidak didukung di perangkat ini.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      const acc = Math.round(position.coords.accuracy);

      gpsDisplay.textContent = `${lat}, ${lon} (±${acc}m)`;
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          gpsDisplay.textContent = '⚠️ Akses lokasi ditolak. Harap beri izin GPS.';
          break;
        case error.POSITION_UNAVAILABLE:
          gpsDisplay.textContent = '⚠️ Sinyal GPS tidak ditemukan.';
          break;
        case error.TIMEOUT:
          gpsDisplay.textContent = '⚠️ Waktu pencarian GPS habis.';
          break;
        default:
          gpsDisplay.textContent = '⚠️ Gagal mendapatkan koordinat GPS.';
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

btnGetLocation.addEventListener('click', getGPSLocation);
getGPSLocation(); // Panggil saat aplikasi dimuat

// 3. Salin Koordinat GPS dengan Feedback Tombol
btnShareCoords.addEventListener('click', () => {
  const textToCopy = gpsDisplay.textContent;

  if (textToCopy && !textToCopy.includes('Memindai') && !textToCopy.includes('⚠️') && !textToCopy.includes('❌')) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        const originalText = btnShareCoords.innerHTML;
        btnShareCoords.innerHTML = '<span>Tersalin!</span>';
        btnShareCoords.style.background = '#10b981';
        btnShareCoords.style.color = '#ffffff';

        setTimeout(() => {
          btnShareCoords.innerHTML = originalText;
          btnShareCoords.style.background = '';
          btnShareCoords.style.color = '';
        }, 2000);
      })
      .catch(() => alert('Gagal menyalin teks.'));
  } else {
    alert('Koordinat GPS belum siap untuk disalin.');
  }
});
