// ==========================================
// 1. CAPTURA Y VALIDACIÓN DE DATOS
// ==========================================
function capturarMatriz() {
    const inputs = document.querySelectorAll('.matrix-input');
    const valores = [];

    for (let i = 0; i < inputs.length; i++) {
        const valorTexto = inputs[i].value.trim();
        if (valorTexto === '' || isNaN(Number(valorTexto))) {
            alert(`Por favor ingresa un número válido en la celda ${i + 1}.`);
            inputs[i].focus();
            return null;
        }
        valores.push(parseFloat(valorTexto));
    }

    // Estructurar arreglo unidimensional en matriz 3x3
    return [
        [valores[0], valores[1], valores[2]],
        [valores[3], valores[4], valores[5]],
        [valores[6], valores[7], valores[8]]
    ];
}

// ==========================================
// 2. MOTOR DE CÁLCULO (REGLA DE SARRUS)
// ==========================================
function calcularSarrus(A) {
    const a11 = A[0][0], a12 = A[0][1], a13 = A[0][2];
    const a21 = A[1][0], a22 = A[1][1], a23 = A[1][2];
    const a31 = A[2][0], a32 = A[2][1], a33 = A[2][2];

    // Productos de diagonales principales (Dp)
    const dp1 = a11 * a22 * a33;
    const dp2 = a12 * a23 * a31;
    const dp3 = a13 * a21 * a32;
    const Dp = dp1 + dp2 + dp3;

    // Productos de diagonales secundarias (Ds)
    const ds1 = a13 * a22 * a31;
    const ds2 = a11 * a23 * a32;
    const ds3 = a12 * a21 * a33;
    const Ds = ds1 + ds2 + ds3;

    // Determinante principal
    const detA = Dp - Ds;

    // Tolerancia numérica para evitar imprecisiones de punto flotante
    const tieneSolucionUnica = Math.abs(detA) > 1e-9;

    return {
        A,
        dp1, dp2, dp3, Dp,
        ds1, ds2, ds3, Ds,
        detA: tieneSolucionUnica ? detA : 0,
        tieneSolucionUnica
    };
}

// ==========================================
// 3. RENDERIZADO DE RESULTADOS Y LIMPIEZA
// ==========================================
function procesarCalculo() {
    const matriz = capturarMatriz();
    if (!matriz) return;

    const res = calcularSarrus(matriz);
    renderizarResultado(res);
}

function renderizarResultado(res) {
    const contenedor = document.getElementById('resultados');
    const A = res.A;

    // Formateo visual de números
    const fmt = (n) => Number.isInteger(n) ? n : Number(n.toFixed(4));

    const claseDiagnostico = res.tieneSolucionUnica ? 'diagnosis-unique' : 'diagnosis-singular';
    const textoDiagnostico = res.tieneSolucionUnica
        ? 'DIAGNÓSTICO: Det(A) ≠ 0 — El sistema es Compatible Determinado y EXISTE SOLUCIÓN ÚNICA.'
        : 'DIAGNÓSTICO: Det(A) = 0 — Matriz Singular. El sistema NO TIENE SOLUCIÓN ÚNICA (puede tener infinitas soluciones o ninguna).';

    contenedor.innerHTML = `
        <h3>Procedimiento Paso a Paso (Regla de Sarrus)</h3>
        
        <div class="step-box">
            <strong>1. Suma de Diagonales Principales (D<sub>p</sub>):</strong><br>
            D<sub>p</sub> = (${fmt(A[0][0])} · ${fmt(A[1][1])} · ${fmt(A[2][2])}) + (${fmt(A[0][1])} · ${fmt(A[1][2])} · ${fmt(A[2][0])}) + (${fmt(A[0][2])} · ${fmt(A[1][0])} · ${fmt(A[2][1])})<br>
            D<sub>p</sub> = (${fmt(res.dp1)}) + (${fmt(res.dp2)}) + (${fmt(res.dp3)}) = <strong>${fmt(res.Dp)}</strong>
        </div>

        <div class="step-box">
            <strong>2. Suma de Diagonales Secundarias (D<sub>s</sub>):</strong><br>
            D<sub>s</sub> = (${fmt(A[0][2])} · ${fmt(A[1][1])} · ${fmt(A[2][0])}) + (${fmt(A[0][0])} · ${fmt(A[1][2])} · ${fmt(A[2][1])}) + (${fmt(A[0][1])} · ${fmt(A[1][0])} · ${fmt(A[2][2])})<br>
            D<sub>s</sub> = (${fmt(res.ds1)}) + (${fmt(res.ds2)}) + (${fmt(res.ds3)}) = <strong>${fmt(res.Ds)}</strong>
        </div>

        <div class="step-box">
            <strong>3. Diferencia de Diagonales:</strong><br>
            Det(A) = D<sub>p</sub> - D<sub>s</sub> = ${fmt(res.Dp)} - (${fmt(res.Ds)})
        </div>

        <div class="det-final">
            Det(A) = ${fmt(res.detA)}
        </div>

        <div class="diagnosis-box ${claseDiagnostico}">
            ${textoDiagnostico}
        </div>
    `;

    contenedor.style.display = 'block';
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function limpiarMatriz() {
    // 1. Restablecer todas las celdas a "0"
    const inputs = document.querySelectorAll('.matrix-input');
    inputs.forEach(input => {
        input.value = '0';
    });

    // 2. Ocultar el contenedor de resultados y borrar su contenido
    const contenedorResultados = document.getElementById('resultados');
    if (contenedorResultados) {
        contenedorResultados.style.display = 'none';
        contenedorResultados.innerHTML = '';
    }

    // 3. Enfocar y seleccionar la primera celda (a11)
    if (inputs.length > 0) {
        inputs[0].focus();
        inputs[0].select();
    }
}

// Enfocar la primera casilla automáticamente al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const primerInput = document.querySelector('.matrix-input');
    if (primerInput) {
        primerInput.focus();
        primerInput.select();
    }
});
// INICIALIZACIÓN AUTOMÁTICA
document.addEventListener('DOMContentLoaded', generarMatriz3x3);
