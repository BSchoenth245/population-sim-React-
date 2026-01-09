
/* ============================================================
   Temperature + Food + Population Simulation
   ------------------------------------------------------------
   This component models a complete civilization ecosystem:
   - Deterministic, seeded climate system with seasonal cycles
   - Temperature-driven crop growth with bell curve optimization
   - Population dynamics with birth/death rates
   - Food production scaled by population size
   - Interactive visualization of all systems over time

   Design Philosophy:
   - Smoothness over hyper-realism (gentle curves, not chaos)
   - Determinism per seed (same seed = identical simulation)
   - Explainability at every layer (visible causation)
   - Clear extension points for future systems
   ============================================================ */

import { useEffect, useState } from 'react';

/*
  Recharts provides visualization components.
  All simulation logic is computed beforehand in pure JS,
  then passed to Recharts as plain data arrays.
  This separation allows the simulation to be reused outside React.
*/
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

/* ============================================================
   VISUAL CONSTANTS
   ============================================================ */

/**
 * Color mapping for seasonal background shading on charts.
 * Uses semi-transparent RGBA to allow chart content to remain visible.
 */
const SEASON_COLORS = {
  Winter: 'rgba(173, 216, 230, 0.25)', // Light blue
  Spring: 'rgba(222, 208, 135, 0.25)', // Pale yellow
  Summer: 'rgba(144, 238, 144, 0.25)', // Light green
  Fall:   'rgba(222, 174, 135, 0.25)'  // Pale orange
};

/* ============================================================
   CLIMATE PRESETS
   ============================================================ */

/**
 * Pre-configured climate patterns for different biomes.
 * Each preset defines season lengths and temperature characteristics.
 * 
 * Structure:
 * - name: Display name for UI
 * - description: User-friendly explanation
 * - config: Parameters that define the climate pattern
 *   - {season}Length: Days in each season (must sum to 365)
 *   - {season}Mean: Target average temperature for season
 *   - {season}Amp: Amplitude of temperature variation within season
 */
  const CLIMATE_PRESETS = {
    temperate: {
      name: 'Temperate',
      description: 'Moderate four seasons with mild temperatures',
      config: {
        winterLength: 90,
        springLength: 92,
        summerLength: 92,
        fallLength: 91,
        winterMean: 35,
        winterAmp: 8,
        springMean: 55,
        springAmp: 12,
        summerMean: 75,
        summerAmp: 10,
        fallMean: 50,
        fallAmp: 12,
      }
    },

    desert: {
      name: 'Desert',
      description: 'Hot days, cold nights, minimal rainfall simulation',
      config: {
        winterLength: 120,  // Long, mild winter
        springLength: 60,   // Short spring transition
        summerLength: 150,  // Extended scorching summer
        fallLength: 35,     // Brief fall transition
        winterMean: 50,     // Mild winter days
        winterAmp: 15,      // Large day/night temperature swings
        springMean: 70,
        springAmp: 18,
        summerMean: 95,     // Extreme summer heat
        summerAmp: 20,      // Extreme temperature variation
        fallMean: 65,
        fallAmp: 15,
      }
    },

    tropical: {
      name: 'Tropical',
      description: 'Hot and humid year-round, minimal seasonal variation',
      config: {
        winterLength: 91,
        springLength: 91,
        summerLength: 92,
        fallLength: 91,
        winterMean: 75,     // Warm "winter"
        winterAmp: 5,       // Very stable temperatures
        springMean: 80,
        springAmp: 5,
        summerMean: 85,     // Hot but not extreme
        summerAmp: 5,
        fallMean: 78,
        fallAmp: 5,
      }
    },

    arctic: {
      name: 'Arctic',
      description: 'Long, brutal winters with brief summer growing season',
      config: {
        winterLength: 240,  // 8 months of frozen winter
        springLength: 30,   // Short thaw period
        summerLength: 60,   // Brief growing season
        fallLength: 35,     // Quick freeze
        winterMean: -10,    // Below freezing
        winterAmp: 8,
        springMean: 25,
        springAmp: 10,
        summerMean: 50,     // Cool even at peak
        summerAmp: 12,
        fallMean: 10,
        fallAmp: 10,
      }
    },

    mediterranean: {
      name: 'Mediterranean',
      description: 'Hot dry summers, mild wet winters',
      config: {
        winterLength: 100,
        springLength: 80,
        summerLength: 120,
        fallLength: 65,
        winterMean: 45,     // Mild, rainy winter
        winterAmp: 8,
        springMean: 60,
        springAmp: 10,
        summerMean: 85,     // Hot, dry summer
        summerAmp: 12,
        fallMean: 65,
        fallAmp: 10,
      }
    }
  };

/* ============================================================
   CROP PRESETS
   ============================================================ */

/**
 * Pre-configured crop types with different temperature preferences.
 * Each crop has an optimal growing temperature and tolerance range.
 * 
 * Structure:
 * - name: Display name
 * - description: Growing characteristics
 * - config: Growth parameters
 *   - optimalTemp: Peak growth temperature (°F)
 *   - tolerance: Standard deviation (wider = more forgiving)
 *   - minGrowth: Safety floor (food produced at worst temps)
 *   - maxGrowth: Peak production (food at optimal temp)
 */
const CROP_PRESETS = {
  wheat: {
    name: "Wheat",
    description: "A staple crop that grows well in temperate climates",
    config: {
      optimalTemp: 64,
      tolerance: 13,
      minGrowth: 50,
      maxGrowth: 600
    }
  },

  soybeans: {
    name: "Soybeans",
    description: "A versatile crop suited for warm climates",
    config: {
      optimalTemp: 77,
      tolerance: 11,
      minGrowth: 50,
      maxGrowth: 500
    }
  },

  rice: {
    name: "Rice",
    description: "A tropical grain requiring high temperatures",
    config: {
      optimalTemp: 82,
      tolerance: 9,
      minGrowth: 100,
      maxGrowth: 800
    }
  },

  potatoes: {
    name: "Potatoes",
    description: "A hardy root vegetable for temperate regions",
    config: {
      optimalTemp: 63,
      tolerance: 7,
      minGrowth: 70,
      maxGrowth: 700
    }
  },

  carrots: {
    name: "Carrots",
    description: "A cool-weather root crop",
    config: {
      optimalTemp: 61,
      tolerance: 7,
      minGrowth: 50,
      maxGrowth: 500
    }
  },

  sugarCane: {
    name: "Sugar Cane",
    description: "A tropical grass requiring high heat",
    config: {
      optimalTemp: 86,
      tolerance: 11,
      minGrowth: 150,
      maxGrowth: 1200
    }
  },

  pineapple: {
    name: "Pineapple",
    description: "A tropical fruit with moderate yields",
    config: {
      optimalTemp: 79,
      tolerance: 9,
      minGrowth: 30,
      maxGrowth: 400
    }
  },

  barley: {
    name: "Barley",
    description: "A temperate grain similar to wheat",
    config: {
      optimalTemp: 63,
      tolerance: 11,
      minGrowth: 50,
      maxGrowth: 500
    }
  },

  bananas: {
    name: "Bananas",
    description: "A tropical fruit requiring consistent heat",
    config: {
      optimalTemp: 84,
      tolerance: 7,
      minGrowth: 100,
      maxGrowth: 1000
    }
  },

  cotton: {
    name: "Cotton",
    description: "A warm-weather fiber crop",
    config: {
      optimalTemp: 81,
      tolerance: 11,
      minGrowth: 40,
      maxGrowth: 600
    }
  }  
}

/* ============================================================
   HELPER FUNCTIONS - SEASON LOGIC
   ============================================================ */

/**
 * Determine which season a given day falls into.
 * 
 * The year is divided into seasons based on configured lengths.
 * Each season tracks its own progress (0 to 1) for smooth transitions.
 * 
 * @param {number} dayOfYear - Day index within the year (0-364)
 * @param {Array<{name: string, length: number}>} seasons - Season definitions
 * @returns {{name: string, progress: number}} Season name and normalized progress (0-1)
 * 
 * Example:
 * - dayOfYear = 45, seasons = [{Winter, 90}, {Spring, 92}, ...]
 * - Returns: {name: 'Winter', progress: 0.5} (halfway through winter)
 */
