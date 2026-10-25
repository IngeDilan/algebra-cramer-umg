// CLASE PARA ARITMÉTICA Y OPERACIONES CON FRACCIONES
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
    if (val === undefined || val === null) return new Fraccion(0);
    if (typeof val === 'number') return new Fraccion(val);
    let str = val.toString().trim();
    if (str === '') return new Fraccion(0);
    if (str.includes('/')) {
      let partes = str.split('/');
      let n = parseFloat(partes[0]);
      let d = parseFloat(partes[1]);
      if (isNaN(n) || isNaN(d) || d === 0) return new Fraccion(0);
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

  toString() {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  toDecimal(pasos = 4) {
    return (this.num / this.den).toFixed(pasos);
  }
}

// GENERAR CASILLAS DE ENTRADA EN LA PANTALLA
function generarMatriz3x3() {
  const container = document.getElementById('matrixContainer');
  if (!container) return;
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

    container.appendChild(row);
  }
}

// CÁLCULO DEL DETERMINANTE CON TABLA EXTENDIDA ESTILO SARRUS (3x5)
function calcularDeterminanteCramer() {
  let A = [];

  for (let i = 0; i < 3; i++) {
    A[i] = [];
    for (let j = 0; j < 3; j++) {
      let elem = document.getElementById(`a_${i}_${j}`);
      let val = elem ? elem.value : '0';
      A[i][j] = Fraccion.parse(val);
    }
  }

  const resultadosDiv = document.getElementById('resultados');
  const pasosDiv = document.getElementById('pasos');
  if (!resultadosDiv || !pasosDiv) return;
  
  resultadosDiv.style.display = 'block';
  pasosDiv.innerHTML = '';

  // 1. Matriz extendida 3 filas x 5 columnas
  let E = [
    [A[0][0], A[0][1], A[0][2], A[0][0], A[0][1]],
    [A[1][0], A[1][1], A[1][2], A[1][0], A[1][1]],
    [A[2][0], A[2][1], A[2][2], A[2][0], A[2][1]]
  ];

  // 2. Diagonales Principales (Descendentes ↘)
  let p1 = E[0][0].multiplicar(E[1][1]).multiplicar(E[2][2]);
  let p2 = E[0][1].multiplicar(E[1][2]).multiplicar(E[2][3]);
  let p3 = E[0][2].multiplicar(E[1][3]).multiplicar(E[2][4]);
  let sumaDesc = p1.sumar(p2).sumar(p3);

  // 3. Diagonales Secundarias (Ascendentes ↗)
  let s1 = E[2][0].multiplicar(E[1][1]).multiplicar(E[0][2]);
  let s2 = E[2][1].multiplicar(E[1][2]).multiplicar(E[0][3]);
  let s3 = E[2][2].multiplicar(E[1][3]).multiplicar(E[0][4]);
  let sumaAsc = s1.sumar(s2).sumar(s3);

  // 4. Determinante Final D_p
  let Dp = sumaDesc.restar(sumaAsc);

  // RENDERIZADO DE TABLA ESTICADA CON BORDES
  let htmlTabla = `
    <table class="cramer-table">
      <tr>
        <td class="border-left-det">${E[0][0].toString()}</td>
        <td>${E[0][1].toString()}</td>
        <td class="border-right-det">${E[0][2].toString()}</td>
        <td class="repeat-col">${E[0][3].toString()}</td>
        <td class="repeat-col">${E[0][4].toString()}</td>
      </tr>
      <tr>
        <td class="border-left-det">${E[1][0].toString()}</td>
        <td>${E[1][1].toString()}</td>
        <td class="border-right-det">${E[1][2].toString()}</td>
        <td class="repeat-col">${E[1][3].toString()}</td>
        <td class="repeat-col">${E[1][4].toString()}</td>
      </tr>
      <tr>
        <td class="border-left-det">${E[2][0].toString()}</td>
        <td>${E[2][1].toString()}</td>
        <td class="border-right-det">${E[2][2].toString()}</td>
        <td class="repeat-col">${E[2][3].toString()}</td>
        <td class="repeat-col">${E[2][4].toString()}</td>
      </tr>
    </table>
  `;

  pasosDiv.innerHTML = `
    <div class="step-box">
      <div class="step-title">1. Extensión de la Matriz (Duplicando Columna 1 y Columna 2)</div>
      <p>Se agregan las dos primeras columnas a la derecha para formar la matriz de 3 × 5:</p>
      ${htmlTabla}
    </div>

    <div class="step-box">
      <div class="step-title">2. Multiplicación de Diagonales Descendentes (↘)</div>
      <p>Multiplicación en diagonal de izquierda a derecha:</p>
      <div class="diag-down-row">
        • Diagonal 1: (${E[0][0].toString()}) × (${E[1][1].toString()}) × (${E[2][2].toString()}) = <strong>${p1.toString()}</strong><br>
        • Diagonal 2: (${E[0][1].toString()}) × (${E[1][2].toString()}) × (${E[2][3].toString()}) = <strong>${p2.toString()}</strong><br>
        • Diagonal 3: (${E[0][2].toString()}) × (${E[1][3].toString()}) × (${E[2][4].toString()}) = <strong>${p3.toString()}</strong>
      </div>
      <p style="margin-top: 10px;"><strong>Suma de Diagonales Descendentes:</strong> (${p1.toString()}) + (${p2.toString()}) + (${p3.toString()}) = <span style="color: #1B5E20; font-weight: bold;">${sumaDesc.toString()}</span></p>
    </div>

    <div class="step-box">
      <div class="step-title">3. Multiplicación de Diagonales Ascendentes (↗)</div>
      <p>Multiplicación en diagonal de izquierda a derecha (hacia arriba):</p>
      <div class="diag-up-row">
        • Diagonal 1: (${E[2][0].toString()}) × (${E[1][1].toString()}) × (${E[0][2].toString()}) = <strong>${s1.toString()}</strong><br>
        • Diagonal 2: (${E[2][1].toString()}) × (${E[1][2].toString()}) × (${E[0][3].toString()}) = <strong>${s2.toString()}</strong><br>
        • Diagonal 3: (${E[2][2].toString()}) × (${E[1][3].toString()}) × (${E[0][4].toString()}) = <strong>${s3.toString()}</strong>
      </div>
      <p style="margin-top: 10px;"><strong>Suma de Diagonales Ascendentes:</strong> (${s1.toString()}) + (${s2.toString()}) + (${s3.toString()}) = <span style="color: #B71C1C; font-weight: bold;">${sumaAsc.toString()}</span></p>
    </div>

    <div class="step-box" style="background-color: #FFF8E1; border-color: #FFE0B2;">
      <div class="step-title">4. Resultado Final del Determinante (D_p)</div>
      <p class="formula-line">
        D_p = (Suma Descendentes) - (Suma Ascendentes)<br>
        D_p = (${sumaDesc.toString()}) - (${sumaAsc.toString()})<br><br>
        <span class="highlight-result">D_p = <strong>${Dp.toString()}</strong> ${Dp.den !== 1 ? '(≈ ' + Dp.toDecimal() + ')' : ''}</span>
      </p>
    </div>
  `;
}

// INICIALIZACIÓN AUTOMÁTICA
document.addEventListener('DOMContentLoaded', generarMatriz3x3);
