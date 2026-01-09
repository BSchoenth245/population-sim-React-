# Population Simulation Suite

A comprehensive React-based simulation platform for studying complex civilization dynamics through interconnected mathematical models. This educational tool demonstrates how climate, agriculture, population, disease, and weather systems interact to create realistic civilization scenarios with interactive visualizations and real-time parameter adjustment.

## Project Overview

This simulation suite models a complete civilization ecosystem through four interconnected modules:

1. **Base Module** (`/src/Base/`) - **✅ Fully Functional** - Complete climate-agriculture-population simulation with sophisticated temperature modeling, crop growth systems, and population dynamics
2. **Disease Module** (`/src/Disease/`) - **🚧 In Development** - Epidemiological modeling extending the base system with disease transmission, health dynamics, and public health interventions
3. **Weather Module** (`/src/Weather/`) - **🚧 In Development** - Advanced meteorological modeling adding precipitation, storms, droughts, and detailed weather systems
4. **Future Extensions** - Additional modules for economics, technology, social systems, and multi-regional interactions

Each module is designed to be both standalone and interconnectable, allowing for complex multi-system analysis and educational exploration of civilization dynamics.

## Getting Started

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Quick Start
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The Base simulation will load automatically

### Switching Between Modules

1. **Open** `/src/index.js`
2. **Change the import line** to load different modules:
   ```javascript
   // Base Module (default) - Full civilization simulation
   import App from './Base/Sim_Base';
   
   // Disease Module - Currently same as Base, future epidemiological features
   import App from './Disease/Disease_Sim';
   
   // Weather Module - Currently same as Base, future meteorological features
   import App from './Weather/Weather_Sim';
   ```
3. **Save the file** - the app will automatically reload with the selected module

## Core Technologies

### Framework & Libraries
- **React 19.2.1**: Modern React with concurrent features and hooks
- **Recharts 3.5.1**: Powerful charting library for interactive data visualization
- **React Scripts 5.0.1**: Build tools and development server

### Mathematical Modeling
- **Deterministic Systems**: Seeded randomness for reproducible experiments
- **Gaussian Distributions**: Bell curve crop growth optimization
- **Sine Wave Functions**: Seasonal climate patterns and weather variation
- **Population Dynamics**: Birth/death rate modeling with feedback loops
- **Multi-Scale Temporal Modeling**: Daily, seasonal, and multi-year simulations

### Visualization Features
- **Multi-Chart Dashboards**: Temperature, food stock, and population tracking
- **Interactive Time Scrubbing**: Navigate through simulation timeline
- **Seasonal Background Shading**: Visual correlation between charts
- **Growth Curve Analysis**: Temperature-productivity relationship visualization
- **Real-Time Parameter Adjustment**: Live configuration with immediate feedback

## Module Details

### Base Module: Climate-Agriculture-Population System
**Status**: ✅ **Fully Functional** - Complete civilization simulation

**Core Features**:
- **Deterministic Climate System**: Seasonal temperature cycles with extreme weather events
- **Population Dynamics**: Food-dependent birth and death rates with population scaling
- **Agricultural Production**: Temperature-optimized crop growth with population-driven farmland expansion
- **Interactive Configuration**: 5 climate presets, 10 crop types, comprehensive settings panel
- **Multi-Chart Visualization**: Temperature, food stock, and population tracking with growth curve analysis

**Key Capabilities**:
- Gaussian crop growth curves with configurable optimal temperatures
- Population scaling of agricultural production (farmland expansion)
- Food security-driven population dynamics with birth/death rate adjustments
- Configurable starting seasons and multi-year simulations
- Climate presets: Temperate, Desert, Tropical, Arctic, Mediterranean
- Crop presets: Wheat, Rice, Potatoes, Soybeans, and 6 others with different temperature preferences

### Disease Module: Epidemiological Modeling
**Status**: 🚧 **In Development** - Currently mirrors Base functionality

**Planned Features**:
- **SIR/SEIR Disease Models**: Susceptible, Infected, Recovered population compartments
- **Climate-Disease Interactions**: Temperature and seasonal effects on disease transmission
- **Population Health Dynamics**: Age-structured susceptibility and immunity development
- **Public Health Interventions**: Quarantine measures, vaccination campaigns, healthcare capacity
- **Environmental Disease Factors**: Weather-triggered outbreaks and malnutrition effects

**Integration Points**:
- Builds on Base module's population and climate systems
- Disease mortality adds to food-dependent death rates
- Seasonal disease patterns overlay climate cycles
- Agricultural workforce affected by disease outbreaks

