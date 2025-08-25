// Estado inicial del USB
let usbConnected = false;

// Función para alternar el estado del USB
function toggleUsbStatus() {
  usbConnected = !usbConnected;
  const usbStatus = usbConnected ? 'connected' : 'disconnected';

  // Actualizar el estado del USB en la interfaz
  document.getElementById('usb-status').textContent = `Estado del USB: ${usbStatus}`;
  const usbImage = document.getElementById('usb-image');
  usbImage.src = usbConnected ? 'usb-connected.png' : 'usb-disconnected.png';

  // Actualizar el balance o deshabilitarlo
  if (usbConnected) {
    fetchWalletBalance();
    enableTransferButton();
  } else {
    document.getElementById('wallet-balance').textContent = 'Balance: 0';
    disableTransferButton();
  }
}

// Función para habilitar el botón de transferencia
function enableTransferButton() {
  document.getElementById('transfer-pi').disabled = false;
}

// Función para deshabilitar el botón de transferencia
function disableTransferButton() {
  document.getElementById('transfer-pi').disabled = true;
}

// Función para obtener el balance de la wallet
async function fetchWalletBalance() {
  try {
    const response = await fetch('http://localhost:3001/api/wallet-balance');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    document.getElementById('wallet-balance').textContent = `Balance: ${data.balance} PI`;
  } catch (error) {
    console.error('Error al obtener el balance de la wallet:', error);
    document.getElementById('wallet-balance').textContent = 'Balance: Error';
  }
}

// Función para manejar la transferencia de PI
document.getElementById('transfer-pi').addEventListener('click', async () => {
  if (!usbConnected) {
    alert('Conecta el USB antes de realizar una transferencia.');
    return;
  }

  const recipientWallet = document.getElementById('recipient-wallet').value;
  const amount = document.getElementById('transfer-amount').value;

  if (!recipientWallet) {
    alert('Por favor, ingresa la dirección de la wallet del destinatario.');
    return;
  }

  if (!amount || amount <= 0) {
    alert('Por favor, ingresa una cantidad válida para transferir.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipientWallet, amount }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Transferencia exitosa: ${data.message}`);
    } else {
      alert(`Error en la transferencia: ${data.message}`);
    }
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    alert('Hubo un problema al procesar la transferencia.');
  }
});

// Función para cargar wallets desde archivos JSON
document.getElementById('load-wallets').addEventListener('click', () => {
  const walletFilesInput = document.getElementById('walletFiles');
  const walletDisplay = document.getElementById('walletDisplay');

  // Limpiar el contenido previo
  walletDisplay.innerHTML = '';

  // Verificar si se seleccionaron archivos
  if (walletFilesInput.files.length === 0) {
    alert('Por favor, selecciona al menos un archivo JSON.');
    return;
  }

  // Iterar sobre los archivos seleccionados
  Array.from(walletFilesInput.files).forEach((file) => {
    const reader = new FileReader();

    // Leer el contenido del archivo
    reader.onload = function (event) {
      try {
        const walletData = JSON.parse(event.target.result);

        // Corregir la ruta de la imagen si es necesario
        let correctedGalleryPath = walletData.galleryPath;
        if (correctedGalleryPath && correctedGalleryPath.startsWith('/user/gallery/')) {
          correctedGalleryPath = correctedGalleryPath.replace('/user/gallery/', '/gallery/user/');
        }

        // Construir la ruta completa de la imagen
        const imagePath = correctedGalleryPath
          ? `E:/frontend/public${correctedGalleryPath}`
          : null;

        // Crear un elemento para mostrar los datos del wallet
        const walletCard = document.createElement('div');
        walletCard.className = 'wallet-card';
        walletCard.innerHTML = `
          <h3>Wallet: ${walletData.name || 'Sin nombre'}</h3>
          <p><strong>ID:</strong> ${walletData.id || 'No disponible'}</p>
          <p><strong>Balance:</strong> ${walletData.value || 0} </p>
          <p><strong>Fecha:</strong> ${walletData.date || 'No disponible'}</p>
          <div>
            <strong>Imagen:</strong>
            ${imagePath ? `<img src="${imagePath}" alt="Wallet Image" style="max-width: 100px; max-height: 100px;">` : 'No disponible'}
          </div>
        `;

        walletDisplay.appendChild(walletCard);
      } catch (error) {
        console.error('Error al leer el archivo JSON:', error);
        alert(`El archivo ${file.name} no es un JSON válido.`);
      }
    };

    reader.readAsText(file);
  });
});

// Asignar eventos a los botones
document.getElementById('toggle-usb').addEventListener('click', toggleUsbStatus);
