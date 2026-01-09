/* ============================================================
Temperature + Food Simulation
------------------------------------------------------------
This component models:
- A deterministic, seeded climate system
- Temperature-driven crop growth
- Daily food consumption
- Visualization of all systems over time

Design goals:
- Smoothness over hyper-realism
- Determinism per seed (replayable worlds)
- Explainability at every layer
- Clear extension points for future systems
============================================================ */

  import { act, useEffect, useState } from 'react';

/*
Recharts is used strictly for visualization.
All simulation logic is computed beforehand and passed in
as plain data so it can later be reused outside React.
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

  const SEASON_COLORS = {
    Winter: 'rgba(173, 216, 230, 0.25)',
    Spring: 'rgba(222, 208, 135, 0.25)',
    Summer: 'rgba(144, 238, 144, 0.25)',
    Fall:   'rgba(222, 174, 135, 0.25)'
  };

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
        springLength: 60,   // Short spring
        summerLength: 150,  // Very long, hot summer
        fallLength: 35,     // Short fall
        winterMean: 50,     // Mild winter days
        winterAmp: 15,      // Large day/night swings
        springMean: 70,
        springAmp: 18,
        summerMean: 95,     // Scorching summer
        summerAmp: 20,      // Extreme day/night variation
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
        winterAmp: 5,       // Very stable
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
        winterLength: 240,  // 8 months of winter
        springLength: 30,   // Short spring
        summerLength: 60,   // Brief summer
        fallLength: 35,     // Short fall
        winterMean: -10,    // Freezing
        winterAmp: 8,
        springMean: 25,
        springAmp: 10,
        summerMean: 50,     // Cool summer
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
        winterMean: 45,     // Mild winter
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
=== HELPER FUNCTIONS =======================================
============================================================ */

/**
 * Determine the active season for a given day of the year.
 *
 * @param {number} dayOfYear - Integer from 0 to 364
 * @returns {{
 *   name: string,
 *   progress: number
 * }}
 *
 * progress is normalized (0 → 1) within the season
 * and is used for smooth intra-season curves.
 */
  function getSeasonForDay(dayOfYear, seasons) {
    let accumulated = 0;

    for (const season of seasons) {
      if (dayOfYear < accumulated + season.length) {
        return {
          name: season.name,
          progress: (dayOfYear - accumulated) / season.length
        };
      }
      accumulated += season.length;
    }

    // Defensive fallback (should never occur)
    return { name: 'Winter', progress: 0 };
  }

