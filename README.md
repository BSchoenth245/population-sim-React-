# Population Simulation Suite

A comprehensive React-based simulation platform featuring multiple interconnected models for studying population dynamics, climate systems, and agricultural production. This educational tool demonstrates complex mathematical relationships through interactive visualizations and real-time parameter adjustment.

## Project Overview

This simulation suite contains three distinct but related models:

1. **Base Temperature & Agriculture Simulator** (`/src/Base/`) - Models seasonal climate patterns and temperature-driven crop production
2. **Disease Simulation Module** (`/src/Disease/`) - Epidemiological modeling (in development)
3. **Weather System Module** (`/src/Weather/`) - Advanced meteorological modeling (in development)

Each module is designed to be both standalone and interconnectable, allowing for complex multi-system analysis.

## Setup Instructions

### Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Git** (optional, for cloning)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd population-sim\(React\)
   ```
   
   Or download and extract the ZIP file, then navigate to the project directory.

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will install all required packages including React, Recharts, and development tools.

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The development server will start and automatically open your browser.

4. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The simulation will load automatically
   - Hot reloading is enabled - changes will appear instantly

### Troubleshooting Installation

- **Port 3000 in use**: The app will automatically try port 3001, 3002, etc.
- **npm install fails**: Try `npm cache clean --force` then `npm install` again
- **Node version issues**: Ensure you're using Node.js 14 or higher with `node --version`

## Dependencies

### Core Framework
- **React 19.2.1**: Modern React with concurrent features
- **React DOM 19.2.1**: DOM rendering engine
- **React Scripts 5.0.1**: Build tools and development server

### Visualization
- **Recharts 3.5.1**: Powerful charting library for data visualization
- Supports line charts, reference areas, tooltips, and interactive elements

## Switching Between Simulations

The project uses a modular architecture where different simulations can be loaded by modifying the entry point:

1. **Open** `/src/index.js`
2. **Change the import line** to load different modules:
   ```javascript
   // Base Temperature & Agriculture Simulation (default)
   import App from './Base/Sim_Base';
   
   // Disease Simulation Module
   import App from './Disease/Disease_Sim';
   
   // Weather System Module
   import App from './Weather/Weather_Sim';
   ```
3. **Save the file** - the app will automatically reload with the new simulation

## Project Structure

```
population-sim(React)/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── favicon.ico        # Browser icon
│   └── manifest.json      # PWA configuration
├── src/                   # Source code
│   ├── Base/              # Temperature & Agriculture Simulation
│   │   ├── Sim_Base.js    # Main simulation component
│   │   └── README.md      # Base module documentation
│   ├── Disease/           # Disease Simulation Module
│   │   ├── Disease_Sim.js # Disease modeling component
│   │   └── README.md      # Disease module documentation
│   ├── Weather/           # Weather System Module
│   │   ├── Weather_Sim.js # Weather modeling component
│   │   └── README.md      # Weather module documentation
│   ├── index.js           # Application entry point
│   ├── index.css          # Global styles
│   └── reportWebVitals.js # Performance monitoring
├── package.json           # Project configuration
├── package-lock.json      # Dependency lock file
└── README.md             # This file
```

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode with hot reloading.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.
See [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.
Optimizes the build for best performance and minifies files.

### `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**
Exposes all configuration files for advanced customization.

## Simulation Modules

### Base Module: Temperature & Agriculture
**Location**: `/src/Base/`
**Current Status**: 🚧 In development but functional

- Deterministic climate system with seasonal patterns
- Temperature-driven crop growth using Gaussian curves
- Multi-year simulation with daily resolution
- Interactive time scrubbing and parameter visualization
- Extreme weather events and climate variability

### Disease Module
**Location**: `/src/Disease/`
**Current Status**: 🚧 In development

- Epidemiological modeling framework
- Disease transmission dynamics
- Population health interactions
- Integration with base climate system

### Weather Module
**Location**: `/src/Weather/`
**Current Status**: 🚧 In development

- Advanced meteorological modeling
- Weather pattern generation
- Climate system interactions
- Extended forecasting capabilities

## Mathematical Foundations

The simulation suite is built on rigorous mathematical models:

### Climate Modeling
- **Seasonal Cycles**: Sinusoidal functions with phase shifts
- **Weather Noise**: Multi-frequency oscillations
- **Extreme Events**: Probabilistic rare event modeling
- **Temperature Continuity**: Smooth transitions between seasons

### Agricultural Systems
- **Crop Growth**: Gaussian temperature response curves
- **Resource Management**: Balance equations for food production/consumption
- **Optimization**: Finding optimal growing conditions

### Future Extensions

These models provide a foundation for advanced features:

**Population Dynamics:**
- Age-structured populations with demographic transitions
- Spatial dynamics and migration patterns
- Multiple resource types and competition
- Environmental stochasticity and climate change
- Genetic algorithms for parameter optimization

**Climate Systems:**
- Multi-year climate cycles (El Niño, La Niña)
- Climate change trend modeling
- Regional climate variations
- Precipitation and soil moisture

**Agricultural Complexity:**
- Multiple crop types with different preferences
- Soil quality and nutrient cycling
- Pest and disease pressure
- Irrigation and water management

**Disease Modeling:**
- SIR/SEIR epidemiological models
- Vaccination strategies
- Quarantine and intervention policies
- Multi-pathogen interactions

## Educational Applications

This simulation suite is designed for:

- **Mathematics Education**: Demonstrating calculus, statistics, and differential equations
- **Environmental Science**: Climate-agriculture interactions
- **Computer Science**: Algorithm design and data visualization
- **Systems Thinking**: Understanding complex interconnected systems
- **Research**: Hypothesis testing and parameter sensitivity analysis

## Performance Considerations

- **Deterministic Seeding**: All randomness is seeded for reproducible results
- **Efficient Computation**: Pre-calculated data arrays for smooth visualization
- **Memory Management**: Optimized data structures for large time series
- **Responsive Design**: Charts adapt to different screen sizes

## Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Responsive design works on tablets and phones

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-simulation`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -am 'Add new simulation'`)
6. Push to the branch (`git push origin feature/new-simulation`)
7. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For questions, issues, or contributions:
- Check the module-specific README files in each subdirectory
- Review the inline code documentation
- Open an issue for bugs or feature requests
- Consult the mathematical model documentation in each module