function getSeasonForDay(dayOfYear, seasons) {
  let accumulated = 0; // Running total of days consumed by previous seasons

  // Iterate through seasons in order
  for (const season of seasons) {
    // Check if this day falls within the current season's range
    if (dayOfYear < accumulated + season.length) {
      // Calculate how far through this season we are (0.0 to 1.0)
      const progress = (dayOfYear - accumulated) / season.length;
      
      return {
        name: season.name,
        progress: progress
      };
    }
    
    // This season is complete, add its length to the accumulator
    accumulated += season.length;
  }

  // Defensive fallback (should never occur if seasons sum to 365)
  return { name: 'Winter', progress: 0 };
}

/* ============================================================
   HELPER FUNCTIONS - TEMPERATURE GENERATION
   ============================================================ */

/**
 * Generate the smooth annual temperature baseline.
 * 
 * This is the "climate backbone" - a smooth curve that defines
 * the expected temperature throughout the year. All other temperature
 * effects (daily weather, noise, extremes) are layered on top.
 * 
 * Algorithm:
 * 1. Reorder seasons starting from the user's chosen starting season
 * 2. Calculate the midpoint day of each season
 * 3. Find which two season midpoints the current day falls between
 * 4. Interpolate between those two temperatures using cosine smoothing
 * 5. Add small intra-seasonal variation based on season amplitude
 * 
 * @param {string} seasonName - Name of current season (not used, kept for future)
 * @param {number} progress - Progress through current season 0-1 (used for intra-season variation)
 * @param {number} dayOfYear - Day index within the year (0-364)
 * @param {Object} seasonProfiles - Temperature characteristics per season {Winter: {mean, amp}, ...}
 * @param {Array} seasons - Season definitions [{name, length}, ...]
 * @param {string} startingSeason - Which season the year starts with
 * @returns {number} Baseline temperature in °F
 */
function seasonalBaseline(seasonName, progress, dayOfYear, seasonProfiles, seasons, startingSeason) {
  // === STEP 1: Reorder seasons to start from user's chosen season ===
  const seasonNames = seasons.map(s => s.name);
  const startIndex = seasonNames.indexOf(startingSeason);
  
  // Create a new array: seasons from startingSeason onward, then wrap around
  const orderedSeasons = [
    ...seasons.slice(startIndex),    // From starting season to end
    ...seasons.slice(0, startIndex)  // From beginning to starting season
  ];

  // === STEP 2: Calculate midpoint of each season ===
  const seasonMidpoints = [];
  let cumulativeDays = 0; // Track total days as we go

  for (let i = 0; i < orderedSeasons.length; i++) {
    const season = orderedSeasons[i];
    
    // Midpoint is halfway through this season
    const midpoint = cumulativeDays + season.length / 2;

    seasonMidpoints.push({
      name: season.name,
      midpointDay: midpoint,
      mean: seasonProfiles[season.name]?.mean ?? 50,  // Target temp
      amp: seasonProfiles[season.name]?.amp ?? 0,     // Variation amount
      length: season.length
    });

    cumulativeDays += season.length;
  }

  // === STEP 3: Find current position in year ===
  const currentDayInYear = dayOfYear % 365;

  // === STEP 4: Find the two closest season midpoints ===
  // We'll interpolate between these two temperatures
  let prevMidpoint = seasonMidpoints[seasonMidpoints.length - 1]; // Default to last
  let nextMidpoint = seasonMidpoints[0];                           // Default to first

  for (let i = 0; i < seasonMidpoints.length; i++) {
    const curr = seasonMidpoints[i];
    const next = seasonMidpoints[(i + 1) % seasonMidpoints.length]; // Wrap around

    // Handle wrap-around case (last season to first season of next year)
    if (i === seasonMidpoints.length - 1) {
      if (currentDayInYear >= curr.midpointDay || currentDayInYear < next.midpointDay) {
        prevMidpoint = curr;
        nextMidpoint = next;
        break;
      }
    } 
    // Normal case: day falls between two consecutive midpoints
    else {
      if (currentDayInYear >= curr.midpointDay && currentDayInYear < next.midpointDay) {
        prevMidpoint = curr;
        nextMidpoint = next;
        break;
      }
    }
  }

  // === STEP 5: Calculate distance between midpoints ===
  let distanceFromPrev;  // How far from previous midpoint
  let totalDistance;     // Total distance between the two midpoints

  // Handle year wrap-around (e.g., from Fall to Winter of next year)
  if (prevMidpoint.midpointDay > nextMidpoint.midpointDay) {
    // We're wrapping around the year boundary
    if (currentDayInYear >= prevMidpoint.midpointDay) {
      // We're after the previous midpoint
      distanceFromPrev = currentDayInYear - prevMidpoint.midpointDay;
    } else {
      // We've wrapped to next year
      distanceFromPrev = (365 - prevMidpoint.midpointDay) + currentDayInYear;
    }
    totalDistance = (365 - prevMidpoint.midpointDay) + nextMidpoint.midpointDay;
  } 
  // Normal case: both midpoints in same year
  else {
    distanceFromPrev = currentDayInYear - prevMidpoint.midpointDay;
    totalDistance = nextMidpoint.midpointDay - prevMidpoint.midpointDay;
  }

  // === STEP 6: Interpolate between the two temperatures ===
  // Normalize to 0-1 range
  const progressBetweenMidpoints = distanceFromPrev / totalDistance;

  // Use cosine interpolation for smooth, natural transitions
  // This creates an S-curve that avoids sudden temperature changes
  const smoothProgress = (1 - Math.cos(progressBetweenMidpoints * Math.PI)) / 2;
  
  // Calculate base temperature by blending the two season means
  const baseTemp = prevMidpoint.mean + (nextMidpoint.mean - prevMidpoint.mean) * smoothProgress;

  // === STEP 7: Add intra-seasonal variation ===
  // Small temperature wiggle within the season based on its amplitude setting
  const currentSeasonMidpoint = progressBetweenMidpoints < 0.5 ? prevMidpoint : nextMidpoint;
  
  // Use sine wave to create gentle mid-season temperature bump
  // Factor of 0.3 keeps this subtle (not overwhelming the main curve)
  const intraSeason = currentSeasonMidpoint.amp * Math.sin(progress * Math.PI) * 0.3;

  return baseTemp + intraSeason;
}

/**
 * Inject rare but deterministic extreme weather events.
 * 
 * Uses sine functions with the seed to create pseudo-random but
 * repeatable weather events. Events are rare (3% chance per day)
 * but have significant temperature impact when they occur.
 * 
 * Seasonal behavior:
 * - Summer: Heat waves (positive delta)
 * - Winter: Cold snaps (negative delta)
 * - Spring/Fall: Can swing either way
 * 
 * @param {number} dayIndex - Absolute day index in simulation
 * @param {string} seasonName - Current season ('Winter', 'Spring', 'Summer', 'Fall')
 * @param {number} seed - Simulation seed for determinism
 * @returns {number} Temperature delta to add (°F), usually 0
 */
function extremeEvent(dayIndex, seasonName, seed) {
  // Generate a pseudo-random signal based on day and seed
  // Range: 0 to 1
  const signal = Math.sin(dayIndex * 0.173 + seed * 100) * 0.5 + 0.5;

  // Only 3% of days have extreme events (signal > 0.97)
  if (signal < 0.97) return 0;

  // Calculate event magnitude (8-14°F range)
  // Uses different frequency to decorrelate from the trigger signal
  const magnitude = 8 + 6 * Math.abs(Math.sin(dayIndex * 0.91));

  // Determine direction based on season
  if (seasonName === 'Summer') return +magnitude;  // Heat wave
  if (seasonName === 'Winter') return -magnitude;  // Cold snap

  // Spring and Fall can swing either way (use another sine function)
  return Math.sin(dayIndex * 0.37) > 0 ? +magnitude : -magnitude;
}

/* ============================================================
   HELPER FUNCTIONS - CROP & FOOD PRODUCTION
   ============================================================ */

