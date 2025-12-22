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

import { useEffect, useState } from 'react';

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

/* ============================================================
   === SIMULATION CONSTANTS ===================================
   ============================================================ */

/*
  Base temporal resolution.

  Internally, the simulation operates in whole days.
  Charts may use fractional offsets to show intra-day phases.
*/
const DAYS_PER_YEAR = 365;
const YEAR_COUNT = 1;
const TOTAL_DAYS = DAYS_PER_YEAR * YEAR_COUNT;

/*
  Seasonal definitions.

  IMPORTANT:
  - Lengths must sum to exactly 365
  - Otherwise seasonal boundaries will drift
*/
const SEASONS = [
  { name: 'Winter', length: 90 },
  { name: 'Spring', length: 92 },
  { name: 'Summer', length: 92 },
  { name: 'Fall',   length: 91 }
];

/*
  Seasonal climate tendencies.

  These do NOT hard-lock temperatures.
  They bias the baseline so seasons feel distinct
  while remaining smooth and continuous.
*/
const SEASON_PROFILES = {
  Winter: { mean: 15, amp: 10 },
  Spring: { mean: 65, amp: 12 },
  Summer: { mean: 90, amp: 10 },
  Fall:   { mean: 55, amp: 12 }
};

/*
  Background colors for seasonal shading.
  Used in both temperature and food charts.
*/
const SEASON_COLORS = {
  Winter: 'rgba(173, 216, 230, 0.25)',
  Spring: 'rgba(222, 208, 135, 0.25)',
  Summer: 'rgba(144, 238, 144, 0.25)',
  Fall:   'rgba(222, 174, 135, 0.25)'
};

/*
  Crop growth configuration.

  Defines the temperature → growth curve.
  The model is continuous, symmetric, and never zero-output.
*/
const CROP_CONFIG = {
  optimalTemp: 65,   // °F where crops grow best
  tolerance: 12,     // Controls bell-curve width
  maxGrowth: 10,     // Daily growth at optimal temp
  minGrowth: 0.2     // Floor to avoid total collapse
};

/*
  Daily food consumption.

  Designed to later scale with population,
  policy modifiers, or rationing.
*/
const DAILY_CONSUMPTION = 5;

