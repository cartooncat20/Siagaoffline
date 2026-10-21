// Kredensial Valid Bawaan
const VALID_USER = "siaga";
const VALID_PASS = "123456";

// Element Ref
const loginOverlay = document.getElementById('login-overlay');
const addressOverlay = document.getElementById('address-overlay');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const addressForm = document.getElementById('address-form');
const loginError = document.getElementById('login-error');
const btnLogin = document.getElementById('btn-login');
const displayAddress = document.getElementById('display-address');
const btnLogout = document.getElementById('btn-logout');

// 1. Logika Login Manual
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (user === VALID_USER && pass === VALID_PASS) {
    handleSuccessfulLogin("Pengguna Manual");
  } else {
    // Skenario Pemblokiran Saat Login Salah
    loginError.style.display = 'block';
    btnLogin.disabled = true;
    btnLogin.textContent = '🔒 Website Diblokir';
    document.getElementById('username').disabled = true;
    document.getElementById('password').disabled = true;

    setTimeout(() => {
      alert("Akses Ditolak! Kredensial salah. Sistem mengunci antarmuka untuk mencegah kebocoran data.");
    }, 100);
  }
});

// 2. Logika Login Platform Pihak Ketiga (Google, Facebook, Apple)
document.getElementById('btn-login-google').addEventListener('click', () => {
  handleSuccessfulLogin("Pengguna Google");
});

document.getElementById('btn-login-facebook').addEventListener('click', () => {
  handleSuccessfulLogin("Pengguna Facebook");
});

document.getElementById('btn-login-apple').addEventListener('click', () => {
  handleSuccessfulLogin("Pengguna Apple / iPhone");
});

function handleSuccessfulLogin(providerName) {
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('authProvider', providerName);
  loginError.style.display = 'none';
  loginOverlay.classList.add('hidden');
  checkAddressStep();
}

function checkAddressStep() {
  const savedAddress = localStorage.getItem('userAddress');
  if (!savedAddress) {
    addressOverlay.classList.remove('hidden');
  } else {
    displayAddress.textContent = savedAddress;
    mainContent.classList.remove('hidden');
    getGPSLocation();
  }
}

// 3. Simpan Alamat Pengguna
addressForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const addressText = document.getElementById('user-address').value.trim();
  if (addressText) {
    localStorage.setItem('userAddress', addressText);
    displayAddress.textContent = addressText;
    addressOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
    getGPSLocation();
  }
});

// Logout
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('authProvider');
    window.location.reload();
  });
}

// Inisialisasi Sesi Saat Dimuat
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    loginOverlay.classList.add('hidden');
    checkAddressStep();
  }
});

// Status Sinyal Online / Offline
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

// Pembacaan Lokasi GPS
const gpsDisplay = document.getElementById('gps-display');
const gpsTimestamp = document.getElementById('gps-timestamp');
const btnGetLocation = document.getElementById('btn-get-location');
const btnShareCoords = document.getElementById('btn-share-coords');

function getGPSLocation() {
  if (!gpsDisplay || !btnGetLocation) return;

  btnGetLocation.disabled = true;
  gpsDisplay.textContent = '🛰️ Memindai satelit GPS...';
  if (gpsTimestamp) gpsTimestamp.textContent = '';

  if (!('geolocation' in navigator)) {
    gpsDisplay.textContent = '❌ GPS tidak didukung di perangkat ini.';
    btnGetLocation.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      const acc = Math.round(position.coords.accuracy);
      const time = new Date().toLocaleTimeString('id-ID');

      gpsDisplay.textContent = `Lat: ${lat}, Lon: ${lon} (±${acc}m)`;
      if (gpsTimestamp) gpsTimestamp.textContent = `⏱️ Diperbarui: ${time}`;
      btnGetLocation.disabled = false;
    },
    () => {
      gpsDisplay.textContent = '⚠️ Gagal membaca GPS. Pastikan izin lokasi aktif.';
      btnGetLocation.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
  );
}

if (btnGetLocation) {
  btnGetLocation.addEventListener('click', getGPSLocation);
}

// Salin Data Alamat & GPS
if (btnShareCoords) {
  btnShareCoords.addEventListener('click', () => {
    const address = displayAddress ? displayAddress.textContent : '';
    const gps = gpsDisplay ? gpsDisplay.textContent : '';
    const fullData = `[DARURAT BENCANA SIAGAOFFLINE]\nAlamat: ${address}\nKoordinat GPS: ${gps}`;

    navigator.clipboard.writeText(fullData)
      .then(() => alert('Berhasil menyalin Alamat & Koordinat GPS!'))
      .catch(() => alert('Gagal menyalin data.'));
  });
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Aktif:', reg.scope))
      .catch(err => console.error('Gagal SW:', err));
  });
}