function calculateGrowthFactor(population) {
  let populationFactor = 0;

  // === Population scaling factor ===
  // Small populations (< 1000) use baseline growth
  // Larger populations expand farmland: +0.09x multiplier per 50 people
  if (population <= 10000) {
    populationFactor = population < 1000 ? 1 : (Math.floor(population / 50) * 0.1);
  }
  else {
    populationFactor = 20; // Cap growth factor for very large populations
  }
  return populationFactor;
}

/**
 * Calculate daily food production based on temperature and population.
 * 
 * Uses a Gaussian (bell curve) distribution centered on the crop's
 * optimal temperature. Production scales with population size to
 * simulate farmland expansion as civilization grows.
 * 
 * Formula:
 * 1. Base growth = minGrowth + maxGrowth * bellCurve(temp)
 * 2. Population factor = 1.0 for pop < 1000, increases by 0.09 per 50 people
 * 3. Final growth = minGrowth + (scaledMaxGrowth * bellCurve)
 * 
 * @param {number} temperature - Current day's temperature (°F)
 * @param {Object} cropConfig - Crop parameters {optimalTemp, tolerance, maxGrowth, minGrowth}
 * @param {number} population - Current population size
 * @returns {number} Food units produced this day
 */
function calculateGrowth(temperature, cropConfig, population) {
  const { optimalTemp, tolerance, maxGrowth, minGrowth } = cropConfig;
  
  const populationFactor = calculateGrowthFactor(population);

  const scaledMaxGrowth = maxGrowth * populationFactor;

  // === Temperature optimality calculation ===
  // How far from ideal temperature?
  const deviation = temperature - optimalTemp;

  // Gaussian bell curve: e^(-(x²)/(2σ²))
  // - At optimal temp: bellCurve = 1.0 (maximum)
  // - Far from optimal: bellCurve approaches 0
  // - tolerance is standard deviation (σ)
  const bellCurve = Math.exp(-(deviation ** 2) / (2 * tolerance ** 2));

  // === Final production ===
  // Always produce at least minGrowth, even in terrible conditions
  // Add scaled maximum production weighted by how close to optimal we are
  return minGrowth + scaledMaxGrowth * bellCurve;
}

/**
 * Calculate basic crop growth without population scaling.
 * 
 * This is the "pure" growth curve used for visualization.
 * Shows how temperature alone affects crop yields.
 * 
 * @param {number} temperature - Current temperature (°F)
 * @param {Object} cropConfig - Crop parameters {optimalTemp, tolerance, maxGrowth, minGrowth}
 * @returns {number} Base food units produced (no population factor)
 */
function calculateBasicGrowth(temperature, cropConfig) {
  const { optimalTemp, tolerance, maxGrowth, minGrowth } = cropConfig;
  
  // Distance from optimal temperature
  const deviation = temperature - optimalTemp;
  
  // Gaussian bell curve
  const bellCurve = Math.exp(-(deviation ** 2) / (2 * tolerance ** 2));
  
  return minGrowth + maxGrowth * bellCurve;
}

/* ============================================================
   HELPER FUNCTIONS - POPULATION DYNAMICS
   ============================================================ */

/**
 * Calculate population change based on food availability.
 * 
 * Models birth and death rates that respond to food security:
 * - Adequate food: Normal birth rate, low death rate
 * - Food shortage: Reduced births, increased deaths
 * - No food: Minimal births, doubled death rate
 * 
 * @param {number} population - Current population count
 * @param {number} foodStock - Available food units
 * @param {number} totalFoodNeeded - Food required to feed everyone
 * @param {Object} config - Population parameters {baseBirthRate, baseDeathRate}
 * @returns {{births: number, deaths: number, newPopulation: number}} Population change data
 */
function calculatePopulationChange(population, foodStock, totalFoodNeeded, config) {
  const { baseBirthRate, baseDeathRate } = config;
  let birthRate = 0;

  // === Food availability factor ===
  // Range: 0.0 (no food) to 1.0 (adequate food)
  // Capped at 1.0 so surplus food doesn't boost rates beyond baseline
  const foodRatio = Math.min(1, foodStock / totalFoodNeeded);

  // === Adjust rates based on food security ===
  // Birth rate: Scales linearly with food (no food = no births)
  if(foodRatio === 0) {
    birthRate = baseBirthRate * 0.1; // Minimal birth rate during crisis
  } else {
    birthRate = baseBirthRate * foodRatio; // Proportional to food availability
  }

  // Death rate: Inverted relationship (more food = fewer deaths)
  // Formula: baseDeathRate * (2 - foodRatio)
  // - foodRatio = 1.0: deathRate = baseDeathRate (normal)
  // - foodRatio = 0.5: deathRate = 1.5 × baseDeathRate (elevated)
  // - foodRatio = 0.0: deathRate = 2 × baseDeathRate (crisis)
  const deathRate = baseDeathRate * (2 - foodRatio);

  // === Calculate absolute numbers ===
  const births = Math.floor(population * birthRate);
  const deaths = Math.floor(population * deathRate);

  // === Update population ===
  // Cannot go below zero
  const newPopulation = Math.max(0, population + births - deaths);

  return { 
    births, 
    deaths, 
    newPopulation 
  };
}

/* ============================================================
   MAIN REACT COMPONENT
   ============================================================ */

/**
 * Main simulation component.
 * 
 * Manages:
 * - Temperature simulation (deterministic climate system)
 * - Food production (temperature-driven crop growth)
 * - Population dynamics (birth/death based on food)
 * - Interactive visualization of all three systems
 * - User configuration via settings panel
 */
