document.addEventListener('DOMContentLoaded', () => {
    const pasteMatrixInput = document.getElementById('paste-matrix');
    const populateMatrixButton = document.getElementById('populate-matrix');
    const matrixContainer = document.getElementById('matrix-container');
    const solveJacobiButton = document.getElementById('solve-jacobi-button');
    const stepsDisplay = document.getElementById('steps-display');
    const solutionDisplay = document.getElementById('solution-display');
    const lastErrorDisplay = document.getElementById('last-error-display');
    const resultSection = document.getElementById('result-section');
    const stoppingMethodSelect = document.getElementById('stopping-method');
    const stoppingValueInput = document.getElementById('stopping-value');

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

    solveJacobiButton.addEventListener('click', () => {
        const stoppingMethod = stoppingMethodSelect.value;
        const stoppingValue = parseFloat(stoppingValueInput.value);

        readMatrixFromGrid();

        try {
            const result = gaussSeidelMethod(matrix, stoppingMethod, stoppingValue);
            displaySteps(result.steps);
            displaySolution(result.solution);
            resultSection.style.display = "block";
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
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

    function gaussSeidelMethod(matrix, stoppingMethod, stoppingValue) {
        const n = matrix.length;
        let es = stoppingMethod === 'digits' ? 0.5 * Math.pow(10, 2 - stoppingValue) : stoppingMethod === 'error' ? stoppingValue : null;
        let maxIterations = stoppingMethod === 'iterations' ? stoppingValue : Infinity;
    
        let xs = Array(n).fill(0);
        let prevXs = Array(n).fill(0);
        let iterations = 0;
        let error = Infinity;
    
        const steps = [];
        while ((stoppingMethod === 'iterations' ? iterations < maxIterations : error > es) && iterations < maxIterations) {
            prevXs = [...xs];
            for (let i = 0; i < n; i++) {
                let sum = matrix[i][n];
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        sum -= matrix[i][j] * xs[j];
                    }
                }
                xs[i] = sum / matrix[i][i];
            }
    
            error = Math.max(...xs.map((x, i) => Math.abs(x - prevXs[i])));
            iterations++;
            steps.push({ iteration: iterations, values: [...xs], error }); 
        }
    
        return {
            steps,
            solution: xs.map((x, i) => ({ variable: `x${i + 1}`, value: x })),
            lastError: error
        };
    }
    

    function displaySteps(steps) {
        let html = '<table><tr><th>Iteration</th>';
        for (let i = 0; i < steps[0].values.length; i++) {
            html += `<th>X<sub>${i + 1}</sub></th>`;
        }
        html += '<th>Error</th></tr>';

        steps.forEach(step => {
            html += `<tr><td>${step.iteration}</td>`;
            step.values.forEach(value => {
                html += `<td>${value.toFixed(6)}</td>`;
            });
            html += `<td>${step.error.toFixed(6)}</td></tr>`;
        });

        html += '</table>';
        stepsDisplay.innerHTML = html;
    }

    function displaySolution(solution) {
        let html = '<table><tr><th>Variable</th><th>Value</th></tr>';
        solution.forEach(item => {
            html += `<tr><td>${item.variable}</td><td>${item.value.toFixed(6)}</td></tr>`;
        });
        html += '</table>';
        solutionDisplay.innerHTML = html;
    }


});
