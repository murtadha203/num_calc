document.addEventListener('DOMContentLoaded', () => {
    const pasteMatrixInput = document.getElementById('paste-matrix');
    const populateMatrixButton = document.getElementById('populate-matrix');
    const matrixContainer = document.getElementById('matrix-container');
    const solveButton = document.getElementById('solve-button');
    const stepsDisplay = document.getElementById('steps-display');
    const finalEquationsDisplay = document.getElementById('final-equations');
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
    
    

    solveButton.addEventListener('click', () => {
        readMatrixFromGrid();
        const steps = gaussianElimination(matrix);
        displaySteps(steps.operations, steps.matrices);
        displayFinalEquations(steps.finalEquations);
        displaySolution(steps.final);
        resultSection.style.display = "block"; // Show result section
    });

    function generateMatrixGrid(n, data = []) {
        matrixContainer.innerHTML = '';
        matrix = Array.from({ length: n }, () => Array(n + 1).fill(0));
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

    function parsePastedMatrix(data) {
        const rows = data.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
        const n = rows.length;
        if (rows.every(row => row.length === n + 1)) {
            return rows;
        }
        return null;
    }

    function readMatrixFromGrid() {
        const rows = matrixContainer.querySelectorAll('tr');
        matrix = Array.from(rows, row => Array.from(row.querySelectorAll('input')).map(input => parseFloat(input.value)));
    }

    function gaussianElimination(matrix) {
        const n = matrix.length;
        const steps = { operations: [], final: [], finalEquations: [], matrices: [] };
    
        // Ensure no zero on the diagonal
        for (let i = 0; i < n; i++) {
            if (matrix[i][i] === 0) {
                let swapped = false;
                for (let j = i + 1; j < n; j++) {
                    if (matrix[j][i] !== 0) {
                        // Swap rows i and j
                        [matrix[i], matrix[j]] = [matrix[j], matrix[i]];
                        steps.operations.push(`Swap R${i + 1} with R${j + 1}`);
                        steps.matrices.push(matrix.map(row => [...row])); // Deep copy the matrix
                        swapped = true;
                        break;
                    }
                }
                if (!swapped) {
                    throw new Error(`Cannot solve: Zero diagonal element at index [${i}][${i}] and no row to swap.`);
                }
            }
        }
    
        // Perform Gaussian Elimination
        const lowTri = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i > j) {
                    lowTri.push([i, j]);
                }
            }
        }
    
        for (const [i, j] of lowTri) {
            let rows;
            if (j === 0) {
                rows = Array.from({ length: n }, (_, idx) => idx); // All rows if j == 0
            } else {
                rows = Array.from({ length: i - j + 1 }, (_, idx) => idx + (i - j)); // Rows up to current row i
            }
    
            const trow = rows.filter(rw =>
                rw !== i &&
                matrix[rw] !== undefined && // Ensure the row exists
                j < matrix[rw].length &&    // Ensure the column index is valid
                matrix[rw][j] !== 0         // Check the actual value
            );
            if (trow.length === 0) continue;
    
            let bestRow = trow[0];
            let bestFac = Infinity;
    
            trow.forEach(r => {
                const fac = matrix[i][j] / matrix[r][j];
                if (Number.isInteger(fac) && Math.abs(fac) < Math.abs(bestFac)) {
                    bestRow = r;
                    bestFac = fac;
                }
            });
    
            const factor = -matrix[i][j] / matrix[bestRow][j];
            if (factor === 0) continue;
            steps.operations.push(`R${i + 1} = R${i + 1} + (${toFraction(factor)}) * R${bestRow + 1}`);
    
            for (let k = 0; k <= n; k++) {
                matrix[i][k] += factor * matrix[bestRow][k];
            }
    
            steps.matrices.push(matrix.map(row => [...row])); // Deep copy the matrix for each step
        }
    
        steps.finalEquations = formatFinalSystem(matrix);
    
        const x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = matrix[i][n];
            for (let j = i + 1; j < n; j++) sum -= matrix[i][j] * x[j];
            x[i] = sum / matrix[i][i];
        }
    
        steps.final = x.map((val, idx) => toFraction(val));
        return steps;
    }
    
    function formatFinalSystem(matrix) {
        const equations = [];
        for (let i = 0; i < matrix.length; i++) {
            let equation = '<div class="final-equation">';
            for (let j = 0; j < matrix[i].length - 1; j++) {
                const coef = toFraction(matrix[i][j]);
                if (coef !== "0") {
                    if (j > 0 && matrix[i][j] > 0) equation += ' + ';
                    equation += `${coef}<span>x<sub>${j + 1}</sub></span>`;
                }
            }
            equation += ` = ${toFraction(matrix[i][matrix[i].length - 1])}</div>`;
            equations.push(equation);
        }
        return equations;
    }

    function formatFinalSystem(matrix) {
        const equations = [];
        for (let i = 0; i < matrix.length; i++) {
            let equation = '<div class="final-equation">';
            for (let j = 0; j < matrix[i].length - 1; j++) {
                let coef = matrix[i][j];
                if (isNaN(coef) || coef === undefined || coef === null) {
                    console.warn(`Invalid coefficient at matrix[${i}][${j}]:`, coef);
                    coef = 0; // Replace invalid values with 0
                }
                // Convert to fraction only after applying Math.abs if needed
                coef = toFraction(j === 0 ? coef : Math.abs(coef));
                
                if (coef !== "0") {
                    if (j > 0 && matrix[i][j] > 0) equation += '<div class="operator">+</div>';
                    else if (j > 0 && matrix[i][j] < 0) equation += '<div class="operator">-</div>';
                    
                    equation += `<div class="term">${coef}x<sub>${j + 1}</sub></div>`;
                }
            }
            let result = matrix[i][matrix[i].length - 1];
            if (isNaN(result) || result === undefined || result === null) {
                console.warn(`Invalid result at matrix[${i}][${matrix[i].length - 1}]:`, result);
                result = 0; // Replace invalid results with 0
            }
            equation += `<div class="operator">=</div><div class="term">${toFraction(result)}</div>`;
            equation += '</div>';
            equations.push(equation);
        }
        return equations;
    }
    
    
    function displayFinalEquations(equations) {
        finalEquationsDisplay.innerHTML = equations.join('');
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
        if (isNaN(decimal) || decimal === undefined || decimal === null) {
            console.warn("Invalid decimal value in toFraction:", decimal);
            return ''; // Return empty string for invalid numbers
        }
    
        const tolerance = 1e-10;
        let numerator = 1;
        let denominator = 1;
    
        if (decimal === Math.floor(decimal)) return decimal.toString(); // Return whole numbers as is
    
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
    
        // If denominator > 25 or denominator == 10, return rounded decimal
        if (denominator > 25 || denominator === 10) {
            return (Math.round(decimal * 100000) / 100000).toString(); // Round to 5 decimal places
        }
    
        if (denominator === 1) {
            return numerator.toString(); // Return as a whole number if denominator is 1
        } else {
            return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
        }
    }
    
    
});
