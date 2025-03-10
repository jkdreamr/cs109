import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from sklearn.linear_model import LogisticRegression

# 🌲 Stanford Flu Simulation Settings
grid_size = 50  # 50x50 campus grid
num_time_steps = 50  # How long we simulate
recovery_prob = 0.1  # Chance to recover each step

# 🏡 Define campus areas (0: Dorms, 1: Classrooms, 2: Dining Halls, 3: Outdoor)
areas = np.zeros((grid_size, grid_size), dtype=int)
areas[:grid_size//2, :grid_size//2] = 0  # Dorms
areas[:grid_size//2, grid_size//2:] = 1  # Classrooms
areas[grid_size//2:, :grid_size//2] = 2  # Dining Halls
areas[grid_size//2:, grid_size//2:] = 3  # Outdoor

# 🦠 Base infection rates for each area
base_rates = {0: 0.2, 1: 0.1, 2: 0.15, 3: 0.05}  # Dorms highest, Outdoor lowest

# 💉 Vaccination rate (30% of peeps are vaccinated)
vaccination_rate = 0.3
vaccinated = np.random.choice([0, 1], size=(grid_size, grid_size), p=[1-vaccination_rate, vaccination_rate])

# 🤓 Train Logistic Regression Model
def generate_training_data(n_samples=10000):
    X_train, y_train = [], []
    for _ in range(n_samples):
        area = np.random.choice([0, 1, 2, 3])
        base_rate = base_rates[area]
        num_infected_neighbors = np.random.randint(0, 9)
        vacc_status = np.random.choice([0, 1])
        # Fake log-odds: tweak these for fun!
        log_odds = -3 + 5 * base_rate + 0.5 * num_infected_neighbors - 2 * vacc_status
        p = 1 / (1 + np.exp(-log_odds))
        infected = np.random.binomial(1, p)
        X_train.append([base_rate, num_infected_neighbors, vacc_status])
        y_train.append(infected)
    return np.array(X_train), np.array(y_train)

X_train, y_train = generate_training_data()
model = LogisticRegression()
model.fit(X_train, y_train)

# 👥 Count infected neighbors
def count_infected_neighbors(grid, i, j):
    count = 0
    for di in [-1, 0, 1]:
        for dj in [-1, 0, 1]:
            if di == 0 and dj == 0:
                continue
            ni, nj = i + di, j + dj
            if 0 <= ni < grid_size and 0 <= nj < grid_size and grid[ni, nj] == 1:
                count += 1
    return count

# 🏃‍♂️ Run the Simulation
population = np.zeros((grid_size, grid_size), dtype=int)  # 0: susceptible, 1: infected, 2: recovered
population[grid_size//2, grid_size//2] = 1  # Start with one sick Cardinal

susceptible_counts, infected_counts, recovered_counts = [], [], []

for t in range(num_time_steps):
    new_infections = np.zeros_like(population)
    for i in range(grid_size):
        for j in range(grid_size):
            if population[i, j] == 0:  # If susceptible
                area = areas[i, j]
                base_rate = base_rates[area]
                num_infected_neighbors = count_infected_neighbors(population, i, j)
                vacc_status = vaccinated[i, j]
                features = [base_rate, num_infected_neighbors, vacc_status]
                p_infection = model.predict_proba([features])[0][1]
                if np.random.random() < p_infection:
                    new_infections[i, j] = 1
    population[new_infections == 1] = 1
    recoveries = (population == 1) & (np.random.random((grid_size, grid_size)) < recovery_prob)
    population[recoveries] = 2
    susceptible_counts.append(np.sum(population == 0))
    infected_counts.append(np.sum(population == 1))
    recovered_counts.append(np.sum(population == 2))

# 📊 Make Cute Plots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))

# Grid Plot
state_map = {0: 0, 1: 1, 2: 2}
numerical_grid = np.vectorize(state_map.get)(population)
cmap = ListedColormap(['#87CEEB', '#FF4040', '#32CD32'])  # Blue, Red, Green
ax1.imshow(numerical_grid, cmap=cmap)
ax1.axhline(y=grid_size//2 - 0.5, color='white', linewidth=2)
ax1.axvline(x=grid_size//2 - 0.5, color='white', linewidth=2)
ax1.text(grid_size//4, grid_size//4, 'Dorms', color='white', fontsize=12, ha='center')
ax1.text(3*grid_size//4, grid_size//4, 'Classrooms', color='white', fontsize=12, ha='center')
ax1.text(grid_size//4, 3*grid_size//4, 'Dining Halls', color='white', fontsize=12, ha='center')
ax1.text(3*grid_size//4, 3*grid_size//4, 'Outdoor', color='white', fontsize=12, ha='center')
ax1.set_title('Stanford Flu Spread 🌡️')

# Time Series Plot
ax2.plot(susceptible_counts, label='Susceptible', color='#87CEEB')
ax2.plot(infected_counts, label='Infected', color='#FF4040')
ax2.plot(recovered_counts, label='Recovered', color='#32CD32')
ax2.legend()
ax2.set_xlabel('Time')
ax2.set_ylabel('Count')
ax2.set_title('Flu Over Time 📈')

plt.tight_layout()
plt.savefig('stanford_flu_simulation.png')
plt.show()