export default function TemperatureSimulation() {
  /* ============================================================
     STATE MANAGEMENT
     ============================================================ */

  /**
   * Full temperature timeline.
   * Array of objects: [{dayIndex, year, dayOfYear, season, temperature}, ...]
   * Generated once per seed change, then used for all visualizations.
   */
  const [data, setData] = useState([]);

  /**
   * Currently viewed day in the timeline.
   * Controlled by the scrubber slider.
   * Range: 0 to (totalDays - 1)
   */
  const [currentDay, setCurrentDay] = useState(0);

  /**
   * Random seed for deterministic weather generation.
   * Same seed always produces the same climate pattern.
   * Changes when user clicks "Generate New Pattern" button.
   */
  const [seed, setSeed] = useState(Math.random());

  /**
   * Active simulation configuration.
   * These are the parameters currently being used for simulation.
   * Updated only when user clicks "Save Changes & Regenerate".
   */
  const [activeConfig, setActiveConfig] = useState({
    // Time settings
    yearCount: 1,                    // Number of years to simulate
    startingSeason: 'Spring',        // Which season day 0 begins in
    
    // Season lengths (must sum to 365)
    winterLength: 90,
    springLength: 92,
    summerLength: 92,
    fallLength: 91,
    
    // Season temperature profiles
    winterMean: 15,
    winterAmp: 10,
    springMean: 65,
    springAmp: 12,
    summerMean: 90,
    summerAmp: 10,
    fallMean: 55,
    fallAmp: 12,
    
    // Crop characteristics
    optimalTemp: 65,                 // Best growing temperature (°F)
    tolerance: 18,                   // Temperature tolerance (σ)
    maxGrowth: 1000,                 // Peak daily production
    minGrowth: 100,                  // Minimum daily production
    
    // Food economy
    startingFood: 10000,             // Initial food stockpile
    foodPerPerson: 1,                // Daily food consumption per person
    
    // Population settings
    startingPopulation: 1000,        // Initial population
    baseBirthRate: 0.01,            // 1% birth rate at full food
    baseDeathRate: 0.008,           // 0.8% death rate at full food
  });

  /**
   * Working configuration being edited in settings panel.
   * Changes here don't affect simulation until user saves.
   */
  const [workingConfig, setWorkingConfig] = useState({...activeConfig});

  /**
   * Food stock timeline.
   * Array of objects with two entries per day:
   * 1. After harvest (x: day)
   * 2. After consumption (x: day + 0.5)
   * This creates the sawtooth pattern visible on the food chart.
   */
  const [foodData, setFoodData] = useState([]);

  /**
   * Population timeline.
   * Array of objects: [{x, population, births, deaths, foodRatio}, ...]
   * One entry per day tracking population changes and causes.
   */
  const [populationData, setPopulationData] = useState([]);

  /**
   * Controls visibility of settings side panel.
   * true: Panel slides in from right
   * false: Panel hidden off-screen
   */
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Legacy state variable (kept for compatibility).
   * Actual year count is now stored in activeConfig.yearCount.
   */
  const [yearCount, setYearCount] = useState(1);

  /**
   * Track which sections of settings panel are expanded.
   * Each section can be independently collapsed/expanded.
   */
  const [expandedSections, setExpandedSections] = useState({
    time: true,       // Start with time section open
    seasons: false,
    profiles: false,
    crop: false,
    food: false
  });

  /* ============================================================
     SIMULATION GENERATION
     ============================================================ */

  /**
   * Main simulation effect.
   * Triggers when seed or activeConfig changes.
   * 
   * Process:
   * 1. Generate temperature data for all days
   * 2. Simulate food production based on temperatures
   * 3. Simulate population changes based on food availability
   * 4. Store all results in state arrays for visualization
   */
  useEffect(() => {
    // === SETUP: Extract configuration ===
    const totalDays = 365 * activeConfig.yearCount;

    // Build crop config object
    const cropConfig = {
      optimalTemp: activeConfig.optimalTemp,
      tolerance: activeConfig.tolerance,
      maxGrowth: activeConfig.maxGrowth,
      minGrowth: activeConfig.minGrowth
    };

    // Build seasons array
    const seasons = [
      { name: 'Winter', length: activeConfig.winterLength },
      { name: 'Spring', length: activeConfig.springLength },
      { name: 'Summer', length: activeConfig.summerLength },
      { name: 'Fall', length: activeConfig.fallLength }
    ];

    // Build season profiles (temperature characteristics)
    const seasonProfiles = {
      Winter: { mean: activeConfig.winterMean, amp: activeConfig.winterAmp },
      Spring: { mean: activeConfig.springMean, amp: activeConfig.springAmp },
      Summer: { mean: activeConfig.summerMean, amp: activeConfig.summerAmp },
      Fall: { mean: activeConfig.fallMean, amp: activeConfig.fallAmp }
    };

    const generated = [];




/* ==============================
   TEMPERATURE SIMULATION
   ============================== */

// Iterate through every day in the simulation
// This loop generates the complete temperature timeline before any rendering occurs
for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
  
  // === Calculate temporal position ===
  // Determine which year we're in (0-indexed)
  // Example: day 400 → year 1 (400 ÷ 365 = 1.095... → floor = 1)
  const year = Math.floor(dayIndex / 365);
  
  // Determine position within the current year (0-364)
  // Example: day 400 → dayOfYear 35 (400 % 365 = 35)
  const dayOfYear = dayIndex % 365;

  // === Determine current season ===
  // Get which season this day falls into and how far through it we are
  // Returns: {name: 'Spring', progress: 0.42} for example
  const season = getSeasonForDay(dayOfYear, seasons);

  // === TEMPERATURE LAYER 1: Seasonal Baseline ===
  // This is the smooth annual temperature curve that defines the climate
  // It creates the fundamental "shape" of the year's temperatures
  // All other temperature effects are variations on top of this foundation
  const base = seasonalBaseline(
    season.name,              // Current season name (for reference)
    season.progress,          // How far through the season (0-1)
    dayOfYear,                // Day within the year
    seasonProfiles,           // Temperature characteristics per season
    seasons,                  // Season length definitions
    activeConfig.startingSeason  // Which season starts the year
  );

  // === TEMPERATURE LAYER 2: Weekly Weather Patterns ===
  // Simulates the passage of weather fronts (high/low pressure systems)
  // Creates a 7-day cycle that adds ±2°F variation
  // Formula breakdown:
  // - (2 * Math.PI * dayIndex) / 7 creates a full sine wave cycle every 7 days
  // - Multiplying by 2 gives amplitude of ±2°F
  // This mimics real-world weekly weather patterns
  const daily = 2 * Math.sin((2 * Math.PI * dayIndex) / 7);

  // === TEMPERATURE LAYER 3: Multi-Frequency Noise ===
  // Adds natural-looking temperature variation at multiple time scales
  // This prevents the weather from feeling too regular or predictable
  // 
  // Two overlapping sine waves with different frequencies:
  // 1. Slow wave (20-day cycle): ±3°F - represents longer weather patterns
  // 2. Fast wave (10-day cycle): ±2°F - represents shorter fluctuations
  // 
  // The seed is mixed in (seed * 10, seed * 20) to make each simulation unique
  // but still deterministic (same seed = same noise pattern)
  const noise =
    3 * Math.sin(dayIndex / 20 + seed * 10) +  // Long-period variation
    2 * Math.sin(dayIndex / 10 + seed * 20);   // Short-period variation

  // === TEMPERATURE LAYER 4: Extreme Weather Events ===
  // Rare but significant temperature anomalies
  // Usually returns 0, but ~3% of days get ±8 to ±14°F events
  // Direction depends on season (summer heat waves, winter cold snaps)
  const extreme = extremeEvent(dayIndex, season.name, seed);

  // === COMBINE ALL TEMPERATURE LAYERS ===
  // Final temperature = baseline + daily weather + noise + extreme events
  // This layered approach creates realistic weather that:
  // - Follows seasonal patterns (base)
  // - Has week-to-week variation (daily)
  // - Feels natural and unpredictable (noise)
  // - Includes occasional extreme conditions (extreme)
  const temp = base + daily + noise + extreme;
  
  // === SAFETY CHECK ===
  // Ensure temperature is a valid number (not NaN or Infinity)
  // If invalid, default to 0°F to prevent chart rendering issues
  const safeTemp = Number.isFinite(temp) ? temp : 0;

  // === STORE TEMPERATURE DATA ===
  // Create a data point for this day with all relevant information
  // This object will be used for:
  // - Chart visualization (temperature over time)
  // - Food production calculation (temperature affects crop growth)
  // - Season display in UI
  generated.push({
    dayIndex,                                  // Absolute day number in simulation
    year,                                      // Which year (for multi-year display)
    dayOfYear,                                 // Day within year (for seasonal calculations)
    season: season.name,                       // Season name (for background shading)
    temperature: Math.round(safeTemp * 10) / 10  // Round to 1 decimal place for readability
  });
}

// === SAVE TEMPERATURE DATA TO STATE ===
// This triggers a re-render with the new temperature timeline
// React will update all charts and displays that depend on this data
setData(generated);

/* ==============================
   FOOD & POPULATION SIMULATION
   ============================== */

// Initialize arrays to store daily food and population records
const foodSimulation = [];       // Will contain 2 entries per day (growth + consumption)
const populationSimulation = []; // Will contain 1 entry per day (population count + changes)

// Initialize starting conditions from configuration
let currentFood = activeConfig.startingFood;           // Food stockpile in units
let currentPopulation = activeConfig.startingPopulation; // Starting population count

// Iterate through every day to simulate the economy
// This runs AFTER temperature generation so we can look up each day's temperature
for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
  
  // === LOOK UP TODAY'S TEMPERATURE ===
  // Get the temperature we already generated for this day
  const temp = generated[dayIndex].temperature;
  
  // === CALCULATE FOOD PRODUCTION ===
  // Crop growth depends on:
  // 1. Temperature (bell curve centered on optimal temp)
  // 2. Population size (more people = more farmland = more production)
  const growth = calculateGrowth(temp, cropConfig, currentPopulation);

  // === MORNING PHASE: HARVEST COMPLETES ===
  // At dawn, the day's crop yield is added to the stockpile
  // This represents farmers bringing in the harvest
  currentFood += growth;

  // === CALCULATE DAILY FOOD NEEDS ===
  // Total food required to feed the entire population
  // Each person consumes foodPerPerson units per day
  // Example: 1000 people × 1 unit/person = 1000 units needed
  const totalFoodNeeded = currentPopulation * activeConfig.foodPerPerson;

  // === CALCULATE POPULATION DYNAMICS ===
  // Determine births and deaths based on food availability
  // Well-fed populations grow, starving populations decline
  // Returns: {births: number, deaths: number, newPopulation: number}
  const popChange = calculatePopulationChange(
    currentPopulation,  // Current population count
    currentFood,        // Food available after harvest
    totalFoodNeeded,    // Food needed to feed everyone
    activeConfig        // Birth/death rate configuration
  );
  
  // === UPDATE POPULATION ===
  // Apply the population change for today
  currentPopulation = popChange.newPopulation;

  // === RECORD POPULATION DATA POINT ===
  // Store today's population statistics for visualization
  // This data powers the population chart and tooltip details
  populationSimulation.push({
    x: dayIndex,                                  // X-axis position (day number)
    population: Math.round(currentPopulation),    // Current population count
    births: popChange.births,                     // How many were born today
    deaths: popChange.deaths,                     // How many died today
    foodRatio: Math.min(1, currentFood / totalFoodNeeded)  // Food security (0-1, capped at 1)
  });

  // === RECORD FOOD DATA POINT #1: AFTER GROWTH ===
  // This is the "high point" of the sawtooth pattern
  // Shows food stock after harvest but before consumption
  foodSimulation.push({
    x: dayIndex,                             // X-axis position (day number)
    food: Math.round(currentFood * 10) / 10, // Current food stock (rounded)
    phase: 'growth',                         // Phase indicator for tooltip
    growth: Math.round(growth * 10) / 10     // How much was harvested today
  });

  // === MIDDAY PHASE: POPULATION CONSUMES FOOD ===
  // At noon, the population eats their daily ration
  // This represents the day's food consumption
  currentFood -= totalFoodNeeded;
  
  // === PREVENT NEGATIVE FOOD ===
  // You can't have less than zero food
  // If there's a shortage, food goes to 0 (people go hungry)
  // The population change calculation already factored this in
  if (currentFood < 0) currentFood = 0;

  // === RECORD FOOD DATA POINT #2: AFTER CONSUMPTION ===
  // This is the "low point" of the sawtooth pattern
  // Shows food stock after the population has eaten
  // The x-position of dayIndex + 0.5 places it between two days
  // This creates the characteristic sawtooth visualization
  foodSimulation.push({
    x: dayIndex + 0.5,                       // X-axis position (halfway through day)
    food: Math.round(currentFood * 10) / 10, // Current food stock (after consumption)
    phase: 'consumption',                    // Phase indicator for tooltip
    consumed: totalFoodNeeded                // How much was consumed
  });
}

// === SAVE FOOD AND POPULATION DATA TO STATE ===
// These trigger re-renders with the new timeline data
// React will update all charts that depend on these arrays
setFoodData(foodSimulation);
setPopulationData(populationSimulation);

}, [seed, activeConfig]); // Effect dependencies: re-run when seed or config changes

