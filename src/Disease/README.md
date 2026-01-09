# Disease Module: Epidemiological Modeling Extension

**Current Status**: 🚧 In Development - Currently mirrors Base module functionality

## Overview

The Disease module extends the Base simulation by adding epidemiological modeling to the existing climate-agriculture-population system. This module demonstrates how disease outbreaks interact with environmental factors and population dynamics to create complex civilization challenges.

## Possible Future Features

### Disease Transmission Modeling
- **SIR/SEIR Models**: Susceptible, Infected, Recovered (and Exposed) population compartments
- **Temperature-Dependent Transmission**: Disease spread rates influenced by seasonal climate patterns
- **Population Density Effects**: Higher transmission rates in crowded populations
- **Multiple Pathogen Types**: Different diseases with varying characteristics

### Environmental Disease Factors
- **Seasonal Disease Patterns**: Flu-like diseases in winter, vector-borne diseases in summer
- **Climate-Disease Interactions**: Temperature and humidity effects on pathogen survival
- **Food Security Impact**: Malnutrition increasing disease susceptibility
- **Extreme Weather Events**: Disease outbreaks following climate disasters

### Population Health Dynamics
- **Age-Structured Susceptibility**: Different age groups with varying disease vulnerability
- **Immunity Development**: Recovered populations gaining temporary or permanent immunity
- **Healthcare Capacity**: Limited treatment resources affecting mortality rates
- **Quarantine Measures**: Population behavior changes during outbreaks

## Integration with Base Systems

### Climate System Integration
- Leverages the Base module's sophisticated climate modeling
- Uses existing seasonal patterns and extreme weather events
- Extends temperature effects beyond agriculture to include disease transmission

### Population System Enhancement
- Builds on the Base module's population dynamics
- Adds disease-related mortality to existing food-dependent death rates
- Incorporates morbidity effects on agricultural productivity

### Food System Interactions
- Disease outbreaks reducing agricultural workforce
- Malnutrition increasing disease susceptibility
- Food shortages during quarantine periods

## Mathematical Foundations

### Epidemiological Models
```
Basic SIR Model:
dS/dt = -β × S × I / N
dI/dt = β × S × I / N - γ × I
dR/dt = γ × I

Where:
- S: Susceptible population
- I: Infected population  
- R: Recovered population
- β: Transmission rate (temperature-dependent)
- γ: Recovery rate
- N: Total population
```

### Environmental Modifiers
- **Temperature Effects**: Optimal transmission temperatures for different pathogens
- **Seasonal Cycles**: Disease seasonality overlaid on climate patterns
- **Population Density**: Transmission scaling with crowding effects

## Experimental Scenarios

### Disease Outbreak Studies
- **Seasonal Epidemics**: Annual flu-like outbreaks during winter months
- **Pandemic Events**: Rare but severe disease events affecting large populations
- **Endemic Diseases**: Persistent low-level infections in the population
- **Vector-Borne Diseases**: Temperature-dependent mosquito/tick-borne illnesses

### Intervention Analysis
- **Quarantine Effectiveness**: Population isolation reducing transmission
- **Vaccination Campaigns**: Immunity building in susceptible populations
- **Healthcare Investment**: Treatment capacity effects on mortality
- **Public Health Measures**: Behavioral changes during outbreaks

### Climate-Disease Interactions
- **Warming Trends**: Expanding ranges of tropical diseases
- **Extreme Weather**: Disease outbreaks following floods, droughts, heat waves
- **Seasonal Shifts**: Changing disease patterns with altered climate cycles

## Current Implementation

**File**: `Disease_Sim.js` (currently identical to Base module)

The Disease module currently runs the complete Base simulation including:
- Climate system with seasonal patterns and extreme events
- Temperature-driven agriculture with population scaling
- Population dynamics with food-dependent birth/death rates
- Interactive visualization and configuration systems

## Development Roadmap

### Phase 1: Basic Disease Layer
- Add simple SIR model on top of existing population dynamics
- Implement temperature-dependent transmission rates
- Create disease visualization charts

### Phase 2: Environmental Integration
- Link disease patterns to seasonal climate cycles
- Add food security effects on disease susceptibility
- Implement extreme weather disease triggers

### Phase 3: Advanced Modeling
- Multiple disease types with different characteristics
- Age-structured population with varying susceptibility
- Healthcare system capacity and intervention modeling

### Phase 4: Policy Simulation
- Quarantine and isolation measures
- Vaccination strategy optimization
- Public health investment scenarios

## Usage Instructions

### Current Usage
1. **Load Disease Module**: Set `/src/index.js` to import `'./Disease/Disease_Sim'`
2. **Run Base Simulation**: Currently provides full Base module functionality
3. **Explore Climate-Population Interactions**: Use existing tools to understand baseline system

### Future Usage (Planned)
1. **Configure Disease Parameters**: Set pathogen characteristics and transmission rates
2. **Analyze Disease Patterns**: Observe seasonal and climate-driven disease cycles
3. **Test Interventions**: Experiment with quarantine and healthcare strategies
4. **Study Long-term Effects**: Examine multi-year disease and population dynamics

## Educational Applications

### Public Health Education
- Demonstrate epidemiological modeling principles
- Show climate-health interactions
- Illustrate intervention effectiveness

### Systems Thinking
- Understand complex interactions between environment, disease, and society
- Explore feedback loops in population health systems
- Analyze trade-offs in public health policy

### Mathematical Modeling
- Apply differential equations to real-world problems
- Understand parameter sensitivity in disease models
- Practice data interpretation in complex systems

## File Structure

```
src/Disease/
├── Disease_Sim.js    # Main simulation component (currently Base module copy)
└── README.md         # This documentation file
```

**Dependencies**: Same as Base module
- React hooks, Recharts visualization library
- Mathematical functions for modeling

**Future Dependencies**: 
- Enhanced mathematical libraries for epidemiological modeling
- Additional visualization components for disease data

## Relationship to Other Modules

**Base Module**: Provides the foundational climate-agriculture-population system that Disease extends

**Weather Module**: May share advanced meteorological features affecting disease transmission

**Integration Potential**: All modules designed for interconnection, allowing comprehensive civilization modeling with climate, agriculture, population, disease, and weather systems working together.