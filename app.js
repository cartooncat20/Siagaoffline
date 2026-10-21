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
const statusText = statusBadge ? statusBadge.querySelector('.status-text') : null;

function updateOnlineStatus() {
  if (!statusBadge || !statusText) return;
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

// 2. Hardware GPS Geolocation API (Mode Akurasi Tinggi & Bebas Error)
const gpsDisplay = document.getElementById('gps-display');
const gpsTimestamp = document.getElementById('gps-timestamp');
const btnGetLocation = document.getElementById('btn-get-location');
const btnShareCoords = document.getElementById('btn-share-coords');

function getGPSLocation() {
  if (!gpsDisplay || !btnGetLocation) return;

  // Cek protokol HTTPS (Syarat wajib Geolocation browser modern)
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    gpsDisplay.innerHTML = '⚠️ Geolocation membutuhkan koneksi aman (HTTPS).';
    return;
  }

  // Tampilan awal saat memindai
  btnGetLocation.classList.add('loading');
  btnGetLocation.disabled = true;
  gpsDisplay.textContent = '🛰️ Memindai satelit GPS...';
  if (gpsTimestamp) gpsTimestamp.textContent = '';

  if (!('geolocation' in navigator)) {
    gpsDisplay.textContent = '❌ Fitur GPS tidak didukung di perangkat ini.';
    btnGetLocation.classList.remove('loading');
    btnGetLocation.disabled = false;
    return;
  }

  // Pengaturan opsi Geolocation untuk akurasi optimal & bebas error
  const optionsHighAccuracy = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 3000
  };

  const optionsFallback = {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 10000
  };

  // Fungsi penanganan saat koordinat berhasil didapatkan
  function onSuccess(position) {
    const lat = position.coords.latitude.toFixed(6);
    const lon = position.coords.longitude.toFixed(6);
    const acc = Math.round(position.coords.accuracy);
    const time = new Date().toLocaleTimeString('id-ID');

    gpsDisplay.textContent = `${lat}, ${lon} (±${acc}m)`;
    if (gpsTimestamp) gpsTimestamp.textContent = `⏱️ Diperbarui pukul: ${time}`;

    btnGetLocation.classList.remove('loading');
    btnGetLocation.disabled = false;
  }

  // Attempt 1: Coba dengan Hardware GPS Akurasi Tinggi
  navigator.geolocation.getCurrentPosition(
    onSuccess,
    (error) => {
      // Attempt 2: Jika akurasi tinggi gagal/timeout, coba fallback ke sinyal seluler/Wi-Fi
      if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (fallbackError) => {
            handleGPSError(fallbackError);
          },
          optionsFallback
        );
      } else {
        handleGPSError(error);
      }
    },
    optionsHighAccuracy
  );
}

// Penanganan pesan kesalahan GPS yang komunikatif
function handleGPSError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      gpsDisplay.innerHTML = '⚠️ Akses ditolak. Harap izinkan <b>Lokasi/GPS</b> pada pengaturan browser HP Anda.';
      break;
    case error.POSITION_UNAVAILABLE:
      gpsDisplay.textContent = '⚠️ Sinyal GPS lemah. Coba berpindah ke area terbuka.';
      break;
    case error.TIMEOUT:
      gpsDisplay.textContent = '⚠️ Waktu pencarian GPS habis. Silakan klik "Perbarui GPS".';
      break;
    default:
      gpsDisplay.textContent = '⚠️ Tidak dapat membaca lokasi. Aktifkan fitur Lokasi HP Anda.';
  }

  btnGetLocation.classList.remove('loading');
  btnGetLocation.disabled = false;
}

if (btnGetLocation) {
  btnGetLocation.addEventListener('click', getGPSLocation);
}

// Jalankan otomatis saat halaman dimuat
window.addEventListener('DOMContentLoaded', getGPSLocation);

// 3. Salin Koordinat GPS
if (btnShareCoords) {
  btnShareCoords.addEventListener('click', () => {
    const textToCopy = gpsDisplay ? gpsDisplay.textContent : '';

    if (textToCopy && !textToCopy.includes('Memindai') && !textToCopy.includes('⚠️') && !textToCopy.includes('❌')) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          const btnText = btnShareCoords.querySelector('.btn-text');
          const originalText = btnText ? btnText.textContent : 'Salin Koordinat';
          if (btnText) btnText.textContent = 'Tersalin!';
          btnShareCoords.style.background = '#10b981';
          btnShareCoords.style.color = '#ffffff';

          setTimeout(() => {
            if (btnText) btnText.textContent = originalText;
            btnShareCoords.style.background = '';
            btnShareCoords.style.color = '';
          }, 2000);
        })
        .catch(() => alert('Gagal menyalin teks.'));
  } else {
    alert('Koordinat GPS belum siap untuk disalin.');
  }
});
}
