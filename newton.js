document.getElementById('newton-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formula = document.getElementById('formula').value;
    const xi = parseFloat(document.getElementById('xi').value);
    const stoppingType = document.getElementById('stopping-newton').value;
    const stoppingValue = parseFloat(document.getElementById('stopping-newton-value').value);

    try {
        // Calculate and display the derivative symbolically
        const derivative = calculateSymbolicDerivative(formula);
        displayDerivative(derivative);

        // Run the Newton-Raphson method and display results
        const result = newtonMethod(formula, xi, stoppingType, stoppingValue, derivative);
        displayResults(result);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

function calculateSymbolicDerivative(formula) {
    try {
        const parsedFormula = math.parse(formula);
        const derivative = math.derivative(parsedFormula, 'x');
        return derivative.toString(); // Return the derivative as a symbolic string
    } catch (error) {
        throw new Error('Invalid formula for differentiation.');
    }
}

function displayDerivative(derivative) {
    const derivativeDiv = document.getElementById('derivative-result');
    derivativeDiv.innerHTML = ''; // Clear previous content

    // Create a new div to display the derivative in a nice format
    const derivativeElement = document.createElement('div');
    derivativeElement.innerHTML = `<strong>Derivative:</strong> ${derivative}`;
    derivativeElement.style.marginBottom = '20px';  // Add some spacing

    derivativeDiv.appendChild(derivativeElement);
}

function evaluateFormula(formula, x) {
    try {
        return math.evaluate(formula, { x: x });
    } catch (e) {
        throw new Error('Invalid formula. Please ensure correct syntax.');
    }
}

function newtonMethod(formula, xi, stoppingType, stoppingValue, derivativeFormula) {
    let ea = Infinity; // Start with infinite error
    let iteration = 1;
    let maxIterations = 100;
    let es = 0;
    let prev_xi = xi;

    // Set stopping conditions based on significant digits or error threshold
    if (stoppingType === 'digits') {
        es = 0.5 * Math.pow(10, 2 - stoppingValue);
    } else if (stoppingType === 'error') {
        es = stoppingValue;
    } else if (stoppingType === 'iterations') {
        maxIterations = stoppingValue;
    }

    const output = [];

    // Newton-Raphson iteration
    while (ea > es && iteration <= maxIterations) {
        const f_xi = evaluateFormula(formula, xi);
        const f_prime_xi = evaluateFormula(derivativeFormula, xi);

        if (iteration > 1) {
            ea = Math.abs((prev_xi - xi) / xi) * 100;
        }
        if (f_prime_xi === 0) {
            throw new Error('Derivative became zero. Cannot continue.');
        }

        const new_xi = xi - (f_xi / f_prime_xi);

        // Calculate approximate error only after the first iteration


        // Push the result for this iteration
        output.push({
            iteration,
            xi: xi.toFixed(6),
            f_xi: f_xi.toFixed(6),
            f_prime_xi: f_prime_xi.toFixed(6),
            ea: iteration === 1 ? "-------" : ea.toFixed(6)
        });

        // Update xi for the next iteration
        prev_xi = xi;
        xi = new_xi;
        iteration++;

        // Check stopping condition
        if (ea <= es || iteration > maxIterations) break;
    }

    return output;
}

function evaluateFormula(formula, x) {
    try {
        return math.evaluate(formula, { x: x });
    } catch (e) {
        throw new Error('Invalid formula. Please ensure correct syntax.');
    }
}

function displayResults(result) {
    const resultDiv = document.getElementById('newton-result');
    resultDiv.innerHTML = ''; // Clear previous results

    const table = document.createElement('table');
    const header = table.insertRow();
    header.innerHTML = '<th>Iteration</th><th>X<sub>i</sub></th><th>f(X<sub>i</sub>)</th><th>f\'(X<sub>i</sub>)</th><th>Approximate Error (%)</th>';

    result.forEach(row => {
        const newRow = table.insertRow();
        newRow.innerHTML = `<td>${row.iteration}</td><td>${row.xi}</td><td>${row.f_xi}</td><td>${row.f_prime_xi}</td><td>${row.ea}</td>`;
    });

    resultDiv.appendChild(table);
}



// Function to display results in a table
function displayResults(result) {
    const resultDiv = document.getElementById('newton-result');
    resultDiv.innerHTML = ''; // Clear previous results

    const table = document.createElement('table');
    const header = table.insertRow();
    header.innerHTML = '<th>Iteration</th><th>X<sub>i</sub></th><th>f(X<sub>i</sub>)</th><th>f\'(X<sub>i</sub>)</th><th>Approximate Error (%)</th>';

    result.forEach(row => {
        const newRow = table.insertRow();
        newRow.innerHTML = `<td>${row.iteration}</td><td>${row.xi}</td><td>${row.f_xi}</td><td>${row.f_prime_xi}</td><td>${row.ea}</td>`;
    });

    resultDiv.appendChild(table);
}