/**
 * Generate the smooth annual temperature baseline.
 *
 * This function represents the "climate backbone".
 * All noise, daily swings, and extreme events are layered on top.
 *
 * @param {string} seasonName - Current season name
 * @param {number} progress - Normalized progress through the season (0–1)
 * @param {number} dayOfYear - Day index within the year
 * @returns {number} Baseline temperature in °F
 */
  function seasonalBaseline(seasonName, progress, dayOfYear, seasonProfiles, seasons, startingSeason) {
    // Build ordered seasons starting from the starting season
    const seasonNames = seasons.map(s => s.name);
    const startIndex = seasonNames.indexOf(startingSeason);
    const orderedSeasons = [
    ...seasons.slice(startIndex),
    ...seasons.slice(0, startIndex)
    ];

    // Calculate season midpoints and their target temperatures
    const seasonMidpoints = [];
    let cumulativeDays = 0;

    for (let i = 0; i < orderedSeasons.length; i++) {
      const season = orderedSeasons[i];
      const midpoint = cumulativeDays + season.length / 2;

      seasonMidpoints.push({
        name: season.name,
        midpointDay: midpoint,
        mean: seasonProfiles[season.name]?.mean ?? 50,
        amp: seasonProfiles[season.name]?.amp ?? 0,
        length: season.length
      });

      cumulativeDays += season.length;
    }

    // Find current position in the year
    const currentDayInYear = dayOfYear % 365;

    // Find the two closest season midpoints to interpolate between
    let prevMidpoint = seasonMidpoints[seasonMidpoints.length - 1];
    let nextMidpoint = seasonMidpoints[0];

    for (let i = 0; i < seasonMidpoints.length; i++) {
      const curr = seasonMidpoints[i];
      const next = seasonMidpoints[(i + 1) % seasonMidpoints.length];

      // Check if current day falls between this midpoint and the next
      if (i === seasonMidpoints.length - 1) {
      // Handle wrap-around case (last season wrapping to first)
        if (currentDayInYear >= curr.midpointDay || currentDayInYear < next.midpointDay) {
          prevMidpoint = curr;
          nextMidpoint = next;
          break;
        }
      } else {
        if (currentDayInYear >= curr.midpointDay && currentDayInYear < next.midpointDay) {
        prevMidpoint = curr;
        nextMidpoint = next;
        break;
        }
      }
    }

    // Calculate distance from previous midpoint
    let distanceFromPrev;
    let totalDistance;

    if (prevMidpoint.midpointDay > nextMidpoint.midpointDay) {
    // Wrap-around case
      if (currentDayInYear >= prevMidpoint.midpointDay) {
        distanceFromPrev = currentDayInYear - prevMidpoint.midpointDay;
      } else {
        distanceFromPrev = (365 - prevMidpoint.midpointDay) + currentDayInYear;
      }
      totalDistance = (365 - prevMidpoint.midpointDay) + nextMidpoint.midpointDay;
    } else {
      distanceFromPrev = currentDayInYear - prevMidpoint.midpointDay;
      totalDistance = nextMidpoint.midpointDay - prevMidpoint.midpointDay;
    }

    // Progress between the two midpoints (0 to 1)
    const progressBetweenMidpoints = distanceFromPrev / totalDistance;

    // Smooth cosine interpolation
    const smoothProgress = (1 - Math.cos(progressBetweenMidpoints * Math.PI)) / 2;
    const baseTemp = prevMidpoint.mean + (nextMidpoint.mean - prevMidpoint.mean) * smoothProgress;

    // Add intra-seasonal variation
    // Use the season we're currently closer to
    const currentSeasonMidpoint = progressBetweenMidpoints < 0.5 ? prevMidpoint : nextMidpoint;
    const seasonProgress = progress; // Progress within current season (0-1)
    const intraSeason = currentSeasonMidpoint.amp * Math.sin(seasonProgress * Math.PI) * 0.3;

    return baseTemp + intraSeason;
  }

/**
 * Inject rare but deterministic extreme weather events.
 *
 * @param {number} dayIndex - Absolute day index
 * @param {string} seasonName - Current season
 * @param {number} seed - Simulation seed
 * @returns {number} Temperature delta (°F)
 */
  function extremeEvent(dayIndex, seasonName, seed) {
    const signal = Math.sin(dayIndex * 0.173 + seed * 100) * 0.5 + 0.5;

    // Most days have no extreme event
    if (signal < 0.97) return 0;

    const magnitude =
    8 + 6 * Math.abs(Math.sin(dayIndex * 0.91));

    if (seasonName === 'Summer') return +magnitude;
    if (seasonName === 'Winter') return -magnitude;

    // Shoulder seasons can swing either way
    return Math.sin(dayIndex * 0.37) > 0 ? +magnitude : -magnitude;
  }

/**
 * Convert temperature into daily food growth.
 *
 * Uses a Gaussian bell curve centered on optimalTemp.
 *
 * @param {number} temperature - Daily average temperature (°F)
 * @returns {number} Food units produced this day
 */
  function calculateGrowth(temperature, cropConfig, population) {
    const { optimalTemp, tolerance, maxGrowth, minGrowth } = cropConfig;

    // Scale maxGrowth based on population (farmland expansion)
    const populationFactor = population < 100 ? 1 : (Math.floor(population / 100) * 0.5);
    const scaledMaxGrowth = maxGrowth * populationFactor;

    const deviation = temperature - optimalTemp;
    const bellCurve = Math.exp(-(deviation ** 2) / (2 * tolerance ** 2));

    return minGrowth + scaledMaxGrowth * bellCurve;
  }

  function calculateBasicGrowth(temperature, cropConfig) {
    const { optimalTemp, tolerance, maxGrowth, minGrowth } = cropConfig;
    const deviation = temperature - optimalTemp;
    const bellCurve = Math.exp(-(deviation ** 2) / (2 * tolerance ** 2));
    return minGrowth + maxGrowth * bellCurve;
  }

  function calculatePopulationChange(population, foodStock, totalFoodNeeded, config) {
    const { baseBirthRate, baseDeathRate } = config;

    // Food scarcity factor (0 = no food, 1 = adequate food)
    const foodRatio = Math.min(1, foodStock / totalFoodNeeded);

    // Adjust rates based on food availability
    const birthRate = baseBirthRate * foodRatio;
    const deathRate = baseDeathRate * (2 - foodRatio); // Higher death rate when food is scarce

    const births = Math.floor(population * birthRate);
    const deaths = Math.floor(population * deathRate);

    return { births, deaths, newPopulation: Math.max(0, population + births - deaths) };
  }

