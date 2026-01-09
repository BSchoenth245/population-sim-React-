# Base Module: Temperature, Agriculture & Population Simulation

This module implements a comprehensive civilization ecosystem simulation that models the complex relationships between climate, agriculture, and population dynamics. The simulation demonstrates how environmental factors drive agricultural output, which in turn affects population growth and survival through mathematically rigorous models.

## Overview

The Base simulation (`Sim_Base.js`) is a deterministic, seeded ecosystem that models:

- **Seasonal Temperature Cycles**: Realistic annual temperature patterns with smooth transitions
- **Temperature-Driven Crop Growth**: Agricultural production based on optimal growing conditions with population scaling
- **Population Dynamics**: Birth and death rates that respond to food availability
- **Food Economy**: Resource management with production, consumption, and stockpiling
- **Multi-Year Simulations**: Extended timelines showing long-term civilization trends
- **Interactive Configuration**: Climate and crop presets with detailed parameter control
- **Real-time Visualization**: Multi-chart displays with interactive time scrubbing

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

The agricultural system uses a **Gaussian (bell curve) distribution** combined with **population scaling** to model crop productivity:

**Base Growth Rate Formula:**
```
Base Growth = Min Growth + Max Growth × e^(-(Temperature - Optimal)² / (2 × Tolerance²))
```

**Population Scaling Formula:**
```
Population Factor = 1.0 (if pop < 1000) or (floor(pop / 50) × 0.1) (capped at 20.0)
Final Growth = Min Growth + (Max Growth × Population Factor × Bell Curve)
```

**Default Agricultural Parameters:**

| Parameter ------------| Default Value | Description -------------------------------------|
|-----------------------|---------------|--------------------------------------------------|
| Optimal Temperature --| 65°F ---------| Temperature for maximum crop growth -------------|
| Temperature Tolerance | 18°F ---------| How forgiving crops are to temperature deviation |
| Maximum Growth -------| 1000 units/day| Peak food production at optimal temperature -----|
| Minimum Growth -------| 100 units/day | Baseline production in poor conditions ----------|
| Food Per Person ------| 1 unit/day ---| Daily food consumption per individual -----------|
| Starting Food Stock --| 10000 units --| Initial food buffer -----------------------------|

#### Key Mathematical Concepts

1. **Bell Curve Response**: Crop growth peaks at optimal temperature and decreases symmetrically
2. **Population Scaling**: Larger populations expand farmland, increasing total production
3. **Never-Zero Production**: Minimum growth ensures crops always produce some food
4. **Temperature Sensitivity**: Growth drops exponentially as temperature deviates from optimal
5. **Dynamic Resource Balance**: Production scales with population, consumption scales with population

### Food Stock Dynamics

**Daily Food Balance:**
```
Morning: Food Stock += Daily Growth (temperature × population scaling)
Evening: Food Stock -= Daily Consumption (population × food per person)
```

**Food Security Analysis:**
- **Surplus Periods**: When daily growth > daily consumption
- **Deficit Periods**: When daily growth < daily consumption
- **Critical Thresholds**: When food stock approaches zero
- **Population Impact**: Both production and consumption scale with population size

### Population Dynamics Model

#### Birth and Death Rate Calculation

Population changes are driven by food availability using adaptive birth and death rates:

**Food Ratio Calculation:**
```
Food Ratio = min(1.0, Current Food Stock / Total Food Needed)
```

**Rate Adjustments:**
```
Birth Rate = Base Birth Rate × Food Ratio
Death Rate = Base Death Rate × (2 - Food Ratio)
```

**Default Population Parameters:**

| Parameter -----------| Default Value | Description ----------------------------------|
|---------------------|---------------|--------------------------------------------|
| Starting Population | 1000 beings --| Initial civilization size -----------------|
| Base Birth Rate ----| 1.0% per day -| Birth rate when food is adequate ----------|
| Base Death Rate ----| 0.8% per day -| Death rate when food is adequate ----------|

#### Population Feedback Loops

1. **Food Abundance**: High food security → increased births, decreased deaths
2. **Food Scarcity**: Low food security → decreased births, increased deaths
3. **Population Growth**: More people → more farmland → more food production
4. **Population Pressure**: More people → higher food consumption requirements

## Simulation Features

### Interactive Controls

1. **Generate New Climate**: Creates a new random weather pattern using different seed
2. **Time Scrubber**: Navigate through any day in the simulation timeline
3. **Settings Panel**: Comprehensive configuration interface with collapsible sections
4. **Climate Presets**: Pre-configured biomes (Temperate, Desert, Tropical, Arctic, Mediterranean)
5. **Crop Presets**: Different crop types with varying temperature preferences
6. **Real-Time Data Display**: Current day statistics for temperature, population, and food
7. **Multi-Chart Visualization**: Temperature, food stock, and population tracking

