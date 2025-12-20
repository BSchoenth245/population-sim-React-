# Population Simulation

A React-based simulation suite containing two distinct models:
1. **Population Dynamics Simulator** (App.js) - Models population growth with resource constraints
2. **Temperature & Agriculture Simulator** (TempTest.js) - Models seasonal climate and crop production

## Switching Between Simulations

To switch which simulation runs:

1. **Open** `/src/index.js`
2. **Change the import line** from:
   ```javascript
   import App from './TempTest';  // Currently running TempTest
   ```
   **To:**
   ```javascript
   import App from './App';      // Switch to population simulation
   ```
3. **Save the file** - the app will automatically reload

## Population Dynamics Simulation (App.js)

### Mathematical Model

This simulation implements a discrete-time population model with resource constraints, combining elements from the logistic growth model and predator-prey dynamics.

#### Core Equations

**Population Change per Tick:**
```
New Population = Current Population + Births - Deaths
```

**Birth Calculation:**
```
Births = Population × Birth Rate
```

**Death Calculation (Resource-Dependent):**
```
Resources per Individual = Available Resources ÷ Population

If Resources per Individual < Consumption per Individual:
    Death Rate Multiplier = Death Rate ÷ Resources per Individual
    Deaths = Population × Death Rate Multiplier
Else:
    Deaths = Population × Death Rate
```

**Resource Dynamics:**
```
Consumption = min(Population × Consumption per Individual, Available Resources)
New Resources = Available Resources - Consumption

If (Tick Count % Regeneration Interval == 0):
    Regenerated Resources = min(New Resources + Regeneration Amount, Max Capacity)
```

#### Key Mathematical Concepts

1. **Exponential Growth**: When resources are abundant, population grows exponentially at the birth rate
2. **Resource Limitation**: As resources become scarce, death rates increase inversely proportional to resource availability
3. **Carrying Capacity**: The maximum sustainable population is determined by resource regeneration vs. consumption rates
4. **Oscillatory Dynamics**: The system can exhibit boom-bust cycles when population overshoots carrying capacity

#### Equilibrium Analysis

The system reaches equilibrium when:
```
Birth Rate × Population = Death Rate × Population
Resource Regeneration = Resource Consumption
```

At equilibrium:
```
Sustainable Population ≈ (Regeneration Amount × Regeneration Frequency) ÷ Consumption per Individual
```

### Population Simulation Features

- **Real-time Simulation**: Watch population dynamics unfold in real-time
- **Interactive Parameters**: Adjust birth rates, death rates, consumption, and resource regeneration
- **Visual Analytics**: Line chart showing population and resource trends over time
- **Step-by-Step Mode**: Run individual simulation ticks for detailed analysis
- **Reset Functionality**: Return to initial conditions at any time

## Temperature & Agriculture Simulation (TempTest.js)

### Mathematical Model

This simulation models the relationship between seasonal temperature patterns and agricultural food production over multiple years.

#### Core Equations

**Seasonal Temperature Baseline:**
```
Annual Wave = Annual Mean + Annual Amplitude × sin(2π × (Day Progress - 0.25))
Seasonal Baseline = Annual Wave + Season Offset + Intra-Season Variation
```

**Daily Temperature:**
```
Final Temperature = Seasonal Baseline + Daily Oscillation + Weather Noise + Extreme Events
```

**Crop Growth (Gaussian Distribution):**
```
Growth Rate = Min Growth + Max Growth × e^(-(Temperature - Optimal)² / (2 × Tolerance²))
```

**Food Stock Dynamics:**
```
Daily Growth = Growth Rate based on current temperature
Daily Consumption = Fixed consumption rate
New Food Stock = Previous Stock + Growth - Consumption
```

#### Key Mathematical Concepts

1. **Seasonal Continuity**: Uses continuous sine waves to ensure smooth temperature transitions between seasons
2. **Bell Curve Growth**: Crop production follows a Gaussian distribution centered on optimal temperature
3. **Multi-Layer Climate**: Temperature combines seasonal patterns, daily cycles, weather noise, and rare extreme events
4. **Resource Management**: Food production must balance growth (temperature-dependent) with consumption (constant)

