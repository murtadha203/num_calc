document.getElementById('bisection-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formula = document.getElementById('formula').value;
    const xl = parseFloat(document.getElementById('xl').value);
    const xk = parseFloat(document.getElementById('xk').value);
    const stoppingType = document.getElementById('stopping-bisection').value;
    const stoppingValue = parseFloat(document.getElementById('stopping-bisection-value').value);

    try {
        const result = bisectionMethod(formula, xl, xk, stoppingType, stoppingValue);

        const resultDiv = document.getElementById('bisection-result');
        resultDiv.innerHTML = ''; // Clear previous results

        const table = document.createElement('table');
        const header = table.insertRow();
        header.innerHTML = '<th>Iteration</th><th>xi</th><th>xk</th><th>xr</th><th>f(xi)</th><th>f(xk)</th><th>f(xr)</th><th>Approximate Error (%)</th>';

        result.forEach(row => {
            const newRow = table.insertRow();
            newRow.innerHTML = `<td>${row.iteration}</td><td>${row.xi}</td><td>${row.xk}</td><td>${row.xr}</td><td>${row.f_xi}</td><td>${row.f_xk}</td><td>${row.f_xr}</td><td>${row.ea}</td>`;
        });

        resultDiv.appendChild(table);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

function bisectionMethod(formula, xl, xk, stoppingType, stoppingValue) {
    // Parse and evaluate the formula safely
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

    let xr = (xl + xk) / 2;
    let ea = 100;
    let iteration = 1;  // Start iteration count from 1
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

    // Calculate the initial values for the first row
    let f_xi = evaluateFormula(formula, xl);
    let f_xk = evaluateFormula(formula, xk);
    let f_xr = evaluateFormula(formula, xr);

    // Push the first iteration result before entering the loop
    output.push({
        iteration,
        xi: xl.toFixed(6),
        xk: xk.toFixed(6),
        xr: xr.toFixed(6),
        f_xi: f_xi.toFixed(6),
        f_xk: f_xk.toFixed(6),
        f_xr: f_xr.toFixed(6),
        ea: "N/A"  // No error on the first calculation
    });

    // Iterate until the stopping condition is met
    while (ea > es && iteration < maxIterations) {
        iteration++;

        const old_xr = xr;

        // Check where the root is and update xi or xk accordingly
        if (f_xi * f_xr < 0) {
            xk = xr;  // Root lies between xi and xr, so update xk
            f_xk = f_xr;  // Update f_xk since xk has changed
        } else if (f_xr * f_xk < 0) {
            xl = xr;  // Root lies between xr and xk, so update xi
            f_xi = f_xr;  // Update f_xi since xi has changed
        } else {
            break; // Exact root found
        }

        // Recalculate midpoint and function values
        xr = (xl + xk) / 2;
        f_xr = evaluateFormula(formula, xr);

        // Calculate the approximate error
        ea = Math.abs((xr - old_xr) / xr) * 100;

        // Push the result for this iteration
        output.push({
            iteration,
            xi: xl.toFixed(6),
            xk: xk.toFixed(6),
            xr: xr.toFixed(6),
            f_xi: f_xi.toFixed(6),
            f_xk: f_xk.toFixed(6),
            f_xr: f_xr.toFixed(6),
            ea: ea.toFixed(6)
        });

        // Check stopping condition
        if (ea <= es) break;
    }

    return output;
}