/*
  Initial food stockpile.

  Acts as an early buffer against bad weather streaks.
*/
const STARTING_FOOD = 100;

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
function getSeasonForDay(dayOfYear) {
  let accumulated = 0;

  for (const season of SEASONS) {
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
function seasonalBaseline(seasonName, progress, dayOfYear) {
  // Phase shift so summer peaks correctly
  const WAVE_SHIFT_DAYS = -45;

  const annualProgress =
    (dayOfYear + WAVE_SHIFT_DAYS) / DAYS_PER_YEAR;

  const annualMean = 52;
  const annualAmplitude = 22;

  // Primary annual sine wave
  const annualWave =
    annualMean +
    annualAmplitude *
      Math.sin(2 * Math.PI * (annualProgress - 0.25));

  // Small seasonal offsets for asymmetry
  const seasonOffsets = {
    Winter: -5,
    Spring: 0,
    Summer: +5,
    Fall:   0
  };

  // Gentle curvature within each season
  const amp = SEASON_PROFILES[seasonName]?.amp ?? 0;
  const intraSeason =
    amp *
    Math.sin(progress * Math.PI) *
    0.3;

  return annualWave + seasonOffsets[seasonName] + intraSeason;
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
  const signal =
    Math.sin(dayIndex * 0.173 + seed * 100) * 0.5 + 0.5;

  // Most days have no extreme event
  if (signal < 0.97) return 0;

  const magnitude =
    8 + 6 * Math.abs(Math.sin(dayIndex * 0.91));

  if (seasonName === 'Summer') return +magnitude;
  if (seasonName === 'Winter') return -magnitude;

  // Shoulder seasons can swing either way
  return Math.sin(dayIndex * 0.37) > 0
    ? +magnitude
    : -magnitude;
}

/**
 * Convert temperature into daily food growth.
 *
 * Uses a Gaussian bell curve centered on optimalTemp.
 *
 * @param {number} temperature - Daily average temperature (°F)
 * @returns {number} Food units produced this day
 */
function calculateGrowth(temperature) {
  const { optimalTemp, tolerance, maxGrowth, minGrowth } = CROP_CONFIG;

  const deviation = temperature - optimalTemp;

  const bellCurve =
    Math.exp(-(deviation ** 2) / (2 * tolerance ** 2));

  return minGrowth + maxGrowth * bellCurve;
}

/* ============================================================
   === MAIN REACT COMPONENT ==================================
   ============================================================ */

export default function TemperatureSimulation() {
  /*
    Full temperature timeline.
    One entry per day.
  */
  const [data, setData] = useState([]);

  /*
    Currently selected day (scrubber-controlled).
  */
  const [currentDay, setCurrentDay] = useState(0);

  /*
    Seed controlling all pseudo-random variation.
    Changing this regenerates the entire world.
  */
  const [seed, setSeed] = useState(Math.random());

  /*
    Food timeline.
    Two entries per day:
    - After growth
    - After consumption
  */
  const [foodData, setFoodData] = useState([]);

  /*
    Generate both temperature and food simulations
    whenever the seed changes.
  */
  useEffect(() => {
    const generated = [];

    /* ==============================
       TEMPERATURE SIMULATION
       ============================== */
    for (let dayIndex = 0; dayIndex < TOTAL_DAYS; dayIndex++) {
      const year = Math.floor(dayIndex / DAYS_PER_YEAR);
      const dayOfYear = dayIndex % DAYS_PER_YEAR;

      const season = getSeasonForDay(dayOfYear);

      const base = seasonalBaseline(
        season.name,
        season.progress,
        dayOfYear
      );

      // Weekly oscillation (weather fronts)
      const daily =
        2 * Math.sin((2 * Math.PI * dayIndex) / 7);

      // Longer-term noise layers
      const noise =
        3 * Math.sin(dayIndex / 20 + seed * 10) +
        2 * Math.sin(dayIndex / 10 + seed * 20);

      const extreme =
        extremeEvent(dayIndex, season.name, seed);

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
       FOOD PRODUCTION SIMULATION
       ============================== */
    const foodSimulation = [];
    let currentFood = STARTING_FOOD;

    for (let dayIndex = 0; dayIndex < TOTAL_DAYS; dayIndex++) {
      const temp = generated[dayIndex].temperature;
      const growth = calculateGrowth(temp);

      // --- MORNING: harvest completes ---
      currentFood += growth;
      foodSimulation.push({
        x: dayIndex,
        food: Math.round(currentFood * 10) / 10,
        phase: 'growth',
        growth: Math.round(growth * 10) / 10
      });

      // --- MIDDAY: population consumes ---
      currentFood -= DAILY_CONSUMPTION;
      if (currentFood < 0) currentFood = 0;

      foodSimulation.push({
        x: dayIndex + 0.5,
        food: Math.round(currentFood * 10) / 10,
        phase: 'consumption',
        consumed: DAILY_CONSUMPTION
      });
    }

    setFoodData(foodSimulation);
  }, [seed]);

  /*
    Currently selected day's temperature data.
  */
  const current = data[currentDay] ?? {};

  /* ============================================================
     === UI & VISUALIZATION ===================================
     ============================================================ */

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Multi-Year Temperature & Food Simulation</h1>

      {/* === CURRENT DAY READOUT === */}
      <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4' }}>
        <strong>Day:</strong> {currentDay}<br />
        <strong>Year:</strong> {current.year + 1 ?? '-'}<br />
        <strong>Season:</strong> {current.season ?? '-'}<br />
        <strong>Temperature:</strong> {current.temperature ?? '-'} °F<br />
        <strong>Food Stock:</strong> {foodData[currentDay * 2]?.food ?? '-'} units<br />
        <strong>Consumption Rate:</strong> {DAILY_CONSUMPTION} units/day<br />
        <strong>Daily Growth:</strong>{' '}
        {current.temperature
          ? calculateGrowth(current.temperature).toFixed(1)
          : '-'} units/day
      </div>

      {/* === REGENERATE BUTTON === */}
      <button
        onClick={() => {
          setSeed(Math.random());
          setCurrentDay(0);
        }}
      >
        Generate New Climate
      </button>

      {/* === SCRUBBER === */}
      <label style={{ display: 'block' }}>
        <strong>Scrub through time:</strong>
        <input
          type="range"
          min={0}
          max={TOTAL_DAYS - 1}
          value={currentDay}
          onChange={(e) => setCurrentDay(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </label>

 {/* === CHARTS SIDE BY SIDE === */}
<div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
  
  {/* === TEMPERATURE CHART === */}
  <div style={{ flex: '1 1 45%', minWidth: 400 }}>
    <h3>Temperature Over Time</h3>
    <LineChart 
      width={450} 
      height={400} 
      data={data} 
      margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
    >
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis
        dataKey="dayIndex"
        type="number"
        domain={[0, TOTAL_DAYS]}
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
      {Array.from({ length: YEAR_COUNT }).map((_, year) => {
        let seasonStart = year * DAYS_PER_YEAR;

        return SEASONS.map(season => {
          const x1 = seasonStart;
          const x2 = seasonStart + season.length;
          seasonStart = x2;

          return (
            <ReferenceArea
              key={`${year}-${season.name}`}
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
        dataKey="temperature"
        stroke="#ff6b6b"
        strokeWidth={2}
        dot={false}
        name="Daily Temperature"
      />
    </LineChart>
  </div>

  {/* === FOOD CHART === */}
  <div style={{ flex: '1 1 45%', minWidth: 400 }}>
    <h3>Food Stock Over Time</h3>
    <LineChart 
      width={450} 
      height={400} 
      data={foodData} 
      margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
    >
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis
        dataKey="x"
        type="number"
        domain={[0, TOTAL_DAYS]}
        label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
      />

      <YAxis
        label={{ value: 'Food (units)', angle: -90, position: 'insideLeft' }}
      />

      <Tooltip 
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
              <div style={{ 
                background: 'white', 
                padding: 10, 
                border: '1px solid #ccc',
                borderRadius: 4
              }}>
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

      {/* === Seasonal background shading (same as temp chart) === */}
      {Array.from({ length: YEAR_COUNT }).map((_, year) => {
        let seasonStart = year * DAYS_PER_YEAR;

        return SEASONS.map(season => {
          const x1 = seasonStart;
          const x2 = seasonStart + season.length;
          seasonStart = x2;

          return (
            <ReferenceArea
              key={`food-${year}-${season.name}`}
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
  
</div>

{/* === GROWTH CURVE VISUALIZATION === */}
<div style={{ marginTop: 40 }}>
  <h3>Crop Growth Rate by Temperature</h3>
  <p style={{ fontSize: 14, color: '#666' }}>
    This shows how much food is produced per day at different temperatures.
    The curve is centered on the optimal temperature ({CROP_CONFIG.optimalTemp}°F).
  </p>
  
  <LineChart 
    width={900} 
    height={300} 
    data={(() => {
      // Generate curve data points from -10°F to 110°F
      const curveData = [];
      for (let temp = -10; temp <= 110; temp += 1) {
        curveData.push({
          temperature: temp,
          growth: calculateGrowth(temp)
        });
      }
      return curveData;
    })()}
    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    
    <XAxis
      dataKey="temperature"
      type="number"
      domain={[-10, 110]}
      label={{ value: 'Temperature (°F)', position: 'insideBottom', offset: -5 }}
    />
    
    <YAxis
      label={{ value: 'Food Growth (units/day)', angle: -90, position: 'insideLeft' }}
      domain={[0, CROP_CONFIG.maxGrowth + CROP_CONFIG.minGrowth + 1]}
    />
    
    <Tooltip 
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div style={{ 
              background: 'white', 
              padding: 10, 
              border: '1px solid #ccc',
              borderRadius: 4
            }}>
              <p><strong>Temperature:</strong> {data.temperature}°F</p>
              <p><strong>Growth Rate:</strong> {data.growth.toFixed(2)} units/day</p>
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
    
    {/* Vertical line at optimal temperature */}
    <ReferenceLine 
      x={CROP_CONFIG.optimalTemp} 
      stroke="#2ecc71" 
      strokeWidth={2}
      strokeDasharray="5 5"
      label={{ 
        value: `Optimal (${CROP_CONFIG.optimalTemp}°F)`, 
        position: 'top',
        fill: '#2ecc71',
        fontSize: 12
      }}
    />
    
    {/* Horizontal line at max growth */}
    <ReferenceLine 
      y={CROP_CONFIG.maxGrowth + CROP_CONFIG.minGrowth} 
      stroke="#3498db" 
      strokeWidth={1}
      strokeDasharray="3 3"
      label={{ 
        value: `Max Growth`, 
        position: 'right',
        fill: '#3498db',
        fontSize: 12
      }}
    />
    
    {/* Horizontal line at min growth */}
    <ReferenceLine 
      y={CROP_CONFIG.minGrowth} 
      stroke="#e74c3c" 
      strokeWidth={1}
      strokeDasharray="3 3"
      label={{ 
        value: `Min Growth`, 
        position: 'right',
        fill: '#e74c3c',
        fontSize: 12
      }}
    />
    
    {/* Show current day's temperature as a dot on the curve */}
    {current.temperature && (
      <ReferenceLine 
        x={current.temperature} 
        stroke="#ff6b6b" 
        strokeWidth={2}
        label={{ 
          value: `Current Day (${current.temperature}°F)`, 
          position: 'top',
          fill: '#ff6b6b',
          fontSize: 12
        }}
      />
    )}
    
    <Line
      type="monotone"
      dataKey="growth"
      stroke="#2ecc71"
      strokeWidth={3}
      dot={false}
      name="Growth Rate"
    />
  </LineChart>
</div>
    </div>
  );
}
