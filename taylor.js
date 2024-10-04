document.getElementById('taylor-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const x = parseFloat(eval(document.getElementById('x').value.replace('pi', 'Math.PI')));
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

    const functions = {
        exp: Math.exp,
        cos: Math.cos,
        sin: Math.sin
    };

    const tResult = functions[funcType](x);
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
        const term = Math.pow(x, i) / findFactorial(i);
        preResult = result;
        result += term;
        const et = calculateErrors(tResult, result);
        const ea = calculateApproximateError(result, preResult);

        output.push({ iteration: i, result: result.toFixed(5), et: et.toFixed(5), ea: ea.toFixed(5) });

        if (ea < es) break;
    }

    return output;
}
