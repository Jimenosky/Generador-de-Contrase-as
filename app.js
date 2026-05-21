const lengthInput = document.getElementById('length');
const includeNumbersInput = document.getElementById('include-numbers');
const includeSymbolsInput = document.getElementById('include-symbols');
const generateButton = document.querySelector('.generate-button');
const passwordOutput = document.getElementById('password-output');
const copyButton = document.querySelector('.copy-button');

const API_URL = 'https://api-ninjas.com/api/passwordgenerator';
const API_KEY = '7j0opObxQQGIN7DfjwRDJA==ZFqrj6BH8ydPMYRW';

function mostrarMensaje(mensaje, esError = false) {
  passwordOutput.value = mensaje;
  passwordOutput.style.color = esError ? '#fca5a5' : '#e2e8f0';
}

async function generarContrasena() {
  const length = Number(lengthInput.value) || 16;
  const includeNumbers = includeNumbersInput.checked;
  const includeSymbols = includeSymbolsInput.checked;

  const queryParams = new URLSearchParams({
    length: String(length),
    numbers: String(includeNumbers),
    special: String(includeSymbols),
  });

  const url = `${API_URL}?${queryParams.toString()}`;

  generateButton.disabled = true;
  generateButton.textContent = 'Generando...';

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la API: ${response.status} ${response.statusText} ${errorText}`);
    }

    const data = await response.json();
    if (!data.password) {
      throw new Error('La API no devolvió una contraseña válida.');
    }

    passwordOutput.style.color = '#e2e8f0';
    passwordOutput.value = data.password;
  } catch (error) {
    console.error(error);
    mostrarMensaje('No se pudo generar la contraseña. Revisa tu conexión o intenta más tarde.', true);
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = 'Generar Contraseña';
  }
}

function copiarAlPortapapeles() {
  const contraseña = passwordOutput.value.trim();
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
