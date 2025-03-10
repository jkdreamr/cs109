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

// Track history of locations visited
let history = [];

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

// Function to compute cumulative probability P from totals
function computeP(totals) {
    const logOdds = beta0 + 
                    beta1 * totals.dorm + 
                    beta2 * totals.class + 
                    beta3 * totals.dining + 
                    beta4 * totals.outside;
    return 1 / (1 + Math.exp(-logOdds));
}

// Function to update display
function updateDisplay(totals, P) {
    document.getElementById('total-dorm').textContent = totals.dorm;
    document.getElementById('total-class').textContent = totals.class;
    document.getElementById('total-dining').textContent = totals.dining;
    document.getElementById('total-outside').textContent = totals.outside;
    document.getElementById('probability').textContent = (P * 100).toFixed(2);
}

// Function to simulate flu risk
function simulateFluRisk() {
    const k = Math.min(history.length, 5); // Window size: last 5 hours or less
    const lastK = history.slice(-k); // Get the last k locations
    const totals = {
        dorm: lastK.filter(loc => loc === 'dorm').length,
        class: lastK.filter(loc => loc === 'class').length,
        dining: lastK.filter(loc => loc === 'dining').length,
        outside: lastK.filter(loc => loc === 'outside').length
    };
    const P = computeP(totals); // Probability over the k-hour period
    const p_hour = k > 0 ? 1 - Math.pow(1 - P, 1 / k) : 0; // Per-hour probability
    const r = Math.random();
    if (r < p_hour) {
        alert('YOU GOT THE STANFORD FLU');
        resetSimulation();
    } else {
        updateDisplay(totals, P);
    }
}

// Function to reset simulation
function resetSimulation() {
    history = [];
    const totals = { dorm: 0, class: 0, dining: 0, outside: 0 };
    const P = computeP(totals);
    updateDisplay(totals, P);
}

// Add click events to grid cells
document.querySelectorAll('#campus-grid td').forEach(cell => {
    cell.addEventListener('click', () => {
        const type = cell.className;
        history.push(type); // Add the clicked location to history
        simulateFluRisk();
    });
});

// Reset button functionality
document.getElementById('reset').addEventListener('click', resetSimulation);

// Initialize the display
resetSimulation();
