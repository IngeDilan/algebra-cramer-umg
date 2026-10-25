// CLASE PARA OPERACIONES CON FRACCIONES EXACTAS
class Fraccion {
  constructor(numerador, denominador = 1) {
    if (denominador === 0) {
      throw new Error("División por cero");
    }
    let mcd = Fraccion.calcularMCD(Math.abs(numerador), Math.abs(denominador));
    let signo = (numerador * denominador < 0) ? -1 : 1;
    this.num = signo * Math.abs(numerador) / mcd;
    this.den = Math.abs(denominador) / mcd;
  }

  static calcularMCD(a, b) {
    return b === 0 ? a : Fraccion.calcularMCD(b, a % b);
  }

  static parse(val) {
    if (typeof val === 'number') return new Fraccion(val);
    let str = val.toString().trim();
    if (str.includes('/')) {
      let partes = str.split('/');
      let n = parseFloat(partes[0]);
      let d = parseFloat(partes[1]);
      if (isNaN(n) || isNaN(d)) return new Fraccion(0);
      return new Fraccion(n, d);
    }
    let num = parseFloat(str);
    if (isNaN(num)) return new Fraccion(0);
    // Convertir decimal a fracción aproximada
    if (Number.isInteger(num)) return new Fraccion(num, 1);
    let len = str.split('.')[1]?.length || 0;
    let den = Math.pow(10, len);
    return new Fraccion(Math.round(num * den), den);
  }

  sumar(f) {
    return new Fraccion(this.num * f.den + f.num * this.den, this.den * f.den);
  }

  restar(f) {
    return new Fraccion(this.num * f.den - f.num * this.den, this.den * f.den);
  }

  multiplicar(f) {
    return new Fraccion(this.num * f.num, this.den * f.den);
  }

  dividir(f) {
    return new Fraccion(this.num * f.den, this.den * f.num);
  }

  toString() {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  toDecimal(pasos = 4) {
    return (this.num / this.den).toFixed(pasos);
  }

  esCero() {
    return this.num === 0;
  }
}

// INICIALIZACIÓN DE LA MATRIZ 3x3 EN PANTALLA
function generarMatriz3x3() {
  const container = document.getElementById('matrixContainer');
  container.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const row = document.createElement('div');
    row.className = 'matrix-row';

    for (let j = 0; j < 3; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'matrix-input';
      input.id = `a_${i}_${j}`;
      input.placeholder = `a${i+1}${j+1}`;
      row.appendChild(input);
    }

    const equals = document.createElement('span');
    equals.className = 'equals';
    equals.innerText = '=';
    row.appendChild(equals);

    const bInput = document.createElement('input');
    bInput.type = 'text';
    bInput.className = 'matrix-input';
    bInput.style.backgroundColor = '#FFF8E1';
    bInput.id = `b_${i}`;
    bInput.placeholder = `b${i+1}`;
    row.appendChild(bInput);

    container.appendChild(row);
  }
}

// CÁLCULO DE DETERMINANTE 3x3 CON EXPANSION POR LAPLACE (PASO A PASO)
function obtenerDet3x3ConPasos(M) {
  // M es matriz 3x3 de Fracciones
  let c11 = M[1][1].multiplicar(M[2][2]).restar(M[1][2].multiplicar(M[2][1]));
  let c12 = M[1][0].multiplicar(M[2][2]).restar(M[1][2].multiplicar(M[2][0]));
  let c13 = M[1][0].multiplicar(M[2][1]).restar(M[1][1].multiplicar(M[2][0]));

  let t1 = M[0][0].multiplicar(c11);
  let t2 = M[0][1].multiplicar(c12);
  let t3 = M[0][2].multiplicar(c13);

  let det = t1.restar(t2).sumar(t3);

  let explicacion = `  (${M[0][0]})·[(${M[1][1]})(${M[2][2]}) - (${M[1][2]})(${M[2][1]})]\n` +
                    `- (${M[0][1]})·[(${M[1][0]})(${M[2][2]}) - (${M[1][2]})(${M[2][0]})]\n` +
                    `+ (${M[0][2]})·[(${M[1][0]})(${M[2][1]}) - (${M[1][1]})(${M[2][0]})]\n` +
                    `= ${t1} - (${t2}) + (${t3}) = ${det}`;

  return { det, explicacion };
}

function formatoMatrizTexto(M, B = null) {
  let txt = "";
  for (let i = 0; i < 3; i++) {
    txt += `|  ${M[i][0].toString().padStart(6)}  ${M[i][1].toString().padStart(6)}  ${M[i][2].toString().padStart(6)}  |`;
    if (B) txt += `   =   [ ${B[i].toString()} ]`;
    txt += "\n";
  }
  return txt;
}

