// Define the 10x10 grid representing a simplified Stanford campus
const grid = [
    ['dorm', 'dorm', 'class', 'class', 'outside', 'outside', 'dining', 'dining', 'class', 'dorm'],
    ['dining', 'outside', 'class', 'dorm', 'dorm', 'class', 'outside', 'dining', 'dorm', 'outside'],
    ['class', 'class', 'dorm', 'dorm', 'outside', 'dining', 'dining', 'outside', 'class', 'class'],
    ['outside', 'dining', 'dorm', 'class', 'class', 'dorm', 'outside', 'dining', 'dorm', 'outside'],
    ['dorm', 'dorm', 'class', 'outside', 'dining', 'dining', 'outside', 'class', 'dorm', 'dorm'],
    ['class', 'outside', 'dining', 'dorm', 'dorm', 'class', 'outside', 'dining', 'class', 'outside'],
    ['dining', 'dining', 'outside', 'class', 'dorm', 'dorm', 'class', 'outside', 'dining', 'dining'],
    ['outside', 'class', 'dorm', 'dining', 'outside', 'dining', 'dorm', 'class', 'outside', 'class'],
    ['dorm', 'dorm', 'class', 'outside', 'dining', 'outside', 'class', 'dorm', 'dorm', 'outside'],
    ['class', 'outside', 'dining', 'dorm', 'class', 'dining', 'outside', 'class', 'dorm', 'dorm']
];

// Logistic regression coefficients (tuned for realistic probabilities)
const beta0 = -5;    // Baseline log-odds
const beta1 = 0.5;   // Dorm (high risk)
const beta2 = 0.3;   // Classroom (moderate risk)
const beta3 = 0.4;   // Dining hall (higher risk)
const beta4 = 0.1;   // Outside (low risk)

// Track total time spent in each location type
let totalTime = {
    dorm: 0,
    class: 0,
    dining: 0,
    outside: 0
};

// Populate the grid dynamically
const tbody = document.querySelector('#campus-grid tbody');
grid.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cellType => {
        const td = document.createElement('td');
        td.className = cellType;
        tr.appendChild(td);
    });
    tbody.appendChild(tr);
});

// Update the display of total time
function updateTotals() {
    document.getElementById('total-dorm').textContent = totalTime.dorm;
    document.getElementById('total-class').textContent = totalTime.class;
    document.getElementById('total-dining').textContent = totalTime.dining;
    document.getElementById('total-outside').textContent = totalTime.outside;
}

// Calculate and update the flu probability using logistic regression
function updateProbability() {
    const logOdds = beta0 + 
                    beta1 * totalTime.dorm + 
                    beta2 * totalTime.class + 
                    beta3 * totalTime.dining + 
                    beta4 * totalTime.outside;
    const probability = 1 / (1 + Math.exp(-logOdds));
    document.getElementById('probability').textContent = (probability * 100).toFixed(2);
}

// Add click events to grid cells
document.querySelectorAll('#campus-grid td').forEach(cell => {
    cell.addEventListener('click', () => {
        const type = cell.className;
        totalTime[type] += 1;
        updateTotals();
        updateProbability();
    });
});

// Reset button functionality
document.getElementById('reset').addEventListener('click', () => {
    for (let key in totalTime) {
        totalTime[key] = 0;
    }
    updateTotals();
    updateProbability();
});

// Initialize the display
updateTotals();
updateProbability();
