const lengthInput       = document.getElementById('length');
const includeNumbersInput = document.getElementById('include-numbers');
const includeSymbolsInput = document.getElementById('include-symbols');
const generateButton    = document.getElementById('generate-button');
const passwordOutput    = document.getElementById('password-output');
const statusMessage     = document.getElementById('status-message');
const copyButton        = document.getElementById('copy-button');

const API_URL = 'https://api.api-ninjas.com/v1/passwordgenerator';
const API_KEY = '7jOopObxQQGIN7DfjwRDJA==ZFqrj6BH8ydPMYRW';

function mostrarMensaje(mensaje, tipo = 'info') {
  // tipo: 'info' | 'success' | 'error' | 'warning'
  statusMessage.textContent = mensaje;
  statusMessage.dataset.tipo = tipo;
}

function limpiarMensaje() {
  statusMessage.textContent = '';
}

async function generarContrasena() {
  const rawLength = Number(lengthInput.value);

  // --- Validación de longitud ---
  if (!rawLength || rawLength < 4 || rawLength > 32) {
    mostrarMensaje('La longitud debe estar entre 4 y 32 caracteres.', 'error');
    lengthInput.focus();
    return;
  }

  const length       = rawLength;
  const includeNumbers = includeNumbersInput.checked;
  const includeSymbols = includeSymbolsInput.checked;

  limpiarMensaje();
  copyButton.disabled = true;
  generateButton.disabled = true;
  generateButton.textContent = 'Generando…';

  const queryParams = new URLSearchParams({
    length: String(length),
    uppercase: 'true',
    lowercase: 'true',
    numbers: includeNumbers ? 'true' : 'false',
    special: includeSymbols ? 'true' : 'false',
  });

  const url = `${API_URL}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
        Accept: 'application/json',
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

        let generated = data.random_password || data.password || data.result;
    if (!generated) {
      throw new Error('La API no devolvió una contraseña válida.');
    }

    generated = limpiarSegunOpciones(generated, includeNumbers, includeSymbols);
    generated = ajustarLongitudConFallback(generated, length, includeNumbers, includeSymbols);

    if (!cumpleCriterios(generated, includeNumbers, includeSymbols)) {
      generated = generarLocal(length, includeNumbers, includeSymbols);
      passwordOutput.dataset.source = 'local';
      mostrarMensaje('⚠️ La API no incluyó todos los tipos requeridos — contraseña completada localmente.', 'warning');
    } else {
      passwordOutput.dataset.source = 'api';
      mostrarMensaje('✅ Contraseña generada correctamente.', 'success');
    }
    passwordOutput.value = generated;
    copyButton.disabled = false;
  } catch (error) {
    console.error('API error:', error.message || error);
    try {
      const fallback = generarLocal(length, includeNumbers, includeSymbols);
      passwordOutput.dataset.source = 'local';
      passwordOutput.value = fallback;
      copyButton.disabled = false;
      mostrarMensaje('⚠️ Sin conexión a la API — contraseña generada localmente.', 'warning');
    } catch (e) {
      mostrarMensaje('❌ No se pudo generar la contraseña. Revisa tu conexión e inténtalo de nuevo.', 'error');
    }
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = 'Generar Contraseña';
  }
}

function limpiarSegunOpciones(password, includeNumbers, includeSymbols) {
  let cleaned = password;

  if (!includeNumbers) {
    cleaned = cleaned.replace(/[0-9]/g, '');
  }

  if (!includeSymbols) {
    cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, '');
  }

  return cleaned;
}

function ajustarLongitudConFallback(password, targetLength, includeNumbers, includeSymbols) {
  let adjusted = password;

  if (adjusted.length > targetLength) {
    adjusted = adjusted.slice(0, targetLength);
  }

  if (adjusted.length < targetLength) {
    const missing = targetLength - adjusted.length;
    const filler = generarLocal(missing, includeNumbers, includeSymbols);
    adjusted += filler;
  }

  return adjusted;
}

function copiarAlPortapapeles() {
  const contrasena = passwordOutput.value.trim();
  if (!contrasena) {
    mostrarMensaje('No hay contraseña para copiar.', 'error');
    return;
  }

  navigator.clipboard
    .writeText(contrasena)
    .then(() => {
      // --- Feedback visual directo en el botón ---
      const textoOriginal = copyButton.textContent;
      copyButton.textContent = '¡Copiado!';
      copyButton.classList.add('copy-button--success');
      mostrarMensaje('📋 Contraseña copiada al portapapeles.', 'success');

      setTimeout(() => {
        copyButton.textContent = textoOriginal;
        copyButton.classList.remove('copy-button--success');
      }, 2000);
    })
    .catch((err) => {
      console.error('Clipboard error:', err);
      // Fallback para navegadores sin permisos de portapapeles
      try {
        passwordOutput.select();
        document.execCommand('copy');
        copyButton.textContent = '¡Copiado!';
        copyButton.classList.add('copy-button--success');
        mostrarMensaje('📋 Contraseña copiada al portapapeles.', 'success');
        setTimeout(() => {
          copyButton.textContent = 'Copiar';
          copyButton.classList.remove('copy-button--success');
        }, 2000);
      } catch (_) {
        mostrarMensaje('❌ No se pudo copiar. Selécciala manualmente.', 'error');
      }
    });
}

generateButton.addEventListener('click', generarContrasena);
copyButton.addEventListener('click', copiarAlPortapapeles);

function cumpleCriterios(password, includeNumbers, includeSymbols) {
  if (includeNumbers && !/[0-9]/.test(password)) return false;
  if (includeSymbols && !/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
}

function generarLocal(length, useNumbers, useSymbols) {
  const lower   = 'abcdefghijklmnopqrstuvwxyz';
  const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = lower + upper;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  if (!chars.length) {
    throw new Error('No hay caracteres disponibles para generar.');
  }

  const cryptoObj = window.crypto || window.msCrypto;

  function randomChar(pool) {
    if (cryptoObj && cryptoObj.getRandomValues) {
      const array = new Uint32Array(1);
      cryptoObj.getRandomValues(array);
      return pool.charAt(array[0] % pool.length);
    }
    return pool.charAt(Math.floor(Math.random() * pool.length));
  }

  // Garantizar al menos un carácter de cada tipo requerido
  const mandatory = [randomChar(lower + upper)];
  if (useNumbers) mandatory.push(randomChar(numbers));
  if (useSymbols) mandatory.push(randomChar(symbols));

  const out = [...mandatory];
  while (out.length < length) {
    out.push(randomChar(chars));
  }

  // Mezclar (Fisher-Yates) para que los obligatorios no queden al inicio
  for (let i = out.length - 1; i > 0; i--) {
    let j;
    if (cryptoObj && cryptoObj.getRandomValues) {
      const array = new Uint32Array(1);
      cryptoObj.getRandomValues(array);
      j = array[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out.join('');
}
