document.addEventListener('DOMContentLoaded', () => {
    const pasteMatrixInput = document.getElementById('paste-matrix');
    const populateMatrixButton = document.getElementById('populate-matrix');
    const solveInverseButton = document.getElementById('solve-inverse-button');
    const matrixContainer = document.getElementById('matrix-container');
    const stepsDisplay = document.getElementById('steps-display');
    const finalMatrixDisplay = document.getElementById('final-matrix-display');
    const resultSection = document.getElementById('result-section');

    let matrix = [];
    let augmentedMatrix = [];

    populateMatrixButton.addEventListener('click', () => {
        const pastedData = parsePastedMatrix(pasteMatrixInput.value);
        if (pastedData) {
            const n = pastedData.length;
            generateMatrixGrid(n, pastedData);
        } else {
            alert('Invalid matrix format. Please ensure it is space-separated.');
        }
    });

    solveInverseButton.addEventListener('click', () => {
        readMatrixFromGrid();
        const steps = gaussJordanInverse(matrix);
        displaySteps(steps.operations, steps.matrices);
        displayFinalMatrix(steps.finalMatrix);
        resultSection.style.display = "block";
    });

    function parsePastedMatrix(data) {
        const rows = data.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
        const n = rows.length;
        if (rows.every(row => row.length === n)) {
            return rows;
        }
        return null;
    }

    function generateMatrixGrid(n, data = []) {
        matrixContainer.innerHTML = '';
        const table = document.createElement('table');
        for (let i = 0; i < n; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < n; j++) {
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
        augmentedMatrix = matrix.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));
    }

    function gaussJordanInverse(matrix) {
        const n = matrix.length;
        const steps = { operations: [], matrices: [], finalMatrix: [] };

        // Step 1: Zero out lower triangle
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < i; j++) {
                const factor = round(-matrix[i][j] / matrix[j][j]);
                for (let k = 0; k < n; k++) {
                    matrix[i][k] = round(matrix[i][k] + factor * matrix[j][k]);
                    augmentedMatrix[i][k] = round(augmentedMatrix[i][k] + factor * augmentedMatrix[j][k]);
                }
                steps.operations.push(`R${i + 1} = R${i + 1} + (${factor}) * R${j + 1}`);
                steps.matrices.push(getAugmentedState(matrix, augmentedMatrix));
            }
        }

        // Step 2: Normalize diagonals and zero out upper triangle
        for (let i = n - 1; i >= 0; i--) {
            const diag = matrix[i][i];
            for (let k = 0; k < n; k++) {
                matrix[i][k] = round(matrix[i][k] / diag);
                augmentedMatrix[i][k] = round(augmentedMatrix[i][k] / diag);
            }
            steps.operations.push(`R${i + 1} = R${i + 1} / ${diag}`);
            steps.matrices.push(getAugmentedState(matrix, augmentedMatrix));

            for (let j = 0; j < i; j++) {
                const factor = round(-matrix[j][i]);
                for (let k = 0; k < n; k++) {
                    matrix[j][k] = round(matrix[j][k] + factor * matrix[i][k]);
                    augmentedMatrix[j][k] = round(augmentedMatrix[j][k] + factor * augmentedMatrix[i][k]);
                }
                steps.operations.push(`R${j + 1} = R${j + 1} + (${factor}) * R${i + 1}`);
                steps.matrices.push(getAugmentedState(matrix, augmentedMatrix));
            }
        }

        steps.finalMatrix = getAugmentedState(matrix, augmentedMatrix);
        return steps;
    }

    function getAugmentedState(matrix, augmentedMatrix) {
        return matrix.map((row, i) => [...row, '|', ...augmentedMatrix[i]]);
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
        let html = '<table id=dis>';
        matrix.forEach(row => {
            html += '<tr>';
            row.forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }

    function displayFinalMatrix(finalMatrix) {
        finalMatrixDisplay.innerHTML = displayMatrix(finalMatrix);
    }

    function round(value) {
        return Math.round(value * 1000) / 1000; // Round to 3 decimal places
    }
});
