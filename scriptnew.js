
let loadedWallets = [];
let currentKeys = null;
let currentSeedPhrase = null;

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

function generateKeys() {
  const privateKey = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
  const address = 'pi1' + privateKey.substring(0, 39);
  currentKeys = { privateKey, address };
  document.getElementById('keyStatus').textContent = 'Generated';
  document.getElementById('walletAddress').textContent = address;
  document.getElementById('privateKeyDisplay').textContent = privateKey;
  const qrContainer = document.getElementById('qrCode');
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, { text: address, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.H });
  document.getElementById('keyDisplay').style.display = 'block';
}

function clearKeys() {
  if (confirm('Are you sure you want to clear all keys? This cannot be undone!')) {
    currentKeys = null;
    document.getElementById('keyStatus').textContent = 'Not Generated';
    document.getElementById('keyDisplay').style.display = 'none';
    document.getElementById('qrCode').innerHTML = "";
  }
}

function generateSeedPhrase() {
  const words = ['abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse','access','accident'];
  const seedWords = [];
  for (let i = 0; i < 12; i++) seedWords.push(words[Math.floor(Math.random() * words.length)]);
  currentSeedPhrase = seedWords.join(' ');
  document.getElementById('seedPhraseDisplay').textContent = currentSeedPhrase;
}

function downloadBackup() {
  if (!currentKeys || !currentSeedPhrase) {
    alert('Please generate keys and seed phrase first');
    return;
  }
  const backup = {
    timestamp: new Date().toISOString(),
    address: currentKeys.address,
    seedPhrase: currentSeedPhrase,
    version: '2.1'
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wallet-backup-' + Date.now() + '.json';
  a.click();
  URL.revokeObjectURL(url);
}
<!--1final-->
<!--2principio-->
function loadWallets() {
  const fileInput = document.getElementById('walletFiles');
  const files = fileInput.files;
  if (files.length === 0) {
    alert('Please select wallet JSON files');
    return;
  }
  loadedWallets = [];
  const walletDisplay = document.getElementById('walletDisplay');
  walletDisplay.innerHTML = '';
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const wallet = JSON.parse(e.target.result);
        loadedWallets.push(wallet);
        displayWallet(wallet);
        updateBalance();
      } catch (error) {
        console.error('Error parsing wallet file:', file.name, error);
      }
    };
    reader.readAsText(file);
  });
}

function displayWallet(wallet) {
  const walletDisplay = document.getElementById('walletDisplay');
  const walletCard = document.createElement('div');
  walletCard.className = 'wallet-card';

  const isSigned = wallet.signature && wallet.signature.startsWith("sig_");
  const buttonColor = isSigned ? "green" : "red";
  const buttonText = isSigned ? "🔁 Devolver Imagen Minteada" : "🔒 Firma requerida para devolver";
  const buttonDisabled = isSigned ? "" : "disabled";

  walletCard.innerHTML = `
    <h3>${wallet.name || 'Unknown'}</h3>
    <p><strong>Value:</strong> <span class="value">${wallet.value || 0}π</span></p>
    <p><strong>Date:</strong> ${wallet.date || 'Unknown'}</p>
    <p><strong>Network:</strong> ${wallet.network || 'Unknown'}</p>
    <p><strong>Image URL:</strong></p>
    <div class="url">${wallet.imageURL || 'No URL'}</div>
    <button class="button" onclick="downloadImage('${wallet.imageURL}', '${wallet.name}')">Download Image</button>
    <button class="button" onclick="copyURL('${wallet.imageURL}')">Copy URL</button>
    <button class="button" onclick="signWallet('${wallet.id}')">Sign Wallet</button>
    <button class="button" style="background-color: ${buttonColor};" ${buttonDisabled}
      onclick="unmintWallet('${wallet.id}', '${wallet.imageURL}', ${wallet.value})">
      ${buttonText}
    </button>
  `;
  walletDisplay.appendChild(walletCard);
}

function updateBalance() {
  const total = loadedWallets.reduce((sum, wallet) => sum + (wallet.value || 0), 0);
  document.getElementById('balanceDisplay').textContent = total.toFixed(2) + 'π';
}
<!--2final-->
<!--3principio-->
function downloadImage(url, filename) {
  if (!url) {
    alert('No URL available for this image');
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'pi-coin-image';
  a.target = '_blank';
  a.click();
}

function copyURL(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert('URL copied to clipboard!');
  });
}