/* ============================================================
   CURRENT DAY DATA OBJECT
   ============================================================ */

/**
 * Composite object containing all data for the currently selected day.
 * This merges temperature data and population data into a single object
 * for easy access in the UI components.
 * 
 * Properties available:
 * - dayIndex: Absolute day number
 * - year: Which year this day is in
 * - dayOfYear: Day within the year (0-364)
 * - season: Season name
 * - temperature: Temperature in °F
 * - population: Current population count
 */
const current = {
  ...data[currentDay],                              // Spread all temperature data
  population: populationData[currentDay]?.population // Add population (with null safety)
};

/* ============================================================
   RENDER-TIME CONFIGURATION OBJECTS
   ============================================================ */

/**
 * Seasons array rebuilt from activeConfig for rendering.
 * This is used by JSX components that need season information
 * (chart background shading, season labels, etc.)
 * 
 * Note: This is rebuilt here rather than stored in state because
 * it's derived data - it's always computed from activeConfig.
 */
const seasons = [
  { name: 'Winter', length: activeConfig.winterLength },
  { name: 'Spring', length: activeConfig.springLength },
  { name: 'Summer', length: activeConfig.summerLength },
  { name: 'Fall', length: activeConfig.fallLength }
];

/**
 * Crop configuration rebuilt from activeConfig for rendering.
 * Used when displaying crop growth curves and calculating
 * what-if scenarios in the UI.
 */
const cropConfig = {
  optimalTemp: activeConfig.optimalTemp,
  tolerance: activeConfig.tolerance,
  maxGrowth: activeConfig.maxGrowth,
  minGrowth: activeConfig.minGrowth
};

/* ============================================================
   SEASON NAME CALCULATION
   ============================================================ */

/**
 * Calculate the actual current season name accounting for starting season offset.
 * 
 * This is necessary because the user can choose which season the year starts in.
 * If they choose "Summer" as the starting season, then day 0 is in Summer,
 * not Winter. This function handles that remapping.
 * 
 * Algorithm:
 * 1. Validate that we have a valid day
 * 2. Get the day within the year (0-364)
 * 3. Reorder seasons to start from the chosen starting season
 * 4. Accumulate season lengths until we find which season contains this day
 * 5. Return the season name
 * 
 * @returns {string} Season name ('Winter', 'Spring', 'Summer', or 'Fall')
 */
const getCurrentSeasonName = () => {
  // === VALIDATION ===
  // Check if dayOfYear exists (could be undefined if no data loaded)
  // Note: dayOfYear can be 0, so we need explicit null/undefined check
  if (!current.dayOfYear && current.dayOfYear !== 0) return '-';

  // === NORMALIZE DAY OF YEAR ===
  // Ensure we're working with a day within a single year (0-364)
  // In multi-year simulations, this wraps back to the start
  const dayOfYear = current.dayOfYear % 365;

  // === REORDER SEASONS ===
  // Build an array of seasons starting from the user's chosen starting season
  // Example: if starting season is "Summer", order becomes [Summer, Fall, Winter, Spring]
  
  // Get array of just season names
  const seasonNames = seasons.map(s => s.name);
  
  // Find index of the starting season
  const startIndex = seasonNames.indexOf(activeConfig.startingSeason);
  
  // Create reordered array:
  // - Take seasons from startIndex to end: seasons.slice(startIndex)
  // - Append seasons from beginning to startIndex: seasons.slice(0, startIndex)
  const orderedSeasons = [
    ...seasons.slice(startIndex),    // From chosen start to end of year
    ...seasons.slice(0, startIndex)  // From beginning of year to chosen start
  ];

  // === FIND WHICH SEASON CONTAINS THIS DAY ===
  // Accumulate season lengths and check if we've reached the target day
  let accumulated = 0;  // Running total of days consumed by previous seasons
  
  for (const season of orderedSeasons) {
    // Check if this day falls within the current season's range
    // Example: if accumulated = 90 and season.length = 92,
    // then this season covers days 90-181
    if (dayOfYear < accumulated + season.length) {
      // Found it! This day is in this season
      return season.name;
    }
    
    // This season is complete, add its length to the running total
    accumulated += season.length;
  }

  // === FALLBACK ===
  // Should never reach here if seasons sum to 365 correctly
  // But if they don't (due to user error in settings), default to first season
  return orderedSeasons[0].name;
};

// Execute the function to get the actual current season name
// This value is used throughout the UI to display the current season
const actualCurrentSeason = getCurrentSeasonName();