### Weather Module: Advanced Meteorological Systems
**Status**: 🚧 **In Development** - Currently mirrors Base functionality

**Planned Features**:
- **Precipitation Modeling**: Rainfall, snowfall, and drought cycles with seasonal patterns
- **Water Cycle Integration**: Soil moisture, evapotranspiration, and irrigation needs
- **Extreme Weather Systems**: Enhanced storms, floods, and drought modeling
- **Multi-Scale Weather**: Daily variation, weekly fronts, monthly patterns, annual cycles
- **Agricultural Water Management**: Crop water requirements and irrigation optimization

**Integration Points**:
- Extends Base module's temperature system with precipitation and humidity
- Crop growth dependent on both temperature and water availability
- Weather-related population mortality and agricultural damage
- Enhanced extreme weather events affecting civilization resilience

## Project Structure

```
population-sim(React)/
├── public/                    # Static assets and HTML template
│   ├── index.html            # Main HTML template
│   ├── favicon.ico           # Browser icon
│   └── manifest.json         # PWA configuration
├── src/                      # Source code
│   ├── Base/                 # ✅ Complete Climate-Agriculture-Population Simulation
│   │   ├── Sim_Base.js       # Main simulation component (3000+ lines)
│   │   └── README.md         # Comprehensive module documentation
│   ├── Disease/              # 🚧 Epidemiological Modeling Extension
│   │   ├── Disease_Sim.js    # Disease modeling component (currently Base copy)
│   │   └── README.md         # Disease module documentation
│   ├── Weather/              # 🚧 Advanced Meteorological Systems
│   │   ├── Weather_Sim.js    # Weather modeling component (currently Base copy)
│   │   └── README.md         # Weather module documentation
│   ├── index.js              # Application entry point (module selector)
│   ├── index.css             # Global styles
│   └── reportWebVitals.js    # Performance monitoring
├── package.json              # Project configuration and dependencies
├── package-lock.json         # Dependency lock file
└── README.md                 # This overview file
```

### Key Features by Module

**Base Module (Fully Functional)**:
- 5 climate presets with realistic biome characteristics
- 10 crop presets with different temperature preferences
- Comprehensive settings panel with collapsible sections
- Dual configuration system (active vs working)
- Population dynamics with food-dependent birth/death rates
- Population scaling of agricultural production
- Multi-chart synchronized visualization
- Configurable starting seasons
- Sawtooth food pattern showing growth/consumption phases

**Disease Module (In Development)**:
- Currently mirrors Base module functionality
- Planned: SIR/SEIR epidemiological models
- Planned: Climate-disease interaction modeling
- Planned: Public health intervention simulation

**Weather Module (In Development)**:
- Currently mirrors Base module functionality
- Planned: Precipitation and water cycle modeling
- Planned: Advanced storm and drought systems
- Planned: Multi-scale weather pattern generation

## Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
Optimizes the build for best performance and minifies files.

### `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**
Exposes all configuration files for advanced customization.

## Performance & Compatibility

### Performance Features
- **Deterministic Seeding**: All randomness is seeded for reproducible results
- **Efficient Computation**: Pre-calculated data arrays for smooth visualization
- **Memory Management**: Optimized data structures for large time series
- **Responsive Design**: Charts adapt to different screen sizes

### Browser Compatibility
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Responsive design works on tablets and phones

## Future Development Roadmap

### Short-term (Disease & Weather Modules)
- **Disease Module Phase 1**: Basic SIR model integration with existing population dynamics
- **Weather Module Phase 1**: Precipitation layer and soil moisture modeling
- **Enhanced Visualization**: Additional charts for disease and weather data

### Medium-term (Advanced Features)
- **Multi-Regional Modeling**: Different climate zones with migration
- **Economic Systems**: Trade, specialization, and resource allocation
- **Technology Progression**: Agricultural and medical advancement over time
- **Social Organization**: Cooperation effects and cultural adaptation

### Long-term (Comprehensive Simulation)
- **Integrated Multi-Module System**: All modules working together seamlessly
- **Policy Simulation**: Government interventions and their effects
- **Historical Scenarios**: Real-world climate and population data integration
- **Machine Learning Integration**: AI-driven parameter optimization and prediction

## Educational Applications

This simulation suite serves multiple educational purposes across various disciplines:

