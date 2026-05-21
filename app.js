const lengthInput = document.getElementById('length');
const includeNumbersInput = document.getElementById('include-numbers');
const includeSymbolsInput = document.getElementById('include-symbols');
const generateButton = document.querySelector('.generate-button');
const passwordOutput = document.getElementById('password-output');
const statusMessage = document.getElementById('status-message');
const copyButton = document.querySelector('.copy-button');

const API_URL = 'https://api.api-ninjas.com/v1/passwordgenerator';
const API_KEY = '7jOopObxQQGIN7DfjwRDJA==ZFqrj6BH8ydPMYRW';

function mostrarMensaje(mensaje, esError = false) {
  statusMessage.textContent = mensaje;
  statusMessage.style.color = esError ? '#fca5a5' : '#e2e8f0';
}

function limpiarMensaje() {
  statusMessage.textContent = '';
}

async function generarContrasena() {
  const length = Number(lengthInput.value) || 16;
  const includeNumbers = includeNumbersInput.checked;
  const includeSymbols = includeSymbolsInput.checked;

  const queryParams = new URLSearchParams({
    length: String(length),
    uppercase: 'true',
    lowercase: 'true',
    numbers: includeNumbers ? 'true' : 'false',
    special: includeSymbols ? 'true' : 'false',
  });

  const url = `${API_URL}?${queryParams.toString()}`;

  generateButton.disabled = true;
  generateButton.textContent = 'Generando...';

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la API: ${response.status} ${response.statusText} ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error('Respuesta inesperada de la API: ' + text.substring(0, 200));
    }

    const generated = data.random_password || data.password || data.result;
    if (!generated) {
      throw new Error('La API no devolvió una contraseña válida.');
    }

    if (!validarContrasena(generated, includeNumbers, includeSymbols, length)) {
      throw new Error('La API devolvió una contraseña que no cumple las opciones seleccionadas.');
    }

    passwordOutput.style.color = '#e2e8f0';
    passwordOutput.value = generated;
    mostrarMensaje('Contraseña generada por la API.');
  } catch (error) {
    console.error('API error:', error.message || error);
    try {
      const fallback = generarLocal(length, includeNumbers, includeSymbols);
      passwordOutput.style.color = '#fef3c7';
      passwordOutput.value = fallback;
      mostrarMensaje('Contraseña generada localmente para respetar las opciones seleccionadas.');
    } catch (e) {
      mostrarMensaje('No se pudo generar la contraseña. Revisa tu conexión o intenta más tarde.', true);
    }
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = 'Generar Contraseña';
  }
}

function validarContrasena(password, includeNumbers, includeSymbols, expectedLength) {
  if (password.length !== expectedLength) return false;

  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);

  if (includeNumbers && !hasNumber) return false;
  if (!includeNumbers && hasNumber) return false;
  if (includeSymbols && !hasSymbol) return false;
  if (!includeSymbols && hasSymbol) return false;

  return true;
}

function copiarAlPortapapeles() {
  const contraseña = passwordOutput.value.trim();
  if (!contraseña || contraseña.startsWith('Se usó') || contraseña.startsWith('No se pudo')) {
    mostrarMensaje('No hay contraseña válida para copiar.', true);
    return;
  }
  if (!contraseña) {
    mostrarMensaje('No hay contraseña para copiar.', true);
    return;
  }

  navigator.clipboard
    .writeText(contraseña)
    .then(() => {
      mostrarMensaje('Contraseña copiada al portapapeles.');
    })
    .catch((error) => {
      console.error(error);
      mostrarMensaje('No se pudo copiar. Intenta manualmente.', true);
    });
}

generateButton.addEventListener('click', generarContrasena);
copyButton.addEventListener('click', copiarAlPortapapeles);

// Generador local (fallback) — seguro y sin dependencias
function generarLocal(length, useNumbers, useSymbols) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = lower + upper;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  if (!chars.length) throw new Error('No hay caracteres disponibles para generar.');

  let out = '';
  const cryptoObj = window.crypto || window.msCrypto;
  for (let i = 0; i < length; i++) {
    if (cryptoObj && cryptoObj.getRandomValues) {
      const array = new Uint32Array(1);
      cryptoObj.getRandomValues(array);
      out += chars.charAt(array[0] % chars.length);
    } else {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return out;
}
