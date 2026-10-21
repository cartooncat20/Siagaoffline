// Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker aktif:', reg.scope))
      .catch(err => console.error('Gagal memuat Service Worker:', err));
  });
}

// 1. Deteksi Status Sinyal Online / Offline
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

// 2. Hardware GPS Geolocation API (Perbaikan Fitur & Efek Tombol)
const gpsDisplay = document.getElementById('gps-display');
const gpsTimestamp = document.getElementById('gps-timestamp');
const btnGetLocation = document.getElementById('btn-get-location');
const btnShareCoords = document.getElementById('btn-share-coords');

function getGPSLocation() {
  // Efek Loading pada tombol dan teks
  btnGetLocation.classList.add('loading');
  btnGetLocation.disabled = true;
  gpsDisplay.textContent = '🛰️ Memindai satelit GPS...';
  gpsTimestamp.textContent = '';

  if (!('geolocation' in navigator)) {
    gpsDisplay.textContent = '❌ Fitur GPS tidak didukung di perangkat ini.';
    btnGetLocation.classList.remove('loading');
    btnGetLocation.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      const acc = Math.round(position.coords.accuracy);
      const time = new Date().toLocaleTimeString('id-ID');

      gpsDisplay.textContent = `${lat}, ${lon} (±${acc}m)`;
      gpsTimestamp.textContent = `⏱️ Diperbarui pukul: ${time}`;

      // Reset tombol
      btnGetLocation.classList.remove('loading');
      btnGetLocation.disabled = false;
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          gpsDisplay.textContent = '⚠️ Akses lokasi ditolak. Harap izinkan lokasi di HP Anda.';
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
      
      btnGetLocation.classList.remove('loading');
      btnGetLocation.disabled = false;
    },
    {
      enableHighAccuracy: true, // Memaksa modul hardware GPS aktif
      timeout: 15000,
      maximumAge: 0 // Mencegah penggunaan data cache lokasi lama
    }
  );
}

btnGetLocation.addEventListener('click', getGPSLocation);
getGPSLocation(); // Dapatkan GPS awal saat dibuka

// 3. Salin Koordinat GPS
btnShareCoords.addEventListener('click', () => {
  const textToCopy = gpsDisplay.textContent;

  if (textToCopy && !textToCopy.includes('Memindai') && !textToCopy.includes('⚠️') && !textToCopy.includes('❌')) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        const btnText = btnShareCoords.querySelector('.btn-text');
        const originalText = btnText.textContent;
        btnText.textContent = 'Tersalin!';
        btnShareCoords.style.background = '#10b981';
        btnShareCoords.style.color = '#ffffff';

        setTimeout(() => {
          btnText.textContent = originalText;
          btnShareCoords.style.background = '';
          btnShareCoords.style.color = '';
        }, 2000);
      })
      .catch(() => alert('Gagal menyalin teks.'));
  } else {
    alert('Koordinat GPS belum siap untuk disalin.');
  }
});