/* ============================================================
=== UI & VISUALIZATION ===================================
============================================================ */

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>

      {/* === SETTINGS SIDE PANEL === */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: showSettings ? 0 : -450,  // Slides in/out
          width: 400,
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
          transition: 'right 0.3s ease',
          overflowY: 'auto',
          zIndex: 1000,
          padding: 20
        }}>
          <h2>Settings</h2>

          {/* Close button */}
          <button
            onClick={() => setShowSettings(false)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '5px 10px',
              cursor: 'pointer',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
          ✕
          </button>

          {/* === SAVE CHANGES BUTTON === */}
          <button
            onClick={() => {
              setActiveConfig({...workingConfig});
              setSeed(Math.random()); // Regenerate with new config
              setShowSettings(false); // Close panel
            }}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            💾 Save Changes & Regenerate
          </button>

          {/* === CLIMATE PRESETS SECTION === */}
          <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#e8f5f9', borderRadius: 5 }}>
            <label style={{ display: 'block', marginBottom: 10 }}>
              <strong>🌍 Climate Preset:</strong>
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const preset = CLIMATE_PRESETS[e.target.value];
                  setWorkingConfig({
                    ...workingConfig,
                    ...preset.config,
                    yearCount: workingConfig.yearCount,      // Keep current year count
                    startingSeason: workingConfig.startingSeason  // Keep current starting season
                  });
                }
              }}
              style={{
                width: '100%',
                padding: 8,
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
                marginBottom: 10
              }}
            >
              <option value="">-- Select a Preset --</option>
              {Object.entries(CLIMATE_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>

            <p style={{ fontSize: 11, color: '#666', margin: 0, fontStyle: 'italic' }}>
              Choose a preset to quickly configure climate settings. You can still customize after selecting.
            </p>
          </div>

          {/* === CROP PRESETS SECTION === */}
          <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#e8f5f9', borderRadius: 5 }}>
            <label style={{ display: 'block', marginBottom: 10 }}>
              <strong>🌾 Crop Preset:</strong>
            </label>
            <select
              onChange={(e) => {
              if (e.target.value) {
                const preset = CROP_PRESETS[e.target.value];
                setWorkingConfig({
                  ...workingConfig,
                  ...preset.config,
                  yearCount: workingConfig.yearCount,      // Keep current year count
                  startingSeason: workingConfig.startingSeason  // Keep current starting season
                });
              }
              }}
              style={{
                width: '100%',
                padding: 8,
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
                marginBottom: 10
              }}
            >
              <option value="">-- Select a Preset --</option>
              {Object.entries(CROP_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>

            <p style={{ fontSize: 11, color: '#666', margin: 0, fontStyle: 'italic' }}>
              Choose a preset to quickly configure crop settings. You can still customize after selecting.
            </p>
          </div>

          {/* === TIME SETTINGS SECTION === */}
          <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
            <div 
              onClick={() => setExpandedSections({
                time: false,
                seasons: false,
                profiles: false,
                crop: false,
                food: false,
                time: !expandedSections.time  // Only this one toggles
              })}
              style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Time Settings</span>
              <span>{expandedSections.time ? '▼' : '▶'}</span>
            </div>

            {expandedSections.time && (
              <div style={{ paddingLeft: 10 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Year Count:</strong>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={workingConfig.yearCount}
                    onChange={(e) => setWorkingConfig({...workingConfig, yearCount: Number(e.target.value)})}
                    style={{
                      marginLeft: 10,
                      padding: 5,
                      width: 80
                    }}
                  />
                </label>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                  Total days: {365 * yearCount}
                </p>
                <label style={{ display: 'block', marginTop: 15 }}>
                  <strong>Starting Season:</strong>
                  <select
                    value={workingConfig.startingSeason}
                    onChange={(e) => {
                      setWorkingConfig({...workingConfig, startingSeason: e.target.value});
                    }}
                    style={{
                      marginLeft: 10,
                      padding: 5,
                      width: 120
                    }}
                  >
                    <option value="Winter">❄️ Winter</option>
                    <option value="Spring">🌸 Spring</option>
                    <option value="Summer">☀️ Summer</option>
                    <option value="Fall">🍂 Fall</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          {/* === SEASON LENGTHS SECTION === */}
          <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
            <div 
              onClick={() => setExpandedSections({
                time: false,
                seasons: false,
                profiles: false,
                crop: false,
                food: false,
                seasons: !expandedSections.seasons  // Only this one toggles
              })}
              style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Season Lengths</span>
              <span>{expandedSections.seasons ? '▼' : '▶'}</span>
            </div>

            {expandedSections.seasons && (
              <div style={{ paddingLeft: 10 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Winter (days):</strong>
                  <input 
                    type="number"
                    min="1"
                    max="365"
                    value={workingConfig.winterLength}
                    onChange={(e) => setWorkingConfig({...workingConfig, winterLength: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Spring (days):</strong>
                  <input 
                    type="number"
                    min="1"
                    max="365"
                    value={workingConfig.springLength}
                    onChange={(e) => setWorkingConfig({...workingConfig, springLength: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Summer (days):</strong>
                  <input 
                    type="number"
                    min="1"
                    max="365"
                    value={workingConfig.summerLength}
                    onChange={(e) => setWorkingConfig({...workingConfig, summerLength: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Fall (days):</strong>
                  <input 
                    type="number"
                    min="1"
                    max="365"
                    value={workingConfig.fallLength}
                    onChange={(e) => setWorkingConfig({...workingConfig, fallLength: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>

                {/* Validation warning */}
                <p style={{ 
                  fontSize: 12, 
                  color: workingConfig.winterLength + workingConfig.springLength + workingConfig.summerLength + workingConfig.fallLength === 365 ? '#27ae60' : '#e74c3c',
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                Total: {workingConfig.winterLength + workingConfig.springLength + workingConfig.summerLength + workingConfig.fallLength} days
                {workingConfig.winterLength + workingConfig.springLength + workingConfig.summerLength + workingConfig.fallLength !== 365 && ' ⚠️ Must equal 365!'}
                </p>
              </div>
            )}
          </div>

          {/* === SEASON PROFILES SECTION === */}
          <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
            <div 
              onClick={() => setExpandedSections({
                time: false,
                seasons: false,
                profiles: false,
                crop: false,
                food: false,
                profiles: !expandedSections.profiles
              })}
              style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Season Profiles</span>
              <span>{expandedSections.profiles ? '▼' : '▶'}</span>
            </div>

            {expandedSections.profiles && (
              <div style={{ paddingLeft: 10 }}>
                <p style={{ fontSize: 12, color: '#666', marginTop: 0 }}>
                  Controls temperature variation within each season
                </p>

                {/* Winter */}
                <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
                  <strong style={{ display: 'block', marginBottom: 5 }}>❄️ Winter</strong>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>
                    Mean Temp (°F):
                    <input 
                      type="number"
                      value={workingConfig.winterMean}
                      onChange={(e) => setWorkingConfig({...workingConfig, winterMean: Number(e.target.value)})}
                      style={{ marginLeft: 10, padding: 3, width: 60 }}
                    />
                  </label>
                  <label style={{ display: 'block', fontSize: 14 }}>
                    Amplitude:
                    <input 
                      type="number"
                      min="0"
                      max="30"
                      value={workingConfig.winterAmp}
                      onChange={(e) => setWorkingConfig({...workingConfig, winterAmp: Number(e.target.value)})}
                      style={{ marginLeft: 10, padding: 3, width: 60 }}
                    />
                  </label>
                </div>

                {/* Spring */}
                <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
                  <strong style={{ display: 'block', marginBottom: 5 }}>🌸 Spring</strong>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>
                    Mean Temp (°F):
                    <input 
                      type="number"
                      value={workingConfig.springMean}
                      onChange={(e) => setWorkingConfig({...workingConfig, springMean: Number(e.target.value)})}
                      style={{ marginLeft: 10, padding: 3, width: 60 }}
                    />
                  </label>
                  <label style={{ display: 'block', fontSize: 14 }}>
                    Amplitude:
                    <input 
                      type="number"
                      min="0"
                      max="30"
                      value={workingConfig.springAmp}
                      onChange={(e) => setWorkingConfig({...workingConfig, springAmp: Number(e.target.value)})}
                      style={{ marginLeft: 10, padding: 3, width: 60 }}
                    />
                  </label>
                </div>

                {/* Summer */}
                <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
                  <strong style={{ display: 'block', marginBottom: 5 }}>☀️ Summer</strong>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>
                    Mean Temp (°F):
                    <input 
                      type="number"
                      value={workingConfig.summerMean}
                      onChange={(e) => setWorkingConfig({...workingConfig, summerMean: Number(e.target.value)})}
                      style={{ marginLeft: 10, padding: 3, width: 60 }}
                    />
                  </label>
                  <label style={{ display: 'block', fontSize: 14 }}>
                    Amplitude:
                    <input 
                      type="number"
                      min="0"
                      max="30"
                      value={workingConfig.summerAmp}
                      onChange={(e) => setWorkingConfig({...workingConfig, summerAmp: Number(e.target.value)})}
                      style={{ marginLeft: 10, padding: 3, width: 60 }}
                    />
                  </label>
                </div>

                {/* Fall */}
                <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
                <strong style={{ display: 'block', marginBottom: 5 }}>🍂 Fall</strong>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>
                Mean Temp (°F):
                <input 
                type="number"
                value={workingConfig.fallMean}
                onChange={(e) => setWorkingConfig({...workingConfig, fallMean: Number(e.target.value)})}
                style={{ marginLeft: 10, padding: 3, width: 60 }}
                />
                </label>
                <label style={{ display: 'block', fontSize: 14 }}>
                Amplitude:
                <input 
                type="number"
                min="0"
                max="30"
                value={workingConfig.fallAmp}
                onChange={(e) => setWorkingConfig({...workingConfig, fallAmp: Number(e.target.value)})}
                style={{ marginLeft: 10, padding: 3, width: 60 }}
                />
                </label>
                </div>

                <p style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>
                  Note: Mean values are reference only. Amplitude controls mid-season variation.
                </p>
              </div>
            )}
          </div>

          {/* === CROP CONFIG SECTION === */}
          <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
            <div 
              onClick={() => setExpandedSections({
                time: false,
                seasons: false,
                profiles: false,
                crop: false,
                food: false,
                crop: !expandedSections.crop
              })}
              style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>🌾 Crop Configuration</span>
              <span>{expandedSections.crop ? '▼' : '▶'}</span>
            </div>

            {expandedSections.crop && (
              <div style={{ paddingLeft: 10 }}>
                <p style={{ fontSize: 12, color: '#666', marginTop: 0 }}>
                  Bell curve parameters for temperature-based growth
                </p>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Optimal Temperature (°F):</strong>
                  <input 
                    type="number"
                    min="-10"
                    max="110"
                    value={workingConfig.optimalTemp}
                    onChange={(e) => setWorkingConfig({...workingConfig, optimalTemp: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 15px 0' }}>
                  Peak of the growth curve - where crops thrive best
                </p>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Tolerance (°F):</strong>
                  <input 
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={workingConfig.tolerance}
                    onChange={(e) => setWorkingConfig({...workingConfig, tolerance: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 15px 0' }}>
                  How forgiving the crop is (higher = wider growing range)
                </p>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Max Growth (units/day):</strong>
                  <input 
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={workingConfig.maxGrowth}
                    onChange={(e) => setWorkingConfig({...workingConfig, maxGrowth: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 15px 0' }}>
                  Maximum yield at optimal temperature
                </p>

                <label style={{ display: 'block', marginBottom: 10 }}>
                <strong>Min Growth (units/day):</strong>
                  <input 
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={workingConfig.minGrowth}
                    onChange={(e) => setWorkingConfig({...workingConfig, minGrowth: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 0 0' }}>
                  Safety floor - prevents complete crop failure
                </p>
              </div>
            )}
          </div>

          {/* === FOOD ECONOMY SECTION === */}
          <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
            <div 
              onClick={() => setExpandedSections({
                time: false,
                seasons: false,
                profiles: false,
                crop: false,
                food: false,
                food: !expandedSections.food
              })}
              style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              >
                <span>🍞 Food Economy</span>
                <span>{expandedSections.food ? '▼' : '▶'}</span>
            </div>

            {expandedSections.food && (
              <div style={{ paddingLeft: 10 }}>
                <p style={{ fontSize: 12, color: '#666', marginTop: 0 }}>
                  Starting conditions and consumption rates
                </p>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Starting Food (units):</strong>
                  <input 
                    type="number"
                    min="0"
                    max="10000"
                    step="10"
                    value={workingConfig.startingFood}
                    onChange={(e) => setWorkingConfig({...workingConfig, startingFood: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 15px 0' }}>
                  Initial stockpile buffer
                </p>

                <label style={{ display: 'block', marginBottom: 10 }}>
                  <strong>Daily Consumption (units/day):</strong>
                  <input 
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={workingConfig.foodPerPerson*workingConfig.startingPopulation}
                    onChange={(e) => setWorkingConfig({...workingConfig, foodPerPerson: Number(e.target.value)})}
                    style={{ marginLeft: 10, padding: 5, width: 80 }}
                  />
                </label>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 0 0' }}>
                  How much food is consumed each day
                </p>
              </div>
              )}
          </div>
        </div>

      {/* Overlay when settings open */}
      {showSettings && (
        <div 
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      <h1>Multi-Year Temperature & Food Simulation</h1>

      {/* === CURRENT DAY READOUT === */}
      <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4'}}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4'}}>
            <strong>Current Day Data</strong><br />
            ---------------------------
            <br />
            
            <strong>Day:</strong> {currentDay}<br />
            <strong>Year:</strong> {current.year + 1 ?? '-'}<br />
            <strong>Season:</strong> {actualCurrentSeason}<br />
            <strong>Temperature:</strong> {current.temperature ?? '-'} °F<br />
          </div>
          <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4' }}>
            <strong>Current Population Data</strong><br />
            ---------------------------
            <br />
            <strong>Population:</strong> {current.population ?? '-'} beings<br />
            <strong>Birth rate:</strong> {activeConfig.baseBirthRate ?? '-'}<br />
            <strong>Births:</strong> {populationData[currentDay]?.births ?? '-'}<br />
            <strong>Deaths rate:</strong> {activeConfig.baseDeathRate ?? '-'}<br />
            <strong>Deaths:</strong> {populationData[currentDay]?.deaths ?? '-'}<br />
          </div>
          <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4' }}>
            <strong>Current Food Data</strong><br />
            ---------------------------
            <br />
            <strong>Food Stock:</strong> {foodData[currentDay * 2]?.food ?? '-'} units<br />
            <strong>Base Growth:</strong>{' '}
            {calculateBasicGrowth(current.temperature, cropConfig).toFixed(1)} units/day<br />
            <strong>Growth Factor:</strong> {
              calculateGrowthFactor(current.population ?? 0).toFixed(2)
            }<br />
            <strong>Food Grown:</strong> {foodData[currentDay * 2]?.growth ?? '-'} units<br />
            <strong>Food Consumed:</strong> {(current.population * activeConfig.foodPerPerson) ?? '-'} units<br />
          </div>
        </div>
      </div>

      {/* === REGENERATE BUTTON === */}
      <button
        onClick={() => {
          setSeed(Math.random());
          setCurrentDay(0);
        }}
        style={{
          padding: '10px 16px',
          fontSize: '16px',
          marginBottom: '10px',
          backgroundColor: '#4ecdc4',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Generate New Temperature Pattern
      </button>

      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          padding: '10px 16px',
          fontSize: '16px',
          marginBottom: '10px',
          marginLeft: '10px',
          backgroundColor: '#9b59b6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        ⚙️ Settings
      </button>

      {/* === SCRUBBER === */}
      <label style={{ display: 'block' }}>
        <strong>Scrub through time:</strong>
        <input
          type="range"
          min={0}
          max={365 * activeConfig.yearCount - 1}
          value={currentDay}
          onChange={(e) => setCurrentDay(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </label>

      {/* === FOOD CHART === */}
      <div style={{ flex: '1 1 45%', minWidth: 400 }}>
        <h3>Food Stock Over Time</h3>
        <LineChart 
          width={1750} 
          height={400} 
          data={foodData} 
          margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 365 * activeConfig.yearCount]}
            label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
          />

          <YAxis
            label={{ value: 'Food (units)', angle: -90, position: 'insideLeft', offset: -5 }}
          />

          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div 
                    style={{ 
                        background: 'white', 
                        padding: 10, 
                        border: '1px solid #ccc',
                        borderRadius: 4
                    }}
                  >
                      <p><strong>Day:</strong> {Math.floor(data.x)}</p>
                      <p><strong>Food:</strong> {data.food} units</p>
                      <p><strong>Phase:</strong> {data.phase}</p>
                      {data.growth && <p><strong>Growth:</strong> +{data.growth}</p>}
                      {data.consumed && <p><strong>Consumed:</strong> -{data.consumed}</p>}
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 10 }}
          />

          {/* === Seasonal background shading === */}
          {Array.from({ length: activeConfig.yearCount }).map((_, year) => {
            // Start from the chosen starting season
            let dayCounter = year * 365;

            // Find which season to start with
            const startIndex = seasons.findIndex(s => s.name === activeConfig.startingSeason);

            // Reorder seasons to start from the selected one
            const orderedSeasons = [
              ...seasons.slice(startIndex),
              ...seasons.slice(0, startIndex)
            ];

            return orderedSeasons.map(season => {
              const x1 = dayCounter;
              const x2 = dayCounter + season.length;
              dayCounter = x2;

              return (
                <ReferenceArea
                  key={`${year}-${season.name}-${x1}`}
                  x1={x1}
                  x2={x2}
                  fill={SEASON_COLORS[season.name]}
                  strokeOpacity={0}
                />
              );
            });
          })}

          {/* Show current day as a vertical line */}
          {currentDay >= 0 && (
            <ReferenceLine 
              x={currentDay} 
              stroke="#2ecc71" 
              strokeWidth={2}
              label={{ 
                value: `Day ${currentDay}`, 
                position: 'top',
                fill: '#2ecc71',
                fontSize: 12
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="food"
            stroke="#4ecdc4"
            strokeWidth={2}
            dot={false}
            name="Food Stock"
          />
        </LineChart>
      </div>


      {/* === CHARTS SIDE BY SIDE === */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

        {/* === TEMPERATURE CHART === */}
        <div style={{ flex: '1 1 45%', minWidth: 400 }}>
          <h3>Temperature Over Time</h3>
          <LineChart 
            width={750} 
            height={400} 
            data={data} 
            margin={{ top: 20, right: 5, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="dayIndex"
              type="number"
              domain={[0, 365 * activeConfig.yearCount]}
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />

            <YAxis
            label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }}
            />

            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 10 }}
            />

            {/* === Seasonal background shading === */}
            {Array.from({ length: activeConfig.yearCount }).map((_, year) => {
              // Start from the chosen starting season
              let dayCounter = year * 365;

              // Find which season to start with
              const startIndex = seasons.findIndex(s => s.name === activeConfig.startingSeason);

              // Reorder seasons to start from the selected one
              const orderedSeasons = [
                ...seasons.slice(startIndex),
                ...seasons.slice(0, startIndex)
              ];

              return orderedSeasons.map(season => {
                const x1 = dayCounter;
                const x2 = dayCounter + season.length;
                dayCounter = x2;

                return (
                  <ReferenceArea
                    key={`${year}-${season.name}-${x1}`}
                    x1={x1}
                    x2={x2}
                    fill={SEASON_COLORS[season.name]}
                    strokeOpacity={0}
                  />
                );
              });
            })}

            {/* Show current day as a vertical line */}
            {currentDay >= 0 && (
              <ReferenceLine 
                x={currentDay} 
                stroke="#2ecc71" 
                strokeWidth={2}
                label={{ 
                  value: `Day ${currentDay}`, 
                  position: 'top',
                  fill: '#2ecc71',
                  fontSize: 12,
                  offset: 7
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ff6b6b"
              strokeWidth={2}
              dot={false}
              name="Daily Temperature"
            />
          </LineChart>
        </div>

        {/* === Population CHART === */}
        <div style={{ flex: '1 1 45%', minWidth: 400 }}>
          <h3>Population Over Time</h3>
          <LineChart 
            width={750} 
            height={400} 
            data={populationData} 
            margin={{ top: 20, right: 10, left: 5, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 365 * activeConfig.yearCount]}
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />

            <YAxis
              label={{ value: 'Population', angle: -90, position: 'insideLeft' }}
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div 
                      style={{ 
                        background: 'white', 
                        padding: 10, 
                        border: '1px solid #ccc',
                        borderRadius: 4
                      }}
                    >
                      <p><strong>Day:</strong> {Math.floor(data.x)}</p>
                      <p><strong>Population:</strong> {data.population}</p>
                      <p><strong>Births:</strong> +{data.births}</p>
                      <p><strong>Deaths:</strong> -{data.deaths}</p>
                      <p><strong>Food Ratio:</strong> {(data.foodRatio * 100).toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 10 }}
            />

            {/* Show current day as a vertical line */}
            {currentDay >= 0 && (
              <ReferenceLine 
                x={currentDay} 
                stroke="#2ecc71" 
                strokeWidth={2}
                label={{ 
                  value: `Day ${currentDay}`, 
                  position: 'top',
                  fill: '#2ecc71',
                  fontSize: 12,
                  offset: 7
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="population"
              stroke="#4ecdc4"
              strokeWidth={2}
              dot={false}
              name="Population"
            />
          </LineChart>
        </div>
      </div>

      {/* === GROWTH CURVES SIDE BY SIDE === */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 40 }}>

        {/* === BASIC CROP GROWTH CURVE === */}
        <div style={{ flex: '1 1 45%', minWidth: 400 }}>
          <h3>Base Crop Growth Rate by Temperature</h3>
          <p style={{ fontSize: 14, color: '#666' }}>
            Base food production per day at different temperatures (population = 100).
          </p>

          <LineChart 
            width={750} 
            height={300} 
            data={(() => {
              const curveData = [];
              for (let temp = -10; temp <= 110; temp += 1) {
                curveData.push({
                  temperature: temp,
                  growth: calculateBasicGrowth(temp, cropConfig)
                });
              }
              return curveData;
            })()}
            margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
          >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="temperature"
            type="number"
            domain={[-10, 110]}
            label={{ value: 'Temperature (°F)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Growth (units/day)', angle: -90, position: 'outside' }}
          />
          <Tooltip />
          {/* Current day's temperature reference line */}
          {current.temperature && (
            <ReferenceLine 
              x={current.temperature} 
              stroke="#ff6b6b" 
              strokeWidth={2}
              label={{ 
                value: `Current (${current.temperature}°F)`, 
                position: 'top',
                fill: '#ff6b6b',
                fontSize: 12
              }}
            />
          )}

          {/* Optimal temperature reference line */}
          <ReferenceLine 
            x={cropConfig.optimalTemp} 
            stroke="#2ecc71" 
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ 
              value: `Optimal (${cropConfig.optimalTemp}°F)`, 
              position: 'bottom',
              fill: '#2ecc71',
              fontSize: 12
            }}
          />

          <Line
            type="monotone"
            dataKey="growth"
            stroke="#2ecc71"
            strokeWidth={3}
            dot={false}
            name="Base Growth Rate"
          />
          </LineChart>
        </div>

        {/* === POPULATION GROWTH FACTOR === */}
        <div style={{ flex: '1 1 45%', minWidth: 400 }}>
          <h3>Population Growth Factor</h3>
          <p style={{ fontSize: 14, color: '#666' }}>
            How population size affects total food production capacity.
          </p>

          <LineChart 
            width={750} 
            height={300} 
            data={(() => {
              const factorData = [];
              for (let pop = 0; pop <= 20000; pop += 10) {
                let populationFactor = pop < 1000 ? 1 : (Math.floor(pop / 50) * 0.1);
                if (pop >= 10000) {
                  populationFactor = 20; // Cap growth factor for very large populations
                }
                factorData.push({
                  population: pop,
                  factor: populationFactor
                });
              }
              console.log('Population factor data:', factorData);
              return factorData;
            })()}
            margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="population"
              type="number"
              label={{ value: 'Population', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Growth Multiplier', angle: -90, position: 'outside' }}
            />
            <Tooltip />
            {/* Show current day's temperature as a dot on the curve */}
            {current.population !== undefined && current.population !== null && (
              <ReferenceLine 
                x={current.population} 
                stroke="#ff6b6b" 
                strokeWidth={2}
                label={{ 
                  value: `Current Population (${current.population})`, 
                  position: 'top',
                  fill: '#ff6b6b',
                  fontSize: 12
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="factor"
              stroke="#9b59b6"
              strokeWidth={3}
              dot={false}
              name="Population Factor"
            />
          </LineChart>
        </div>

      </div>

    </div>
  );
}
