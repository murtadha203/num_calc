document.getElementById('secant-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formula = document.getElementById('formula').value;
    const xi = parseFloat(document.getElementById('xi').value);      // x(i)
    const x_prev = parseFloat(document.getElementById('x_prev').value);  // x(i-1)
    const stoppingType = document.getElementById('stopping-secant').value;
    const stoppingValue = parseFloat(document.getElementById('stopping-secant-value').value);

    try {
        const result = secantMethod(formula, x_prev, xi, stoppingType, stoppingValue);

        const resultDiv = document.getElementById('secant-result');
        resultDiv.innerHTML = ''; // Clear previous results

        const table = document.createElement('table');
        const header = table.insertRow();
        header.innerHTML = '<th>Iteration</th><th>x<sub>i-1</sub></th><th>x<sub>i</sub></th><th>f(x<sub>i-1</sub>)</th><th>f(x<sub>i</sub>)</th><th>Approximate Error (%)</th>';


        result.forEach(row => {
            const newRow = table.insertRow();
            newRow.innerHTML = `<td>${row.iteration}</td><td>${row.x_prev}</td><td>${row.xi}</td><td>${row.f_x_prev}</td><td>${row.f_xi}</td><td>${row.ea}</td>`;
        });

        resultDiv.appendChild(table);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

function secantMethod(formula, x_prev, xi, stoppingType, stoppingValue) {
    // Function to evaluate the formula
    const evaluateFormula = (formula, x) => {
        try {
            let parsedFormula = formula
                .replace(/(\d)([a-zA-Z])/g, '$1*$2')   // Handle implicit multiplication (e.g., 2x becomes 2*x)
                .replace(/(\))(\()/g, '$1*$2')        // Handle cases like (x+1)(x-1) -> (x+1)*(x-1)
                .replace(/\^/g, '**')                 // Replace ^ with ** for exponentiation
                .replace(/exp/g, 'Math.exp')          // Replace exp with Math.exp for JavaScript
                .replace(/cos/g, 'Math.cos')          // Replace cos with Math.cos
                .replace(/sin/g, 'Math.sin')          // Replace sin with Math.sin
                .replace(/tan/g, 'Math.tan')          // Replace tan with Math.tan
                .replace(/pi/g, 'Math.PI')            // Replace pi with Math.PI
                .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'Math.E'); // Replace e with Math.E for JavaScript

            // Safely evaluate the formula for the given x value
            return new Function('x', `return ${parsedFormula}`)(x);
        } catch (e) {
            throw new Error('Invalid formula. Please ensure correct syntax.');
        }
    };

    let ea = 100;
    let iteration = 1;
    let maxIterations = 100;
    let es = 0;

    // Set stopping conditions
    if (stoppingType === 'digits') {
        es = 0.5 * Math.pow(10, 2 - stoppingValue);
    } else if (stoppingType === 'error') {
        es = stoppingValue;
    } else if (stoppingType === 'iterations') {
        maxIterations = stoppingValue;
    }

    const output = [];

    // Secant method iteration
    while (ea > es && iteration <= maxIterations) {
        const f_x_prev = evaluateFormula(formula, x_prev);
        const f_xi = evaluateFormula(formula, xi);

        if (f_xi === f_x_prev) {
            throw new Error('Division by zero error in Secant Method.');
        }

        const x_new = xi - (f_xi * (xi - x_prev)) / (f_xi - f_x_prev);

        // Calculate approximate error
        let eaFormatted = "-------";  // No error on first iteration
        if (iteration > 1) {
            ea = Math.abs((x_new - xi) / x_new) * 100;
            eaFormatted = ea.toFixed(6);  // Format the error value
        }

        // Push the result for this iteration
        output.push({
            iteration,
            x_prev: x_prev.toFixed(6),
            xi: xi.toFixed(6),
            f_x_prev: f_x_prev.toFixed(6),
            f_xi: f_xi.toFixed(6),
            ea: eaFormatted
        });

        // Update values for the next iteration
        x_prev = xi;
        xi = x_new;
        iteration++;

        // Check stopping condition
        if (ea <= es || iteration > maxIterations) break;
    }

    return output;
}