/*  ============================================================
=== MAIN REACT COMPONENT ==================================
============================================================ */

  export default function TemperatureSimulation() {
/*============================================================
=== COMPONENT STATE ========================================
============================================================ */

/*
Full temperature timeline.
One entry per day containing: dayIndex, year, dayOfYear, season, temperature
*/
  const [data, setData] = useState([]);

/*
Current day being viewed (controlled by scrubber slider).
Range: 0 to totalDays - 1
*/
  const [currentDay, setCurrentDay] = useState(0);

/*
Random seed for deterministic generation.
Same seed = same weather pattern.
Changes when user clicks "Generate New Pattern".
*/
  const [seed, setSeed] = useState(Math.random());

  const [activeConfig, setActiveConfig] = useState({
    yearCount: 1,
    winterLength: 90,
    springLength: 92,
    summerLength: 92,
    fallLength: 91,
    winterMean: 15,
    winterAmp: 10,
    springMean: 65,
    springAmp: 12,
    summerMean: 90,
    summerAmp: 10,
    fallMean: 55,
    fallAmp: 12,
    optimalTemp: 65,
    tolerance: 18,
    maxGrowth: 1000,
    minGrowth: 100,
    startingFood: 10000,
    startingSeason: 'Spring',
    startingPopulation: 1000,
    baseBirthRate: 0.01,
    baseDeathRate: 0.008,
    foodPerPerson: 1
  });

  const [workingConfig, setWorkingConfig] = useState({...activeConfig});

/*
Food stock timeline.
Two entries per day: one after growth (x: day), one after consumption (x: day + 0.5).
Creates the sawtooth pattern visible on food chart.
*/

  const [foodData, setFoodData] = useState([]);

  const [populationData, setPopulationData] = useState([]);


/*
Controls visibility of the settings side panel.
true = panel slides in from right, false = panel hidden
*/
  const [showSettings, setShowSettings] = useState(false);

// === TIME SETTINGS ===
/*
Number of years to simulate.
Total days = yearCount × 365
Affects: simulation length, chart x-axis domain
*/
  const [yearCount, setYearCount] = useState(1);

// Track which settings sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    time: true,      // Start with time section open
    seasons: false,
    profiles: false,
    crop: false,
    food: false
  });

