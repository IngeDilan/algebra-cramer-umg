// CLASE PARA OPERACIONES Y SIMPLIFICACIÓN CON FRACCIONES
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

// CONSTRUCCIÓN DE LA MATRIZ 3x3
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

// CÁLCULO VISUAL CON LA REGLA DE SARRUS
function calcularSarrusConPasos(M, nombreDet) {
  // Productos descendentes (diagonales principales)
  let d1 = M[0][0].multiplicar(M[1][1]).multiplicar(M[2][2]);
  let d2 = M[0][1].multiplicar(M[1][2]).multiplicar(M[2][0]);
  let d3 = M[0][2].multiplicar(M[1][0]).multiplicar(M[2][1]);
  let sumaDesc = d1.sumar(d2).sumar(d3);

  // Productos ascendentes (diagonales secundarias)
  let u1 = M[2][0].multiplicar(M[1][1]).multiplicar(M[0][2]);
  let u2 = M[2][1].multiplicar(M[1][2]).multiplicar(M[0][0]);
  let u3 = M[2][2].multiplicar(M[1][0]).multiplicar(M[0][1]);
  let sumaAsc = u1.sumar(u2).sumar(u3);

  let detFinal = sumaDesc.restar(sumaAsc);

  // Renderizado en HTML estilo gráfico Sarrus
  let htmlTabla = `
    <table class="sarrus-table">
      <tr>
        <td class="border-left-det">${M[0][0].toString()}</td>
        <td>${M[0][1].toString()}</td>
        <td class="border-right-det">${M[0][2].toString()}</td>
        <td class="repeat-col">${M[0][0].toString()}</td>
        <td class="repeat-col">${M[0][1].toString()}</td>
      </tr>
      <tr>
        <td class="border-left-det">${M[1][0].toString()}</td>
        <td>${M[1][1].toString()}</td>
        <td class="border-right-det">${M[1][2].toString()}</td>
        <td class="repeat-col">${M[1][0].toString()}</td>
        <td class="repeat-col">${M[1][1].toString()}</td>
      </tr>
      <tr>
        <td class="border-left-det">${M[2][0].toString()}</td>
        <td>${M[2][1].toString()}</td>
        <td class="border-right-det">${M[2][2].toString()}</td>
        <td class="repeat-col">${M[2][0].toString()}</td>
        <td class="repeat-col">${M[2][1].toString()}</td>
      </tr>
    </table>

    <div class="formula-line">
      <p style="color: #1B5E20; margin-bottom: 5px;">
        <strong>Diagonales Principales (↘):</strong> 
        (${d1.toString()}) + (${d2.toString()}) + (${d3.toString()}) = <strong>${sumaDesc.toString()}</strong>
      </p>
      <p style="color: #B71C1C; margin-bottom: 8px;">
        <strong>Diagonales Secundarias (↗):</strong> 
        (${u1.toString()}) + (${u2.toString()}) + (${u3.toString()}) = <strong>${sumaAsc.toString()}</strong>
      </p>
      <p class="highlight-result">
        ${nombreDet} = (${sumaDesc.toString()}) - (${sumaAsc.toString()}) = <strong>${detFinal.toString()}</strong>
      </p>
    </div>
  `;

  return { det: detFinal, html: htmlTabla };
}

// EJECUCIÓN DEL MÉTODO DE CRAMER
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

  // PASO 1: DETERMINANTE PRINCIPAL D_p (det A)
  let resDp = calcularSarrusConPasos(A, 'D_p');
  let Dp = resDp.det;

  pasosDiv.innerHTML += `
    <div class="step-box">
      <div class="step-title">1. Calcular el valor del Determinante Principal (D_p) por Regla de Sarrus</div>
      ${resDp.html}
    </div>
  `;

  // VALIDACIÓN DE SINGULARIDAD
  if (Dp.esCero()) {
    pasosDiv.innerHTML += `
      <div class="step-box" style="border-color: var(--primary-red);">
        <div class="step-title" style="color: var(--dark-red);">¡Atención: D_p = 0!</div>
        <p>El determinante principal es 0. La Regla de Cramer no se puede aplicar directamente ya que requiere dividir entre D_p. El sistema no tiene solución única (es Incompatible o Indeterminado).</p>
      </div>
    `;
    return;
  }

  // PASO 2: DETERMINANTES MODIFICADOS (Dx, Dy, Dz) Y VARIABLES
  let nombresVar = ['x', 'y', 'z'];
  let simbDet = ['D_x', 'D_y', 'D_z'];
  let soluciones = [];

  for (let j = 0; j < 3; j++) {
    let Aj = A.map(row => [...row]);
    for (let i = 0; i < 3; i++) {
      Aj[i][j] = B[i];
    }

    let resDj = calcularSarrusConPasos(Aj, simbDet[j]);
    let Dj = resDj.det;
    let valVar = Dj.dividir(Dp);
    soluciones.push(valVar);

    pasosDiv.innerHTML += `
      <div class="step-box">
        <div class="step-title">2.${j+1}. Calcular el valor de ${simbDet[j]} (Sustituyendo Columna ${j+1} por vector B)</div>
        ${resDj.html}
        <div class="formula-line" style="margin-top: 15px; background: #FFF3E0; padding: 10px; border-radius: 4px;">
          ${nombresVar[j]} = ${simbDet[j]} / D_p = (${Dj.toString()}) / (${Dp.toString()}) = 
          <span class="highlight-result">${valVar.toString()}</span>
          ${valVar.den !== 1 ? ' (≈ ' + valVar.toDecimal() + ')' : ''}
        </div>
      </div>
    `;
  }

  // RESUMEN DE RESULTADOS FINALES
  pasosDiv.innerHTML += `
    <div class="step-box" style="background-color: #E8F5E9; border-color: #81C784;">
      <div class="step-title" style="color: #2E7D32;">3. Solución Final del Sistema</div>
      <p class="formula-line">x = <strong>${soluciones[0].toString()}</strong> ${soluciones[0].den !== 1 ? '(≈ ' + soluciones[0].toDecimal() + ')' : ''}</p>
      <p class="formula-line">y = <strong>${soluciones[1].toString()}</strong> ${soluciones[1].den !== 1 ? '(≈ ' + soluciones[1].toDecimal() + ')' : ''}</p>
      <p class="formula-line">z = <strong>${soluciones[2].toString()}</strong> ${soluciones[2].den !== 1 ? '(≈ ' + soluciones[2].toDecimal() + ')' : ''}</p>
    </div>
  `;
}

window.onload = generarMatriz3x3;
