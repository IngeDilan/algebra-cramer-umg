function parsearEntradaNumerica(texto) {
    // Eliminar todos los espacios internos y reemplazar comas por puntos
    const limpio = texto.replace(/\s+/g, '').replace(/,/g, '.');
    
    // Si la celda se deja vacía, se interpreta automáticamente como 0
    if (limpio === '') {
        return { valor: 0, etiqueta: '0' };
    }

    // Validar fracciones como "-5/2", "1/4", "-3/-2"
    if (limpio.includes('/')) {
        const partes = limpio.split('/');
        if (partes.length !== 2 || partes[0] === '' || partes[1] === '') {
            return null;
        }

        const numerador = Number(partes[0]);
        const denominador = Number(partes[1]);

        if (isNaN(numerador) || isNaN(denominador) || denominador === 0) {
            return null;
        }

        return {
            valor: numerador / denominador,
            etiqueta: limpio
        };
    }

    // Validar enteros y decimales (positivos o negativos)
    const numero = Number(limpio);
    if (isNaN(numero)) {
        return null;
    }

    return {
        valor: numero,
        etiqueta: limpio
    };
}

function capturarMatriz() {
    const inputs = document.querySelectorAll('.matrix-input');
    const datos = [];

    for (let i = 0; i < inputs.length; i++) {
        const parsed = parsearEntradaNumerica(inputs[i].value);
        if (!parsed) {
            alert(`El valor "${inputs[i].value}" en la celda ${i + 1} no es válido.\nUsa enteros, decimales o fracciones (ej: -5/2, 2.5, 4).`);
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

function formatearNumero(num) {
    if (Math.abs(num) < 1e-9) return '0';
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
    // 1. Dejar las casillas completamente vacías
    const inputs = document.querySelectorAll('.matrix-input');
    inputs.forEach(input => {
        input.value = '';
    });

    // 2. Ocultar y vaciar el panel de resultados
    const contenedorResultados = document.getElementById('resultados');
    if (contenedorResultados) {
        contenedorResultados.style.display = 'none';
        contenedorResultados.innerHTML = '';
    }

    // 3. Enfocar la primera celda lista para escribir
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
