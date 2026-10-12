function generarMatriz() {
  const n = parseInt(document.getElementById('dimension').value);
  const container = document.getElementById('matrixContainer');
  container.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const row = document.createElement('div');
    row.className = 'matrix-row';

    for (let j = 0; j < n; j++) {
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = 'matrix-input';
      input.id = `a_${i}_${j}`;
      input.placeholder = `x${j+1}`;
      row.appendChild(input);
    }

    const equals = document.createElement('span');
    equals.className = 'equals';
    equals.innerText = '=';
    row.appendChild(equals);

    const bInput = document.createElement('input');
    bInput.type = 'number';
    bInput.step = 'any';
    bInput.className = 'matrix-input';
    bInput.style.backgroundColor = '#FFF8E1';
    bInput.id = `b_${i}`;
    bInput.placeholder = `b${i+1}`;
    row.appendChild(bInput);

    container.appendChild(row);
  }
}

function calcularDeterminante(matriz) {
  const n = matriz.length;
  if (n === 1) return matriz[0][0];
  if (n === 2) return matriz[0][0] * matriz[1][1] - matriz[0][1] * matriz[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    const subMatriz = matriz.slice(1).map(row => row.filter((_, colIndex) => colIndex !== j));
    det += Math.pow(-1, j) * matriz[0][j] * calcularDeterminante(subMatriz);
  }
  return det;
}

function resolverCramer() {
  const n = parseInt(document.getElementById('dimension').value);
  let A = [];
  let B = [];

  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j < n; j++) {
      const val = parseFloat(document.getElementById(`a_${i}_${j}`).value);
      A[i][j] = isNaN(val) ? 0 : val;
    }
    const valB = parseFloat(document.getElementById(`b_${i}`).value);
    B[i] = isNaN(valB) ? 0 : valB;
  }

  const detA = calcularDeterminante(A);
  const resultadosDiv = document.getElementById('resultados');
  const pasosDiv = document.getElementById('pasos');
  
  resultadosDiv.style.display = 'block';
  pasosDiv.innerHTML = `<div class="step"><strong>Determinante Principal (det A):</strong> ${detA}</div>`;

  if (detA === 0) {
    pasosDiv.innerHTML += `<div class="step" style="color:var(--primary-red);"><strong>El sistema no tiene solución única (det A = 0).</strong></div>`;
    return;
  }

  for (let j = 0; j < n; j++) {
    let Aj = A.map((row, rowIndex) => 
      row.map((val, colIndex) => colIndex === j ? B[rowIndex] : val)
    );

    let detAj = calcularDeterminante(Aj);
    let xj = detAj / detA;

    pasosDiv.innerHTML += `
      <div class="step">
        <strong>det(A_${j+1}):</strong> ${detAj} &nbsp;|&nbsp; 
        <strong>x_${j+1}:</strong> ${detAj} / ${detA} = <strong>${xj.toFixed(4)}</strong>
      </div>
    `;
  }
}

// Inicializar la matriz 3x3 al cargar
window.onload = generarMatriz;