function signWallet(walletId) {
  if (!currentKeys) {
    alert('Please generate keys first in the Security tab');
    return;
  }
  const signature = 'sig_' + Math.random().toString(36).substring(2, 15);
  alert('Wallet signed with signature: ' + signature);
  const wallet = loadedWallets.find(w => w.id === walletId);
  if (wallet) {
    wallet.signature = signature;
    displayWallet(wallet);
    updateBalance();
  }
}

function unmintWallet(walletId, imageURL, amount) {
  if (!currentKeys) {
    alert("Please generate keys first in the Security tab.");
    return;
  }

  const transaction = {
    action: "unmint",
    walletId: walletId,
    imageURL: imageURL,
    from: currentKeys.address,
    amount: amount,
    timestamp: new Date().toISOString(),
    signature: "sig_" + Math.random().toString(36).substring(2, 15)
  };

  alert("✅ Imagen marcada para devolución. Transacción registrada en el historial.");

  loadedWallets = loadedWallets.filter(w => w.id !== walletId);
  document.getElementById('walletDisplay').innerHTML = '';
  loadedWallets.forEach(displayWallet);
  updateBalance();

  const logEntry = document.createElement('div');
  logEntry.className = 'transaction-entry';

  const text = `✅ ${amount}π devueltos por imagen ${walletId} el ${new Date().toLocaleString()} | Dirección: ${transaction.from} | Firma: ${transaction.signature}`;

  logEntry.innerHTML = `
    <span>${text} 💾</span>
    <button onclick="borrarEntrada(this)">🗑️</button>
    <button onclick="descargarEntrada('${text}')">💾</button>
  `;

  document.getElementById('transactionLog').appendChild(logEntry);
}

function borrarEntrada(button) {
  const entry = button.parentElement;
  entry.remove();
}

function descargarEntrada(texto) {
  const blob = new Blob([texto], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "transaccion-" + Date.now() + ".txt";
  a.click();
  URL.revokeObjectURL(a.href);
}
<!--3final-->
<!--4principio-->
function loadTransaction() {
  const fileInput = document.getElementById('transactionFile');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a transaction file');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const transaction = JSON.parse(e.target.result);
      displayTransaction(transaction);
    } catch (error) {
      alert('Error parsing transaction file');
    }
  };
  reader.readAsText(file);
}

function displayTransaction(transaction) {
  const display = document.getElementById('transactionDisplay');
  display.innerHTML = `
    <div class="wallet-card">
      <h3>Transaction Details</h3>
      <p><strong>To:</strong> ${transaction.to || 'Unknown'}</p>
      <p><strong>Amount:</strong> ${transaction.amount || 0}π</p>
      <p><strong>Fee:</strong> ${transaction.fee || 0}π</p>
      <button class="button" onclick="signTransaction()">Sign Transaction</button>
      <button class="button" onclick="rejectTransaction()">Reject</button>
    </div>
  `;
}

function signTransaction() {
  if (!currentKeys) {
    alert('Please generate keys first');
    return;
  }
  alert('Transaction signed successfully!');
}

function rejectTransaction() {
  document.getElementById('transactionDisplay').innerHTML = '';
  alert('Transaction rejected');
}

window.onload = function() {
  console.log('USB-2C-WALLET Professional Interface Loaded');
};

function guardarHistorialEnUSB() {
  const entries = document.querySelectorAll('.transaction-entry');
  if (entries.length === 0) {
    alert("No hay transacciones para guardar.");
    return;
  }

  const transacciones = Array.from(entries).map(entry => ({
    texto: entry.textContent.trim()
  }));

  fetch('http://localhost:3001/guardar-historial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transacciones })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      alert(data.mensaje);
    } else {
      alert('Error al guardar el historial.');
    }
  })
  .catch(err => {
    console.error('Error al conectar con el backend:', err);
    alert('No se pudo guardar el historial en el USB.');
  });
}
function guardarHistorialEnUSB() {
  const entries = document.querySelectorAll('.transaction-entry');
  if (entries.length === 0) {
    alert("No hay transacciones para guardar.");
    return;
  }

  const transacciones = Array.from(entries).map(entry => ({
    texto: entry.textContent.trim()
  }));

  fetch('http://localhost:3001/api/guardar-historial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transacciones })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      alert(data.mensaje);
    } else {
      alert('Error al guardar el historial.');
    }
  })
  .catch(err => {
    console.error('Error al conectar con el backend:', err);
    alert('No se pudo guardar el historial en el USB.');
  });
}


