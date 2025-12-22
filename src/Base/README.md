# Base Module: Temperature & Agriculture Simulation

This module implements a comprehensive climate and agricultural production simulation that models the complex relationship between seasonal temperature patterns and food production over time. The simulation demonstrates how environmental factors directly impact agricultural output through mathematically rigorous models.

## Overview

The Base simulation (`Sim_Base.js`) is a deterministic, seeded climate system that models:

- **Seasonal Temperature Cycles**: Realistic annual temperature patterns with smooth transitions
- **Temperature-Driven Crop Growth**: Agricultural production based on optimal growing conditions
- **Daily Food Consumption**: Resource management with fixed consumption rates
- **Multi-Year Climate Patterns**: Extended simulations showing long-term trends
- **Interactive Visualization**: Real-time charts and data exploration tools

## Mathematical Model

### Climate System Architecture

The temperature model combines multiple mathematical layers to create realistic climate patterns:

#### 1. Seasonal Baseline Temperature

**Annual Sine Wave:**
```
Annual Wave = Annual Mean + Annual Amplitude × sin(2π × (Day Progress - 0.25))
```

**Seasonal Adjustments:**
```
Seasonal Baseline = Annual Wave + Season Offset + Intra-Season Variation
```

**Parameters:**
- Annual Mean: 52°F (base climate temperature)
- Annual Amplitude: 22°F (seasonal variation range)
- Wave Shift: -45 days (aligns summer peak correctly)
- Season Offsets: Winter (-5°F), Spring (0°F), Summer (+5°F), Fall (0°F)

#### 2. Daily Temperature Calculation

**Complete Temperature Formula:**
```
Final Temperature = Seasonal Baseline + Daily Oscillation + Weather Noise + Extreme Events
```

**Component Breakdown:**
- **Daily Oscillation**: `2 × sin((2π × Day Index) / 7)` (weekly weather patterns)
- **Weather Noise**: Multi-frequency sine waves simulating weather fronts
- **Extreme Events**: Rare temperature spikes based on seasonal context

#### 3. Seasonal Definitions

| Season | Length (Days) | Temperature Profile --| Characteristics ----|
|--------|---------------|-----------------------|---------------------| 
| Winter | 90 days ------| Mean: 15°F, Amp: 10°F | Cold snaps possible |
| Spring | 92 days ------| Mean: 65°F, Amp: 12°F | Variable conditions |
| Summer | 92 days ------| Mean: 90°F, Amp: 10°F | Heat waves possible |
| Fall --| 91 days ------| Mean: 55°F, Amp: 12°F | Moderate swings ----|

**Total: 365 days** (ensures no seasonal drift)

### Agricultural Production Model

#### Crop Growth Function

The agricultural system uses a **Gaussian (bell curve) distribution** to model crop productivity:

**Growth Rate Formula:**
```
Growth Rate = Min Growth + Max Growth × e^(-(Temperature - Optimal)² / (2 × Tolerance²))
```

**Agricultural Parameters:**

| Parameter ------------| Value --------| Description -------------------------------------|
|-----------------------|---------------|--------------------------------------------------|
| Optimal Temperature --| 65°F ---------| Temperature for maximum crop growth -------------|
| Temperature Tolerance | 12°F ---------| How forgiving crops are to temperature deviation |
| Maximum Growth -------| 10 units/day -| Peak food production at optimal temperature -----|
| Minimum Growth -------| 0.2 units/day | Baseline production in poor conditions ----------|
| Daily Consumption ----| 5 units/day --| Fixed food consumption rate ---------------------|
| Starting Food Stock --| 100 units ----| Initial food buffer -----------------------------|

#### Key Mathematical Concepts

1. **Bell Curve Response**: Crop growth peaks at optimal temperature and decreases symmetrically
2. **Never-Zero Production**: Minimum growth ensures crops always produce some food
3. **Temperature Sensitivity**: Growth drops exponentially as temperature deviates from optimal
4. **Resource Balance**: Daily production must balance against constant consumption

### Food Stock Dynamics

**Daily Food Balance:**
```
Morning: Food Stock += Daily Growth (based on temperature)
Evening: Food Stock -= Daily Consumption (constant 5 units)
```

**Food Security Analysis:**
- **Surplus Periods**: When daily growth > daily consumption
- **Deficit Periods**: When daily growth < daily consumption
- **Critical Thresholds**: When food stock approaches zero

## Simulation Features

### Interactive Controls

1. **Generate New Climate**: Creates a new random weather pattern using different seed
2. **Time Scrubber**: Navigate through any day in the simulation timeline
3. **Real-Time Data Display**: Current day statistics and conditions
4. **Multi-Chart Visualization**: Side-by-side temperature and food stock tracking

### Visualization Components

#### Temperature Chart
- **Daily temperature line** with seasonal color coding
- **Seasonal background shading** (Winter: blue, Spring: yellow, Summer: green, Fall: orange)
- **Current day indicator** with vertical reference line
- **Interactive tooltips** showing detailed daily data

#### Food Stock Chart
- **Continuous food level tracking** with twice-daily updates
- **Growth/consumption phases** clearly marked
- **Same seasonal shading** for correlation with temperature
- **Detailed tooltips** showing growth and consumption amounts

