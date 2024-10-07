document.getElementById('taylor-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const x = parseFloat(eval(document.getElementById('x').value.replace('pi', 'Math.PI')));
    const x = parseFloat(eval(document.getElementById('x').value.replace('Pi', 'Math.PI')));
    const funcType = document.getElementById('function-type').value;
    const stoppingType = document.getElementById('stopping-condition').value;
    const stoppingValue = parseFloat(document.getElementById('stopping-value').value);

    const result = calculateTaylorError(x, funcType, stoppingType, stoppingValue);

    const resultDiv = document.getElementById('taylor-result');
    resultDiv.innerHTML = ''; // Clear previous results

    const table = document.createElement('table');
    const header = table.insertRow();
    header.innerHTML = '<th>Iteration</th><th>Result</th><th>True Error (%)</th><th>Approximate Error (%)</th>';

    result.forEach(row => {
        const newRow = table.insertRow();
        newRow.innerHTML = `<td>${row.iteration}</td><td>${row.result}</td><td>${row.et}</td><td>${row.ea}</td>`;
    });

    resultDiv.appendChild(table);
});

function calculateTaylorError(x, funcType, stoppingType, stoppingValue) {
    const findFactorial = (n) => n <= 1 ? 1 : n * findFactorial(n - 1);

    const calculateErrors = (tResult, result) => Math.abs((tResult - result) / tResult) * 100;

    const calculateApproximateError = (result, preResult) => {
        return preResult === 0 ? Infinity : Math.abs((result - preResult) / result) * 100;
    };

    const tResult = {
        exp: Math.exp(x),
        cos: Math.cos(x),
        sin: Math.sin(x)
    }[funcType];

    let result = 0, preResult = 0, output = [];
    let it = 100, es = 0;

    // Set stopping conditions
    if (stoppingType === 'digits') {
        es = 0.5 * Math.pow(10, 2 - stoppingValue);
    } else if (stoppingType === 'error') {
        es = stoppingValue;
    } else if (stoppingType === 'iterations') {
        it = stoppingValue;
    }

    for (let i = 0; i < it; i++) {
        let term = 0;

        // Adjust the term calculation based on the function type
        if (funcType === 'exp') {
            term = Math.pow(x, i) / findFactorial(i);
        } else if (funcType === 'sin') {
            if (i % 2 !== 0) { // Odd powers for sine
                term = Math.pow(x, i) / findFactorial(i);
                if ((i - 1) % 4 !== 0) term = -term; // Alternate signs
            } else {
                continue; // Skip even terms for sine
            }
        } else if (funcType === 'cos') {
            if (i % 2 === 0) { // Even powers for cosine
                term = Math.pow(x, i) / findFactorial(i);
                if (i % 4 !== 0) term = -term; // Alternate signs
            } else {
                continue; // Skip odd terms for cosine
            }
        }

        preResult = result;
        result += term;
        const et = calculateErrors(tResult, result);
        const ea = calculateApproximateError(result, preResult);

        output.push({ iteration: i, result: result.toFixed(5), et: et.toFixed(5), ea: ea.toFixed(5) });

        if (ea < es) break;
    }

    return output;
}
