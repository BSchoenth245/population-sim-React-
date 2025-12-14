# Population Simulation

A React-based population dynamics simulator that models the relationship between population growth, resource consumption, and environmental carrying capacity using mathematical equations inspired by ecological modeling.

## Mathematical Model

This simulation implements a discrete-time population model with resource constraints, combining elements from the logistic growth model and predator-prey dynamics.

### Core Equations

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

### Key Mathematical Concepts

1. **Exponential Growth**: When resources are abundant, population grows exponentially at the birth rate
2. **Resource Limitation**: As resources become scarce, death rates increase inversely proportional to resource availability
3. **Carrying Capacity**: The maximum sustainable population is determined by resource regeneration vs. consumption rates
4. **Oscillatory Dynamics**: The system can exhibit boom-bust cycles when population overshoots carrying capacity

### Equilibrium Analysis

The system reaches equilibrium when:
```
Birth Rate × Population = Death Rate × Population
Resource Regeneration = Resource Consumption
```

At equilibrium:
```
Sustainable Population ≈ (Regeneration Amount × Regeneration Frequency) ÷ Consumption per Individual
```

## Features

- **Real-time Simulation**: Watch population dynamics unfold in real-time
- **Interactive Parameters**: Adjust birth rates, death rates, consumption, and resource regeneration
- **Visual Analytics**: Line chart showing population and resource trends over time
- **Step-by-Step Mode**: Run individual simulation ticks for detailed analysis
- **Reset Functionality**: Return to initial conditions at any time

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
- **Recharts 3.5.1**: Data visualization library for the population/resource chart
- **React Scripts 5.0.1**: Build and development tools

## Usage

### Basic Controls

- **Run One Tick**: Execute a single simulation step
- **Start/Stop**: Toggle continuous simulation (updates every 300ms)
- **Reset**: Return to initial conditions
- **☰ Menu**: Show/hide parameter adjustment sliders

### Adjustable Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| Birth Rate | 1% - 50% | Probability of reproduction per individual per tick |
| Death Rate | 1% - 50% | Base mortality rate per individual per tick |
| Consumption per Individual | 1 - 5 | Resources consumed per individual per tick |
| Resource Regeneration Amount | 100 - 1000 | Resources added every regeneration interval |
| Regeneration Interval | 1 - 10 ticks | Frequency of resource regeneration |
| Max Resource Capacity | 500 - 5000 | Environmental carrying capacity |

### Initial Conditions

- **Starting Population**: 100 individuals
- **Starting Resources**: 450 units
- **Default Birth Rate**: 12%
- **Default Death Rate**: 10%

## Experimental Scenarios

Try these parameter combinations to observe different dynamics:

1. **Stable Growth**: Birth Rate = 12%, Death Rate = 10%, Consumption = 1
2. **Boom-Bust Cycles**: Birth Rate = 20%, Death Rate = 5%, Consumption = 2
3. **Resource Crisis**: Birth Rate = 15%, Consumption = 3, Regeneration = 200
4. **Sustainable Equilibrium**: Birth Rate = 10%, Death Rate = 10%, Consumption = 1.5

## File Structure

```
src/
├── App.js          # Main simulation component with all logic and UI
├── index.js        # React app entry point
└── index.css       # Basic styling
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder ready for deployment.

## Mathematical Extensions

This model could be extended with:
- Age-structured populations
- Spatial dynamics (migration)
- Multiple resource types
- Environmental stochasticity
- Genetic algorithms for parameter optimization

## License

This project is open source and available under the MIT License.