/*
Generate both temperature and food simulations
whenever the seed changes.
*/

  useEffect(() => {
  // Calculate total days from activeConfig
  const totalDays = 365 * activeConfig.yearCount;


  // Build crop config from activeConfig
  const cropConfig = {
    optimalTemp: activeConfig.optimalTemp,
    tolerance: activeConfig.tolerance,
    maxGrowth: activeConfig.maxGrowth,
    minGrowth: activeConfig.minGrowth
  };

  // Build seasons array from activeConfig
  const seasons = [
    { name: 'Winter', length: activeConfig.winterLength },
    { name: 'Spring', length: activeConfig.springLength },
    { name: 'Summer', length: activeConfig.summerLength },
    { name: 'Fall', length: activeConfig.fallLength }
  ];

  // Build season profiles from activeConfig
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
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const year = Math.floor(dayIndex / 365);
    const dayOfYear = dayIndex % 365;

    const season = getSeasonForDay(dayOfYear, seasons);

    const base = seasonalBaseline(
      season.name,
      season.progress,
      dayOfYear,
      seasonProfiles,
      seasons,
      activeConfig.startingSeason
    );

    // Weekly oscillation (weather fronts)
    const daily =
    2 * Math.sin((2 * Math.PI * dayIndex) / 7);

    // Longer-term noise layers
    const noise =
    3 * Math.sin(dayIndex / 20 + seed * 10) +
    2 * Math.sin(dayIndex / 10 + seed * 20);

    const extreme = extremeEvent(dayIndex, season.name, seed);

    const temp = base + daily + noise + extreme;
    const safeTemp = Number.isFinite(temp) ? temp : 0;

    generated.push({
      dayIndex,
      year,
      dayOfYear,
      season: season.name,
      temperature: Math.round(safeTemp * 10) / 10
    });
  }

  setData(generated);

  /* ==============================
  FOOD & POPULATION SIMULATION
  ============================== */
  const foodSimulation = [];
  const populationSimulation = [];
  let currentFood = activeConfig.startingFood;
  let currentPopulation = activeConfig.startingPopulation;

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const temp = generated[dayIndex].temperature;
    const growth = calculateGrowth(temp, cropConfig, currentPopulation);

    // --- MORNING: harvest completes ---
    currentFood += growth;

    // Calculate daily food consumption based on population
    const totalFoodNeeded = currentPopulation * activeConfig.foodPerPerson;

    // Population change calculation
    const popChange = calculatePopulationChange(currentPopulation, currentFood, totalFoodNeeded, activeConfig);
    currentPopulation = popChange.newPopulation;

    // Record population data
    populationSimulation.push({
      x: dayIndex,
      population: Math.round(currentPopulation),
      births: popChange.births,
      deaths: popChange.deaths,
      foodRatio: Math.min(1, currentFood / totalFoodNeeded)
    });

    foodSimulation.push({
      x: dayIndex,
      food: Math.round(currentFood * 10) / 10,
      phase: 'growth',
      growth: Math.round(growth * 10) / 10
    });

    // --- MIDDAY: population consumes ---
    currentFood -= totalFoodNeeded;
    if (currentFood < 0) currentFood = 0;

    foodSimulation.push({
      x: dayIndex + 0.5,
      food: Math.round(currentFood * 10) / 10,
      phase: 'consumption',
      consumed: totalFoodNeeded
    });
  }

  setFoodData(foodSimulation);
  setPopulationData(populationSimulation);


  }, [seed, activeConfig]);

/*
Currently selected day's temperature data.
*/
  const current = {
    ...data[currentDay],
    population: populationData[currentDay]?.population
  };


// Build seasons array from activeConfig for use in JSX
  const seasons = [
    { name: 'Winter', length: activeConfig.winterLength },
    { name: 'Spring', length: activeConfig.springLength },
    { name: 'Summer', length: activeConfig.summerLength },
    { name: 'Fall', length: activeConfig.fallLength }
  ];

// Build crop config for use in JSX
  const cropConfig = {
    optimalTemp: activeConfig.optimalTemp,
    tolerance: activeConfig.tolerance,
    maxGrowth: activeConfig.maxGrowth,
    minGrowth: activeConfig.minGrowth
  };


// Calculate the actual current season accounting for starting season
const getCurrentSeasonName = () => {
  if (!current.dayOfYear && current.dayOfYear !== 0) return '-';

  const dayOfYear = current.dayOfYear % 365;

  // Build ordered seasons starting from starting season
  const seasonNames = seasons.map(s => s.name);
  const startIndex = seasonNames.indexOf(activeConfig.startingSeason);
  const orderedSeasons = [
    ...seasons.slice(startIndex),
    ...seasons.slice(0, startIndex)
  ];

  // Find which season this day falls into
  let accumulated = 0;
  for (const season of orderedSeasons) {
    if (dayOfYear < accumulated + season.length) {
      return season.name;
    }
    accumulated += season.length;
  }

  return orderedSeasons[0].name; // Fallback
};
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
      <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4' }}>
        <strong>Day:</strong> {currentDay}<br />
        <strong>Year:</strong> {current.year + 1 ?? '-'}<br />
        <strong>Season:</strong> {actualCurrentSeason}<br />
        <strong>Temperature:</strong> {current.temperature ?? '-'} °F<br />
        <strong>Food Stock:</strong> {foodData[currentDay * 2]?.food ?? '-'} units<br />
        <strong>Consumption Rate:</strong> {(activeConfig.foodPerPerson * current.population)} units/day<br />
        <strong>Daily Growth:</strong>{' '}
        {current.temperature
        ? calculateGrowth(current.temperature, cropConfig, current.population).toFixed(1)
        : '-'} units/day
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
              for (let pop = 50; pop <= 2000; pop += 10) {
                const factor = pop < 200 ? 1 : (Math.floor(pop / 50) * 0.2);
                factorData.push({
                  population: pop,
                  factor: factor
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
                  value: `Current Day (${current.population})`, 
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