### Visualization Components

#### Temperature Chart
- **Daily temperature line** with seasonal color coding
- **Seasonal background shading** (Winter: blue, Spring: yellow, Summer: green, Fall: orange)
- **Current day indicator** with vertical reference line
- **Interactive tooltips** showing detailed daily data
- **Configurable starting season** affects seasonal display order

#### Food Stock Chart
- **Sawtooth pattern** showing twice-daily updates (growth then consumption)
- **Growth/consumption phases** clearly marked in tooltips
- **Same seasonal shading** for correlation with temperature
- **Detailed tooltips** showing growth and consumption amounts
- **Population-scaled production** visible in growth amounts

#### Population Chart
- **Population count over time** with smooth trend lines
- **Birth and death tracking** in detailed tooltips
- **Food security ratio** showing cause of population changes
- **Current day indicator** synchronized across all charts

#### Growth Curve Analysis
- **Base Temperature vs. Growth Rate** relationship (population = 100)
- **Population Growth Factor** showing farmland expansion effects
- **Optimal temperature indicator** (configurable)
- **Current day temperature** marked on the curve
- **Growth rate boundaries** (configurable minimum and maximum)

### Data Display

The simulation provides comprehensive real-time readouts organized in three panels:

**Current Day Data:**
- **Day**: Absolute day number in simulation
- **Year**: Which year of the multi-year simulation
- **Season**: Current season with automatic detection based on starting season
- **Temperature**: Daily average temperature in °F

**Current Population Data:**
- **Population**: Current population count
- **Birth Rate**: Current birth rate (food-adjusted)
- **Births**: Number born today
- **Death Rate**: Current death rate (food-adjusted)
- **Deaths**: Number died today

**Current Food Data:**
- **Food Stock**: Current food inventory level
- **Base Growth**: Temperature-only growth rate
- **Growth Factor**: Population scaling multiplier
- **Food Grown**: Total food produced today (base × factor)
- **Food Consumed**: Total food consumed today (population × rate)

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
- Collapsible settings sections to reduce UI complexity

### Configuration Management

**Dual Configuration System:**
- **Active Config**: Currently running simulation parameters
- **Working Config**: Draft parameters being edited in settings
- Changes only apply when user clicks "Save Changes & Regenerate"
- Prevents accidental simulation resets during parameter exploration

**Preset System:**
- **Climate Presets**: 5 biome configurations (Temperate, Desert, Tropical, Arctic, Mediterranean)
- **Crop Presets**: 10 crop types with different temperature preferences
- Presets populate configuration but allow further customization
- Maintains user's year count and starting season when applying presets

### Code Architecture

**Modular Functions:**
- `getSeasonForDay()`: Determines current season and progress
- `seasonalBaseline()`: Calculates base temperature for any day with starting season support
- `extremeEvent()`: Adds rare weather events
- `calculateGrowth()`: Converts temperature to food production with population scaling
- `calculateBasicGrowth()`: Pure temperature-to-growth conversion (for visualization)
- `calculateGrowthFactor()`: Population-to-farmland scaling calculation
- `calculatePopulationChange()`: Birth/death rate calculation based on food security

**React State Management:**
- `data`: Complete temperature timeline
- `foodData`: Food stock timeline with sawtooth growth/consumption pattern
- `populationData`: Population timeline with birth/death tracking
- `currentDay`: Selected day for detailed analysis
- `seed`: Random seed controlling all variation
- `activeConfig`: Currently running simulation parameters
- `workingConfig`: Draft parameters being edited
- `showSettings`: Settings panel visibility
- `expandedSections`: Which settings sections are open

## Experimental Scenarios

### Climate Analysis Experiments

1. **Biome Comparison**
   - Compare civilization outcomes across different climate presets
   - Observe how Arctic vs Tropical climates affect population growth
   - Analyze seasonal food security in different biomes

2. **Crop Adaptation Studies**
   - Test different crop types in various climates
   - Compare wheat (temperate) vs rice (tropical) in different biomes
   - Evaluate crop tolerance ranges and optimal growing conditions

3. **Population Dynamics**
   - Study how population size affects food production capacity
   - Observe population boom/bust cycles during climate stress
   - Analyze the relationship between population growth and food security

4. **Extreme Weather Impact**
   - Study effects of heat waves on crop production and population
   - Examine cold snap damage to agricultural output and survival
   - Evaluate civilization resilience to climate variability

5. **Multi-Year Sustainability**
   - Generate multiple climate patterns to see long-term viability
   - Compare different starting conditions and their outcomes
   - Assess sustainable population levels for different climates

