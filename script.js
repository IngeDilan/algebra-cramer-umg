// ==========================================
// 1. EVALUADOR DE EXPRESIONES MATEMÁTICAS
// ==========================================
function parsearEntradaNumerica(texto) {
    // Guardar la etiqueta original limpia para mostrarla en el procedimiento
    const etiquetaOriginal = texto.trim();
    
    // Si la celda está vacía, vale 0
    if (etiquetaOriginal === '') {
        return { valor: 0, etiqueta: '0' };
    }

    // Normalizar expresión para evaluación matemática
    let expr = etiquetaOriginal.toLowerCase()
        .replace(/\s+/g, '')       // Quitar espacios
        .replace(/,/g, '.')        // Comas a puntos decimales
        .replace(/×/g, '*')        // Símbolo de multiplicación
        .replace(/÷/g, '/')        // Símbolo de división
        .replace(/\^/g, '**');     // Potencias (ej. 2^3 -> 2**3)

    // Soporte para raíces: √9, √(9), sqrt(9), raiz(9)
    expr = expr.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
    expr = expr.replace(/√\(/g, 'Math.sqrt(');
    expr = expr.replace(/\b(sqrt|raiz)\(/g, 'Math.sqrt(');

    // Constantes matemáticas
    expr = expr.replace(/\bpi\b/g, 'Math.PI');
    expr = expr.replace(/\be\b/g, 'Math.E');

    // Funciones trigonométricas en GRADOS (ej. sin(30) = 0.5, cos(60) = 0.5)
    // Si contiene Math.PI dentro, lo evalúa en radianes automáticamente
    const toRad = (deg) => (deg * Math.PI) / 180;
    const sin = (x) => Math.sin(expr.includes('Math.PI') ? x : toRad(x));
    const cos = (x) => Math.cos(expr.includes('Math.PI') ? x : toRad(x));
    const tan = (x) => {
        if (!expr.includes('Math.PI') && Math.abs(x % 180) === 90) {
            throw new Error('Tangente indefinida');
        }
        return Math.tan(expr.includes('Math.PI') ? x : toRad(x));
    };

    // Reemplazar "sen(" por "sin("
    expr = expr.replace(/\bsen\(/g, 'sin(');

    // Multiplicación implícita (ej: 2sqrt(2) -> 2*Math.sqrt(2), 3pi -> 3*Math.PI)
    expr = expr.replace(/(\d)(Math\.|sin\(|cos\(|tan\()/g, '$1*$2');

    // Filtro de seguridad: permitir únicamente caracteres matemáticos válidos
    const caracteresPermitidos = /^[0-9+\-*/().MathsqrtPIEsincoab]+$/;
    if (!caracteresPermitidos.test(expr)) {
        return null;
    }

    try {
        // Evaluar la expresión matemática de forma segura
        const resultado = Function('sin', 'cos', 'tan', `"use strict"; return (${expr});`)(sin, cos, tan);

        if (typeof resultado !== 'number' || isNaN(resultado) || !isFinite(resultado)) {
            return null;
        }

        return {
            valor: resultado,
            etiqueta: etiquetaOriginal
        };
    } catch (error) {
        return null;
    }
}

function capturarMatriz() {
    const inputs = document.querySelectorAll('.matrix-input');
    const datos = [];

    for (let i = 0; i < inputs.length; i++) {
        const parsed = parsearEntradaNumerica(inputs[i].value);
        if (!parsed) {
            alert(`Expresión inválida en la celda ${i + 1} ("${inputs[i].value}").\n\nEjemplos válidos:\n• Enteros y decimales: -5, 2.5\n• Fracciones: -5/2, 3/4\n• Raíces: sqrt(2), raiz(9), √16\n• Trigonometría (grados): sen(30), cos(60), tan(45)\n• Potencias y constantes: 2^3, pi`);
            inputs[i].focus();
            inputs[i].select();
            return null;
        }
        datos.push(parsed);
    }

    return [
        [datos[0], datos[1], datos[2]],
        [datos[3], datos[4], datos[5]],
        [datos[6], datos[7], datos[8]]
    ];
}

// ==========================================
// 2. MOTOR DE CÁLCULO (REGLA DE SARRUS 3x3)
// ==========================================
function calcularSarrus(M) {
    const v = (r, c) => M[r][c].valor;
    const e = (r, c) => M[r][c].etiqueta;

    // Diagonales Descendentes (↘)
    const d1 = v(0, 0) * v(1, 1) * v(2, 2);
    const d2 = v(0, 1) * v(1, 2) * v(2, 0);
    const d3 = v(0, 2) * v(1, 0) * v(2, 1);
    const sumaDesc = d1 + d2 + d3;

    // Diagonales Ascendentes (↗)
    const a1 = v(2, 0) * v(1, 1) * v(0, 2);
    const a2 = v(2, 1) * v(1, 2) * v(0, 0);
    const a3 = v(2, 2) * v(1, 0) * v(0, 1);
    const sumaAsc = a1 + a2 + a3;

    // Determinante Principal
    const detRaw = sumaDesc - sumaAsc;
    const tieneSolucionUnica = Math.abs(detRaw) > 1e-9;
    const detFinal = tieneSolucionUnica ? detRaw : 0;

    return {
        M, e,
        d1, d2, d3, sumaDesc,
        a1, a2, a3, sumaAsc,
        detFinal,
        tieneSolucionUnica
    };
}

// ==========================================
// 3. RENDERIZADO VISUAL Y LIMPIEZA
// ==========================================
function formatearNumero(num) {
    if (Math.abs(num) < 1e-9) return '0';
    // Redondear decimales largos a 4 cifras significativas sin ceros innecesarios
    return Number.isInteger(num) ? num.toString() : Number(num.toFixed(4)).toString();
}

function procesarCalculo() {
    const matriz = capturarMatriz();
    if (!matriz) return;

    const res = calcularSarrus(matriz);
    renderizarProcedimiento(res);
}

function renderizarProcedimiento(res) {
    const contenedor = document.getElementById('resultados');
    const e = res.e;
    const fmt = formatearNumero;

    const claseDiag = res.tieneSolucionUnica ? 'diag-ok' : 'diag-zero';
    const mensajeDiag = res.tieneSolucionUnica
        ? 'DIAGNÓSTICO: Det(A) ≠ 0 — El sistema es Compatible Determinado y EXISTE SOLUCIÓN ÚNICA.'
        : 'DIAGNÓSTICO: Det(A) = 0 — Matriz Singular. El sistema NO TIENE SOLUCIÓN ÚNICA (puede tener infinitas soluciones o ninguna).';

    contenedor.innerHTML = `
        <h3 class="results-title">Procedimiento Paso a Paso</h3>

        <div class="step-card">
            <h4>1. Extensión de la Matriz (Duplicando Columna 1 y Columna 2)</h4>
            <p class="step-desc">Se agregan las dos primeras columnas a la derecha para formar la matriz de 3 × 5:</p>
            <table class="extended-matrix-table">
                <tr>
                    <td>${e(0,0)}</td><td>${e(0,1)}</td><td class="col-divider">${e(0,2)}</td>
                    <td class="duplicated-col">${e(0,0)}</td><td class="duplicated-col">${e(0,1)}</td>
                </tr>
                <tr>
                    <td>${e(1,0)}</td><td>${e(1,1)}</td><td class="col-divider">${e(1,2)}</td>
                    <td class="duplicated-col">${e(1,0)}</td><td class="duplicated-col">${e(1,1)}</td>
                </tr>
                <tr>
                    <td>${e(2,0)}</td><td>${e(2,1)}</td><td class="col-divider">${e(2,2)}</td>
                    <td class="duplicated-col">${e(2,0)}</td><td class="duplicated-col">${e(2,1)}</td>
                </tr>
            </table>
        </div>

        <div class="step-card">
            <h4>2. Multiplicación de Diagonales Descendentes (↘)</h4>
            <p class="step-desc">Multiplicación en diagonal de izquierda a derecha:</p>
            <div class="diag-box diag-desc">
                <ul>
                    <li>Diagonal 1: (${e(0,0)}) × (${e(1,1)}) × (${e(2,2)}) = <strong>${fmt(res.d1)}</strong></li>
                    <li>Diagonal 2: (${e(0,1)}) × (${e(1,2)}) × (${e(2,0)}) = <strong>${fmt(res.d2)}</strong></li>
                    <li>Diagonal 3: (${e(0,2)}) × (${e(1,0)}) × (${e(2,1)}) = <strong>${fmt(res.d3)}</strong></li>
                </ul>
            </div>
            <p class="diag-sum-line">
                <strong>Suma de Diagonales Descendentes:</strong> (${fmt(res.d1)}) + (${fmt(res.d2)}) + (${fmt(res.d3)}) = <strong style="color:#1B5E20;">${fmt(res.sumaDesc)}</strong>
            </p>
        </div>

        <div class="step-card">
            <h4>3. Multiplicación de Diagonales Ascendentes (↗)</h4>
            <p class="step-desc">Multiplicación en diagonal de izquierda a derecha (hacia arriba):</p>
            <div class="diag-box diag-asc">
                <ul>
                    <li>Diagonal 1: (${e(2,0)}) × (${e(1,1)}) × (${e(0,2)}) = <strong>${fmt(res.a1)}</strong></li>
                    <li>Diagonal 2: (${e(2,1)}) × (${e(1,2)}) × (${e(0,0)}) = <strong>${fmt(res.a2)}</strong></li>
                    <li>Diagonal 3: (${e(2,2)}) × (${e(1,0)}) × (${e(0,1)}) = <strong>${fmt(res.a3)}</strong></li>
                </ul>
            </div>
            <p class="diag-sum-line">
                <strong>Suma de Diagonales Ascendentes:</strong> (${fmt(res.a1)}) + (${fmt(res.a2)}) + (${fmt(res.a3)}) = <strong style="color:#B71C1C;">${fmt(res.sumaAsc)}</strong>
            </p>
        </div>

        <div class="step-card final-card">
            <h4>4. Resultado Final del Determinante (Det A)</h4>
            <div class="formula-lines">
                Det(A) = (Suma Descendentes) - (Suma Ascendentes)<br>
                Det(A) = (${fmt(res.sumaDesc)}) - (${fmt(res.sumaAsc)})
            </div>
            <div class="det-big-result">
                Det(A) = ${fmt(res.detFinal)}
            </div>
            <div class="diagnosis-banner ${claseDiag}">
                ${mensajeDiag}
            </div>
        </div>
    `;

    contenedor.style.display = 'block';
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function limpiarMatriz() {
    const inputs = document.querySelectorAll('.matrix-input');
    inputs.forEach(input => {
        input.value = '';
    });

    const contenedorResultados = document.getElementById('resultados');
    if (contenedorResultados) {
        contenedorResultados.style.display = 'none';
        contenedorResultados.innerHTML = '';
    }

    if (inputs.length > 0) {
        inputs[0].focus();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const primerInput = document.querySelector('.matrix-input');
    if (primerInput) {
        primerInput.focus();
    }
});