// RESOLUCIÓN COMPLETA POR CRAMER
function resolverCramer() {
  let A = [];
  let B = [];

  for (let i = 0; i < 3; i++) {
    A[i] = [];
    for (let j = 0; j < 3; j++) {
      let val = document.getElementById(`a_${i}_${j}`).value;
      A[i][j] = Fraccion.parse(val);
    }
    let valB = document.getElementById(`b_${i}`).value;
    B[i] = Fraccion.parse(valB);
  }

  const resultadosDiv = document.getElementById('resultados');
  const pasosDiv = document.getElementById('pasos');
  resultadosDiv.style.display = 'block';
  pasosDiv.innerHTML = '';

  // PASO 1: SISTEMA FORMULADO
  pasosDiv.innerHTML += `
    <div class="step-box">
      <div class="step-title">Paso 1: Formulación Matricial del Sistema (AX = B)</div>
      <div class="matrix-display">${formatoMatrizTexto(A, B)}</div>
    </div>
  `;

  // PASO 2: DETERMINANTE PRINCIPAL
  let resDetA = obtenerDet3x3ConPasos(A);
  let detA = resDetA.det;

  pasosDiv.innerHTML += `
    <div class="step-box">
      <div class="step-title">Paso 2: Cálculo del Determinante Principal det(A)</div>
      <div class="matrix-display">${formatoMatrizTexto(A)}</div>
      <p><strong>Desarrollo por Cofactores:</strong></p>
      <div class="matrix-display">${resDetA.explicacion}</div>
      <p class="formula">det(A) = ${detA.toString()} ${!detA.den === 1 ? '≈ ' + detA.toDecimal() : ''}</p>
    </div>
  `;

  // VALIDACIÓN DE SINGULARIDAD
  if (detA.esCero()) {
    pasosDiv.innerHTML += `
      <div class="step-box" style="border-color: var(--primary-red);">
        <div class="step-title" style="color: var(--dark-red);">¡Atención: det(A) = 0!</div>
        <p>El determinante principal es igual a cero. La Regla de Cramer <strong>no es aplicable</strong> porque se generaría una división entre cero. El sistema es <em>Incompatible</em> (sin solución) o <em>Compatible Indeterminado</em> (infinitas soluciones).</p>
      </div>
    `;
    return;
  }

  // PASO 3: DETERMINANTES MODIFICADOS Y SOLUCIONES
  let nombresVar = ['x₁', 'x₂', 'x₃'];
  let soluciones = [];

  for (let j = 0; j < 3; j++) {
    // Clonar A y reemplazar la columna j por B
    let Aj = A.map(row => [...row]);
    for (let i = 0; i < 3; i++) {
      Aj[i][j] = B[i];
    }

    let resDetAj = obtenerDet3x3ConPasos(Aj);
    let detAj = resDetAj.det;
    let xj = detAj.dividir(detA);
    soluciones.push(xj);

    pasosDiv.innerHTML += `
      <div class="step-box">
        <div class="step-title">Paso 3.${j+1}: Matriz Modificada A_${j+1} y Cálculo de ${nombresVar[j]}</div>
        <p>Sustituyendo la Columna ${j+1} por el vector B:</p>
        <div class="matrix-display">${formatoMatrizTexto(Aj)}</div>
        <p><strong>Desarrollo de det(A_${j+1}):</strong></p>
        <div class="matrix-display">${resDetAj.explicacion}</div>
        <p class="formula">det(A_${j+1}) = ${detAj.toString()}</p>
        <hr style="margin: 10px 0;">
        <p class="formula">
          ${nombresVar[j]} = det(A_${j+1}) / det(A) = (${detAj.toString()}) / (${detA.toString()}) = <span style="color: var(--primary-red);">${xj.toString()}</span> 
          ${xj.den !== 1 ? '(≈ ' + xj.toDecimal() + ')' : ''}
        </p>
      </div>
    `;
  }

  // PASO 4: RESUMEN FINAL
  pasosDiv.innerHTML += `
    <div class="step-box" style="background-color: #E8F5E9; border-color: #81C784;">
      <div class="step-title" style="color: #2E7D32;">Paso 4: Vector Solución Final</div>
      <p class="formula">x₁ = ${soluciones[0].toString()} &nbsp;&nbsp;(≈ ${soluciones[0].toDecimal()})</p>
      <p class="formula">x₂ = ${soluciones[1].toString()} &nbsp;&nbsp;(≈ ${soluciones[1].toDecimal()})</p>
      <p class="formula">x₃ = ${soluciones[2].toString()} &nbsp;&nbsp;(≈ ${soluciones[2].toDecimal()})</p>
    </div>
  `;
}

window.onload = generarMatriz3x3;