6. **Parameter Sensitivity Analysis**
   - Use growth curve charts to understand crop responses
   - Test different birth/death rates and their population effects
   - Evaluate critical temperature thresholds for civilization survival

### Research Applications

**Educational Use Cases:**
- Demonstrate Gaussian distributions in agricultural modeling
- Show sine wave applications in climate systems
- Illustrate systems thinking with climate-agriculture-population feedback loops
- Practice data interpretation across multiple interconnected variables
- Explore exponential population growth and carrying capacity concepts
- Understand resource management and sustainability principles

**Scientific Extensions:**
- Parameter sensitivity analysis across climate, crop, and population variables
- Climate change scenario modeling with different biomes
- Agricultural adaptation strategy testing with crop selection
- Food security policy evaluation through population dynamics
- Carrying capacity analysis for different environmental conditions
- Resilience testing under extreme weather scenarios

## Mathematical Extensions

This base model provides a foundation for advanced features:

### Enhanced Climate Modeling
- **Multi-year cycles**: El Niño/La Niña patterns
- **Climate change trends**: Gradual temperature increases over time
- **Regional variations**: Multiple climate zones with migration
- **Precipitation modeling**: Rainfall and drought cycles affecting crop growth
- **Soil moisture dynamics**: Water availability effects on agriculture
- **Seasonal drift**: Gradual shifts in season timing and intensity

### Advanced Agricultural Systems
- **Multiple simultaneous crops**: Portfolio approach to food security
- **Soil quality factors**: Nutrient depletion and regeneration cycles
- **Pest and disease pressure**: Temperature and population-dependent threats
- **Irrigation systems**: Water management and drought mitigation
- **Crop rotation strategies**: Multi-year soil health optimization
- **Technology progression**: Improved farming techniques over time

### Enhanced Population Dynamics
- **Age structure**: Different age groups with varying consumption and productivity
- **Migration patterns**: Population movement in response to climate stress
- **Social organization**: Cooperation effects on food production efficiency
- **Cultural adaptation**: Learning and technology adoption over generations
- **Economic systems**: Trade, specialization, and resource allocation
- **Conflict modeling**: Resource competition and cooperation dynamics

## Usage Instructions

### Getting Started

1. **Load the Base Module**: Ensure `/src/index.js` imports `'./Base/Sim_Base'`
2. **Start the Simulation**: The climate and population will generate automatically
3. **Explore the Data**: Use the time scrubber to navigate through days
4. **Try Different Scenarios**: Use climate and crop presets for quick configuration
5. **Customize Parameters**: Open settings panel to fine-tune all simulation aspects
6. **Analyze Patterns**: Observe seasonal trends, population cycles, and extreme events
7. **Generate New Scenarios**: Click "Generate New Pattern" for different random seeds

### Interpretation Guide

**Temperature Patterns:**
- Look for smooth seasonal transitions based on chosen starting season
- Identify extreme weather events (spikes/dips) and their rarity
- Note how different biomes create different annual cycles

**Food Production:**
- Observe correlation between temperature and base growth rate
- Notice how population size amplifies total food production
- Identify surplus and deficit periods in the sawtooth pattern
- Track cumulative food security over time

**Population Dynamics:**
- Watch for population growth during food abundance
- Observe population decline during food scarcity
- Notice feedback loops between population size and food production
- Identify sustainable population levels for different climates

**Growth Curves:**
- Understand the optimal temperature concept for different crops
- See how crop productivity changes with temperature (bell curve)
- Observe population scaling effects on total production capacity
- Evaluate agricultural vulnerability to climate variation

**System Interactions:**
- Climate drives agriculture through temperature
- Agriculture drives population through food availability
- Population drives agriculture through farmland expansion
- All three systems create complex feedback loops

## File Structure

```
src/Base/
├── Sim_Base.js     # Main simulation component (3000+ lines)
└── README.md       # This documentation file
```

**Dependencies:**
- React hooks (useState, useEffect)
- Recharts visualization library (LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ReferenceLine)
- Mathematical functions (Math.sin, Math.exp, Math.floor, Math.min, Math.max)

**Key Features Implemented:**
- 5 climate presets with realistic biome characteristics
- 10 crop presets with different temperature preferences
- Comprehensive settings panel with collapsible sections
- Dual configuration system (active vs working)
- Population dynamics with food-dependent birth/death rates
- Population scaling of agricultural production
- Multi-chart synchronized visualization
- Configurable starting seasons
- Sawtooth food pattern showing growth/consumption phases

## Future Development

The Base module is designed for extensibility:

- **Modular architecture** allows easy addition of new systems
- **Clean separation** between climate and agricultural models
- **Standardized data formats** for integration with other modules
- **Comprehensive documentation** supports collaborative development

This foundation enables the development of more complex simulations while maintaining the educational clarity and mathematical rigor of the base system.