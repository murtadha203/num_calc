document.addEventListener('DOMContentLoaded', () => {
    const pasteMatrixInput = document.getElementById('paste-matrix');
    const populateMatrixButton = document.getElementById('populate-matrix');
    const matrixContainer = document.getElementById('matrix-container');
    const solveGaussJordanButton = document.getElementById('solve-gauss-jordan-button');
    const stepsDisplay = document.getElementById('steps-display');
    const solutionDisplay = document.getElementById('solution-display');
    const resultSection = document.getElementById('result-section');

    let matrix = [];

    populateMatrixButton.addEventListener('click', () => {
        const pastedData = parsePastedMatrix(pasteMatrixInput.value);
        if (pastedData) {
            const n = pastedData.length;
            generateMatrixGrid(n, pastedData);
        } else {
            alert('Invalid matrix format. Please ensure it is space-separated.');
        }
    });

    solveGaussJordanButton.addEventListener('click', () => {
        readMatrixFromGrid();
        const steps = gaussJordanElimination(matrix);
        displaySteps(steps.operations, steps.matrices);
        displaySolution(steps.final);
        resultSection.style.display = "block";
    });

    function parsePastedMatrix(data) {
        const rows = data.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
        const n = rows.length;
        if (rows.every(row => row.length === n + 1)) {
            return rows;
        }
        return null;
    }

    function generateMatrixGrid(n, data = []) {
        matrixContainer.innerHTML = '';
        const table = document.createElement('table');
        for (let i = 0; i < n; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j <= n; j++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.step = 'any';
                input.value = data[i] ? data[i][j] : 0;
                cell.appendChild(input);
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        matrixContainer.appendChild(table);
    }

    function readMatrixFromGrid() {
        const rows = matrixContainer.querySelectorAll('tr');
        matrix = Array.from(rows, row => Array.from(row.querySelectorAll('input')).map(input => parseFloat(input.value)));
    }

    function gaussJordanElimination(matrix) {
        const n = matrix.length;
        const steps = { operations: [], final: [], finalEquations: [], matrices: [] };

        // Forward elimination (reuse Gaussian elimination logic)
        for (let i = 0; i < n; i++) {
            const diag = matrix[i][i];
            if (diag !== 0) {
                for (let k = 0; k <= n; k++) {
                    matrix[i][k] /= diag;
                }
                steps.operations.push(`R${i + 1} = R${i + 1} / ${toFraction(diag)}`);
                steps.matrices.push(matrix.map(row => [...row])); // Deep copy of the matrix
            }

            for (let j = i + 1; j < n; j++) {
                const factor = -matrix[j][i];
                for (let k = 0; k <= n; k++) {
                    matrix[j][k] += factor * matrix[i][k];
                }
                steps.operations.push(`R${j + 1} = R${j + 1} + (${toFraction(factor)}) * R${i + 1}`);
                steps.matrices.push(matrix.map(row => [...row]));
            }
        }

        // Backward elimination
        for (let i = n - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                const factor = -matrix[j][i];
                for (let k = 0; k <= n; k++) {
                    matrix[j][k] += factor * matrix[i][k];
                }
                steps.operations.push(`R${j + 1} = R${j + 1} + (${toFraction(factor)}) * R${i + 1}`);
                steps.matrices.push(matrix.map(row => [...row]));
            }
        }

        steps.finalEquations = formatFinalSystem(matrix);
        steps.final = matrix.map(row => toFraction(row[n]));

        return steps;
    }

    function formatFinalSystem(matrix) {
        const equations = [];
        for (let i = 0; i < matrix.length; i++) {
            let equation = '';
            for (let j = 0; j < matrix[i].length - 1; j++) {
                const coef = toFraction(matrix[i][j]);
                if (coef !== '0') {
                    if (j > 0 && matrix[i][j] > 0) equation += ' + ';
                    equation += `${coef}x<sub>${j + 1}</sub>`;
                }
            }
            equation += ` = ${toFraction(matrix[i][matrix[i].length - 1])}`;
            equations.push(equation);
        }
        return equations;
    }

    function displaySteps(operations, matrices) {
        let html = '';
        operations.forEach((op, index) => {
            html += `<div><strong>${op}</strong></div>`;
            html += displayMatrix(matrices[index]);
        });
        stepsDisplay.innerHTML = html;
    }

    function displayMatrix(matrix) {
        let html = '<table>';
        matrix.forEach(row => {
            html += '<tr>';
            row.forEach(value => {
                html += `<td>${toFraction(value)}</td>`;
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }

    function displaySolution(finalSolution) {
        let html = '<table><tr><th>Variable</th><th>Value</th></tr>';
        finalSolution.forEach((val, idx) => {
            html += `<tr><td>x<sub>${idx + 1}</sub></td><td>${val}</td></tr>`;
        });
        html += '</table>';
        solutionDisplay.innerHTML = html;
    }

    function toFraction(decimal) {
        const tolerance = 1e-10;
        let numerator = 1;
        let denominator = 1;

        if (decimal === Math.floor(decimal)) return decimal.toString();

        while (Math.abs(decimal - numerator / denominator) > tolerance) {
            if (decimal > numerator / denominator) {
                numerator++;
            } else {
                denominator++;
                numerator = Math.round(decimal * denominator);
            }
        }

        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const divisor = gcd(numerator, denominator);
        numerator /= divisor;
        denominator /= divisor;

        return denominator === 1 ? numerator.toString() : `${numerator}/${denominator}`;
    }
});