### Mathematics & Statistics
- **Gaussian Distributions**: Crop growth optimization and bell curve analysis
- **Sine Wave Functions**: Seasonal patterns and periodic behavior
- **Differential Equations**: Population dynamics and rate-based modeling
- **Statistical Analysis**: Parameter sensitivity and data interpretation
- **Optimization Theory**: Finding optimal growing conditions and resource allocation

### Environmental Science
- **Climate Systems**: Temperature patterns, seasonal cycles, and extreme weather
- **Agricultural Science**: Crop-climate interactions and food production
- **Population Ecology**: Carrying capacity, resource competition, and sustainability
- **Water Cycle**: Precipitation, soil moisture, and irrigation (Weather module)
- **Disease Ecology**: Environmental factors affecting disease transmission (Disease module)

### Systems Thinking
- **Feedback Loops**: Climate→Agriculture→Population→Climate interactions
- **Complex Systems**: Emergent behavior from simple rules
- **Resilience Analysis**: System responses to extreme events and disturbances
- **Sustainability**: Long-term resource management and population stability
- **Policy Analysis**: Intervention effects and unintended consequences

### Computer Science
- **Algorithm Design**: Efficient mathematical modeling and computation
- **Data Visualization**: Interactive charts and real-time data display
- **User Interface Design**: Configuration panels and user experience
- **Software Architecture**: Modular design and component interaction
- **Performance Optimization**: Large dataset handling and smooth visualization

## Research & Experimental Applications

### Climate Science Research
- **Biome Comparison**: Arctic vs Tropical civilization outcomes
- **Climate Change Scenarios**: Temperature trend impacts on agriculture and population
- **Extreme Weather Analysis**: Heat wave and cold snap effects on civilization resilience
- **Seasonal Pattern Studies**: Growing season optimization and food security

### Agricultural Research
- **Crop Selection**: Optimal crop types for different climate conditions
- **Temperature Sensitivity**: Critical thresholds for agricultural productivity
- **Population Scaling**: Farmland expansion effects on food production
- **Resource Management**: Sustainable population levels for different environments

### Population Dynamics Research
- **Carrying Capacity**: Maximum sustainable population for given resources
- **Boom-Bust Cycles**: Population oscillations during resource stress
- **Migration Patterns**: Population movement in response to environmental changes
- **Demographic Transitions**: Birth/death rate changes with resource availability

### Public Health Research (Disease Module)
- **Epidemic Modeling**: Disease outbreak patterns and intervention effectiveness
- **Climate-Health Interactions**: Temperature effects on disease transmission
- **Healthcare Capacity**: Treatment resource limitations during outbreaks
- **Vaccination Strategies**: Optimal immunization timing and coverage

### Water Resource Research (Weather Module)
- **Drought Impact**: Extended dry period effects on agriculture and population
- **Flood Recovery**: Civilization resilience to extreme precipitation
- **Irrigation Optimization**: Water management strategies for variable precipitation
- **Climate Adaptation**: Agricultural adjustments to changing weather patterns

## Contributing

We welcome contributions to expand and improve the simulation suite:

### Development Areas
- **Disease Module**: Implement epidemiological models and climate-health interactions
- **Weather Module**: Add precipitation modeling and advanced weather systems
- **Visualization**: Create new chart types and interactive features
- **Mathematical Models**: Enhance existing algorithms or add new modeling approaches
- **Educational Content**: Develop tutorials, examples, and documentation

### Contribution Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/disease-sir-model`)
3. Make your changes with comprehensive documentation
4. Add tests for new functionality
5. Commit your changes (`git commit -am 'Add SIR disease model'`)
6. Push to the branch (`git push origin feature/disease-sir-model`)
7. Create a Pull Request with detailed description

### Development Guidelines
- **Modular Design**: Maintain clean separation between modules
- **Mathematical Rigor**: Ensure all models are mathematically sound
- **Educational Focus**: Keep educational value and explainability as priorities
- **Performance**: Optimize for smooth real-time visualization
- **Documentation**: Provide comprehensive inline and README documentation

## License

This project is open source and available under the MIT License.

## Support & Resources

For questions, issues, or contributions:
- **Module Documentation**: Check individual README files in each module directory
- **Code Documentation**: Review inline comments and function documentation
- **Issues**: Open GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub discussions for questions and ideas

### Learning Resources
- **Base Module**: Complete working example of climate-agriculture-population modeling
- **Mathematical Models**: Detailed explanations in module README files
- **Interactive Exploration**: Use the simulation to understand system behaviors
- **Parameter Experimentation**: Try different presets and configurations to see effects