#### Growth Curve Analysis
- **Temperature vs. Growth Rate** relationship visualization
- **Optimal temperature indicator** at 65°F
- **Current day temperature** marked on the curve
- **Growth rate boundaries** (minimum and maximum)

### Data Display

The simulation provides real-time readouts:

- **Current Day**: Absolute day number in simulation
- **Year**: Which year of the multi-year simulation
- **Season**: Current season with automatic detection
- **Temperature**: Daily average temperature in °F
- **Food Stock**: Current food inventory level
- **Consumption Rate**: Fixed daily consumption (5 units/day)
- **Daily Growth**: Calculated food production for current temperature

## Technical Implementation

### Deterministic Design

**Seeded Randomness:**
- All "random" elements use mathematical seeds
- Same seed always produces identical results
- Enables reproducible experiments and analysis
- Supports scientific hypothesis testing

**Performance Optimization:**
- Pre-calculated data arrays for smooth visualization
- Efficient mathematical functions
- Optimized React rendering with proper state management
- Responsive chart sizing for different screen sizes

### Code Architecture

**Modular Functions:**
- `getSeasonForDay()`: Determines current season and progress
- `seasonalBaseline()`: Calculates base temperature for any day
- `extremeEvent()`: Adds rare weather events
- `calculateGrowth()`: Converts temperature to food production

**React State Management:**
- `data`: Complete temperature timeline
- `foodData`: Food stock timeline with growth/consumption phases
- `currentDay`: Selected day for detailed analysis
- `seed`: Random seed controlling all variation

## Experimental Scenarios

### Climate Analysis Experiments

1. **Seasonal Productivity Patterns**
   - Observe how crop growth varies throughout the year
   - Identify optimal growing seasons
   - Analyze seasonal food security challenges

2. **Extreme Weather Impact**
   - Study effects of heat waves on crop production
   - Examine cold snap damage to agricultural output
   - Evaluate climate resilience strategies

3. **Multi-Year Variability**
   - Generate multiple climate patterns to see variation
   - Compare different years' agricultural outcomes
   - Assess long-term food security trends

4. **Temperature Sensitivity Analysis**
   - Use the growth curve chart to understand crop responses
   - Identify critical temperature thresholds
   - Evaluate climate change adaptation needs

### Research Applications

**Educational Use Cases:**
- Demonstrate Gaussian distributions in real-world contexts
- Show sine wave applications in climate modeling
- Illustrate systems thinking with interconnected variables
- Practice data interpretation and scientific analysis

**Scientific Extensions:**
- Parameter sensitivity analysis
- Climate change scenario modeling
- Agricultural adaptation strategy testing
- Food security policy evaluation

## Mathematical Extensions

This base model provides a foundation for advanced features:

### Enhanced Climate Modeling
- **Multi-year cycles**: El Niño/La Niña patterns
- **Climate change trends**: Gradual temperature increases
- **Regional variations**: Different climate zones
- **Precipitation modeling**: Rainfall and drought cycles
- **Soil moisture dynamics**: Water availability effects

### Advanced Agricultural Systems
- **Multiple crop types**: Different temperature preferences and growing seasons
- **Soil quality factors**: Nutrient availability and depletion
- **Pest and disease pressure**: Temperature-dependent agricultural threats
- **Irrigation systems**: Water management and crop optimization
- **Crop rotation strategies**: Multi-year agricultural planning

### Population Integration
- **Variable consumption**: Population-dependent food demand
- **Agricultural labor**: Population effects on food production
- **Technology adoption**: Improved farming techniques over time
- **Economic factors**: Market prices and agricultural investment

## Usage Instructions

### Getting Started

1. **Load the Base Module**: Ensure `/src/index.js` imports `'./Base/Sim_Base'`
2. **Start the Simulation**: The climate will generate automatically
3. **Explore the Data**: Use the time scrubber to navigate through days
4. **Analyze Patterns**: Observe seasonal trends and extreme events
5. **Generate New Climates**: Click "Generate New Climate" for different scenarios

### Interpretation Guide

**Temperature Patterns:**
- Look for smooth seasonal transitions
- Identify extreme weather events (spikes/dips)
- Note the realistic annual cycle

**Food Production:**
- Observe correlation between temperature and growth
- Identify surplus and deficit periods
- Track cumulative food security over time

**Growth Curve:**
- Understand the optimal temperature concept
- See how crop productivity changes with temperature
- Evaluate agricultural vulnerability to climate variation

## File Structure

```
src/Base/
├── Sim_Base.js     # Main simulation component
└── README.md       # This documentation file
```

**Dependencies:**
- React hooks (useState, useEffect)
- Recharts visualization library
- Mathematical functions (Math.sin, Math.exp)

## Future Development

The Base module is designed for extensibility:

- **Modular architecture** allows easy addition of new systems
- **Clean separation** between climate and agricultural models
- **Standardized data formats** for integration with other modules
- **Comprehensive documentation** supports collaborative development

This foundation enables the development of more complex simulations while maintaining the educational clarity and mathematical rigor of the base system.