#### Temperature Components

1. **Seasonal Baseline**: Long-term climate patterns following annual cycles
2. **Daily Oscillation**: Day/night temperature variations
3. **Weather Noise**: Multi-day weather systems and short-term fronts
4. **Extreme Events**: Rare heat waves (summer) and cold snaps (winter)

### Temperature Simulation Features

- **Multi-Year Climate**: Simulates 2+ years of daily temperature data
- **Seasonal Visualization**: Color-coded background showing winter, spring, summer, fall
- **Dual Charts**: Side-by-side temperature and food stock tracking
- **Growth Curve Analysis**: Interactive chart showing crop productivity vs. temperature
- **Time Scrubber**: Navigate through any day in the simulation
- **Climate Regeneration**: Generate new random weather patterns

### Agricultural Parameters

| Parameter ------------| Value --------| Description -------------------------------------|
|-----------------------|---------------|--------------------------------------------------|
| Optimal Temperature --| 72°F ---------| Temperature for maximum crop growth -------------|
| Temperature Tolerance | 12°F ---------| How forgiving crops are to temperature deviation |
| Maximum Growth -------| 8 units/day --| Peak food production at optimal temperature -----|
| Minimum Growth -------| 0.2 units/day | Baseline production in poor conditions ----------|
| Daily Consumption ----| 5 units/day --| Fixed food consumption rate ---------------------|

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/population-sim(React)
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The simulation will load automatically

### Dependencies

- **React 19.2.1**: Core framework
- **Recharts 3.5.1**: Data visualization library for charts
- **React Scripts 5.0.1**: Build and development tools

## Usage

### Population Simulation Controls

- **Run One Tick**: Execute a single simulation step
- **Start/Stop**: Toggle continuous simulation (updates every 300ms)
- **Reset**: Return to initial conditions
- **☰ Menu**: Show/hide parameter adjustment sliders

### Temperature Simulation Controls

- **Generate New Climate**: Create a new random weather pattern
- **Time Scrubber**: Drag to navigate through any day in the simulation
- **Interactive Charts**: Hover for detailed information at any point

### Adjustable Parameters (Population Sim)

| Parameter | Range | Description |
|-----------|-------|-------------|
| Birth Rate | 1% - 50% | Probability of reproduction per individual per tick |
| Death Rate | 1% - 50% | Base mortality rate per individual per tick |
| Consumption per Individual | 1 - 5 | Resources consumed per individual per tick |
| Resource Regeneration Amount | 100 - 1000 | Resources added every regeneration interval |
| Regeneration Interval | 1 - 10 ticks | Frequency of resource regeneration |
| Max Resource Capacity | 500 - 5000 | Environmental carrying capacity |

## Experimental Scenarios

### Population Dynamics

1. **Stable Growth**: Birth Rate = 12%, Death Rate = 10%, Consumption = 1
2. **Boom-Bust Cycles**: Birth Rate = 20%, Death Rate = 5%, Consumption = 2
3. **Resource Crisis**: Birth Rate = 15%, Consumption = 3, Regeneration = 200
4. **Sustainable Equilibrium**: Birth Rate = 10%, Death Rate = 10%, Consumption = 1.5

### Climate & Agriculture

1. **Observe seasonal patterns**: Note how temperature cycles affect food production
2. **Identify optimal periods**: Find seasons with best crop growth
3. **Analyze extreme events**: See how heat waves and cold snaps impact food security
4. **Compare years**: Generate multiple climate patterns to see variability

## File Structure

```
src/
├── App.js          # Population dynamics simulation
├── TempTest.js     # Temperature & agriculture simulation
├── index.js        # Entry point (controls which sim runs)
└── index.css       # Basic styling
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder ready for deployment.

## Mathematical Extensions

These models could be extended with:

**Population Model:**
- Age-structured populations
- Spatial dynamics (migration)
- Multiple resource types
- Environmental stochasticity
- Genetic algorithms for parameter optimization

**Climate Model:**
- Multi-year climate cycles (El Niño, La Niña)
- Climate change trends
- Multiple crop types with different temperature preferences
- Soil moisture and precipitation
- Pest and disease pressure

## License

This project is open source and available under the MIT License.