function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');

  document.querySelectorAll(
    '.wallet-card, .container, .transaction-entry, .button'
  ).forEach(el => el.classList.toggle('dark-mode'));
}

function sincronizarConPiNet() {
  fetch('http://localhost:3001/api/generar-payload')
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById('resultadoSync').textContent = data.error;
      } else {
        document.getElementById('resultadoSync').textContent = JSON.stringify(data, null, 2);
      }
    })
    .catch(err => {
      document.getElementById('resultadoSync').textContent = '❌ Error al conectar con el backend';
      console.error(err);
    });
}

function enviarPayloadAPiNet() {
  fetch('http://localhost:3001/api/generar-payload')
    .then(res => res.json())
    .then(data => {
      return fetch('http://localhost:3001/api/validar-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    })
    .then(res => res.json())
    .then(validacion => {
      document.getElementById('resultadoSync').textContent = JSON.stringify(validacion, null, 2);
    })
    .catch(err => {
      document.getElementById('resultadoSync').textContent = '❌ Error al validar con PiNet';
      console.error(err);
    });
}



function guardarValidacion(payload, signature, resultado) {
  fetch('http://localhost:3001/api/guardar-validacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, signature, resultado })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data.mensaje);
    document.getElementById('resultadoSync').textContent += '\n\n📝 ' + data.mensaje;
  })
  .catch(err => {
    console.error('❌ Error al guardar la validación:', err);
    document.getElementById('resultadoSync').textContent += '\n\n❌ Error al guardar la validación.';
  });
}


function mostrarPerfil() {
  fetch('http://localhost:3001/api/perfil-usuario')
    .then(res => res.json())
    .then(perfil => {
      const contenedor = document.getElementById('perfilUsuario');
      contenedor.innerHTML = `
        <h3>👤 Perfil de Usuario</h3>
        <p><strong>Nombre:</strong> ${perfil.nombre}</p>
        <p><strong>Email:</strong> ${perfil.email}</p>
        <p><strong>ID:</strong> ${perfil.userId}</p>
        <p><strong>Red:</strong> ${perfil.network}</p>
      `;
    })
    .catch(err => {
      console.error('❌ Error al cargar perfil:', err);
      document.getElementById('perfilUsuario').innerHTML = '<p>Error al cargar perfil.</p>';
    });
}





function mostrarAppSettings() {
  fetch('http://localhost:3001/api/app-settings')
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById('appSettingsInfo');
      contenedor.innerHTML = `
        <h3>⚙️ Configuración de la App</h3>
        <p><strong>Nombre:</strong> ${data.appName}</p>
        <p><strong>Versión:</strong> ${data.version}</p>
        <p><strong>Base URL:</strong> <a href="${data.baseURL}" target="_blank">${data.baseURL}</a></p>
        <h4>🎨 Tema</h4>
        <ul>
          <li>Primario: ${data.theme.primaryColor}</li>
          <li>Secundario: ${data.theme.secondaryColor}</li>
          <li>Acento: ${data.theme.accentColor}</li>
        </ul>
        <h4>🧩 Funciones activas</h4>
        <ul>
          ${Object.entries(data.features).map(([key, val]) => `<li>${key}: ${val ? '✅' : '❌'}</li>`).join('')}
        </ul>
        <h4>🔐 Seguridad</h4>
        <ul>
          <li>Encriptación: ${data.security.encryptionEnabled ? '✅' : '❌'}</li>
          <li>Backups: ${data.security.backupEnabled ? '✅' : '❌'}</li>
        </ul>
        <h4>🖥️ Interfaz</h4>
        <ul>
          <li>Mensaje de bienvenida: ${data.ui.showWelcomeMessage ? '✅' : '❌'}</li>
          <li>Modo compacto: ${data.ui.compactMode ? '✅' : '❌'}</li>
          <li>Tooltips: ${data.ui.showTooltips ? '✅' : '❌'}</li>
        </ul>
      `;
    })
    .catch(err => {
      console.error('❌ Error al cargar configuración:', err);
      document.getElementById('appSettingsInfo').innerHTML = '<p>Error al cargar configuración de la app.</p>';
    });
}
