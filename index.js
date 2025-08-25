const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));




app.listen(PORT, () => {
  console.log(`Frontend escuchando en el puerto ${PORT}`);
});
function enviarPayloadAPiNet() {
  fetch('http://localhost:3001/api/generar-payload')
    .then(res => res.json())
    .then(data => {
      return fetch('https://usbcwallet4654.pinet.com/api/validar-payload', {
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
  })
  .catch(err => {
    console.error('❌ Error al guardar la validación:', err);
  });
}



function enviarPayloadAPiNet() {
  fetch('http://localhost:3001/api/generar-payload')
    .then(res => res.json())
    .then(data => {
      // Validar el payload con PiNet (simulado en backend local)
      return fetch('http://localhost:3001/api/validar-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
        .then(validacion => {
          // Mostrar resultado en pantalla
          document.getElementById('resultadoSync').textContent = JSON.stringify(validacion, null, 2);

          // Guardar la validación como respaldo en el USB
          guardarValidacion(data.payload, data.signature, validacion);
        });
    })
    .catch(err => {
      document.getElementById('resultadoSync').textContent = '❌ Error al validar con PiNet';
      console.error(err);
    });
}





let payloadData = null;

function enviarPayloadAPiNet() {
  fetch('http://localhost:3001/api/generar-payload')
    .then(res => res.json())
    .then(data => {
      payloadData = data;
      return fetch('http://localhost:3001/api/validar-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    })
    .then(res => res.json())
    .then(validacion => {
      document.getElementById('resultadoSync').textContent = JSON.stringify(validacion, null, 2);
      guardarValidacion(payloadData.payload, payloadData.signature, validacion);
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




