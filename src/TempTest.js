import { useEffect, useState } from 'react';
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

const DAYS_PER_YEAR = 365;
const YEAR_COUNT = 1;
const TOTAL_DAYS = DAYS_PER_YEAR * YEAR_COUNT;

/*
  Seasons are time-based and must sum to 365.
*/
const SEASONS = [
  { name: 'Winter', length: 90 },
  { name: 'Spring', length: 92 },
  { name: 'Summer', length: 92 },
  { name: 'Fall',   length: 91 }
];

/*
  Seasonal climate targets.
  Used for shaping, NOT forcing.
*/
const SEASON_PROFILES = {
  Winter: { mean: 15, amp: 10 },
  Spring: { mean: 65, amp: 12 },
  Summer: { mean: 90, amp: 10 },
  Fall:   { mean: 55, amp: 12 }
};

/*
  Background colors for seasons.
  These repeat once per year.
*/
const SEASON_COLORS = {
  Winter: 'rgba(173, 216, 230, 0.25)',
  Spring: 'rgba(144, 238, 144, 0.25)',
  Summer: 'rgba(255, 182, 193, 0.25)',
  Fall:   'rgba(222, 184, 135, 0.25)'
};

/*
  Crop growth parameters.
  These define how temperature affects food production.
*/
const CROP_CONFIG = {
  optimalTemp: 72,      // Temperature (°F) where crop grows best
  tolerance: 12,        // How forgiving the crop is to temp deviation (higher = more resilient)
  maxGrowth: 8,         // Maximum food units produced per day at optimal temp
  minGrowth: 0.2        // Minimum growth even in terrible conditions (prevents starvation deadlock)
};

/*
  Daily consumption rate.
  For now, this is constant. Later you'll multiply by population.
*/
const DAILY_CONSUMPTION = 5;

/*
  Starting food stockpile.
*/
const STARTING_FOOD = 100;

/* ============================================================
   === HELPER FUNCTIONS =======================================
   ============================================================ */

/**
 * Returns the season and progress (0–1) for a given day of year.
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

  return { name: 'Winter', progress: 0 };
}

/**
 * Smooth annual temperature baseline.
 * Ensures continuity and summer-centered peak.
 */
function seasonalBaseline(seasonName, progress, dayOfYear) {
  const WAVE_SHIFT_DAYS = -45;

  const annualProgress =
    (dayOfYear + WAVE_SHIFT_DAYS) / DAYS_PER_YEAR;

  const annualMean = 52;
  const annualAmplitude = 22;

  const annualWave =
    annualMean +
    annualAmplitude *
      Math.sin(2 * Math.PI * (annualProgress - 0.25));

  const seasonOffsets = {
    Winter: -5,
    Spring: 0,
    Summer: +5,
    Fall:   0
  };

  const amp = SEASON_PROFILES[seasonName]?.amp ?? 0;

  const intraSeason =
    amp *
    Math.sin(progress * Math.PI) *
    0.3;

  return annualWave + seasonOffsets[seasonName] + intraSeason;
}

/**
 * Rare, deterministic extreme events.
 */
function extremeEvent(dayIndex, seasonName, seed) {
  const signal = Math.sin(dayIndex * 0.173 + seed * 100) * 0.5 + 0.5;


  if (signal < 0.97) return 0;

  const magnitude =
    8 + 6 * Math.abs(Math.sin(dayIndex * 0.91));

  if (seasonName === 'Summer') return +magnitude;
  if (seasonName === 'Winter') return -magnitude;

  return Math.sin(dayIndex * 0.37) > 0
    ? +magnitude
    : -magnitude;
}

/**
 * Calculate food growth based on temperature.
 * Uses a bell curve (Gaussian) centered on optimal temperature.
 * 
 * @param {number} temperature - Current day's temperature in °F
 * @returns {number} Food units produced this day
 * 
 * How it works:
 * - At optimalTemp: produces maxGrowth
 * - As temp deviates: production drops exponentially
 * - Never drops below minGrowth (prevents zero-growth deadlock)
 * 
 * The formula: minGrowth + maxGrowth * e^(-(deviation²) / (2 * tolerance²))
 * This is a standard Gaussian/normal distribution bell curve.
 */
function calculateGrowth(temperature) {
  const { optimalTemp, tolerance, maxGrowth, minGrowth } = CROP_CONFIG;
  
  // How far is current temp from optimal? (can be positive or negative)
  const deviation = temperature - optimalTemp;
  
  // Bell curve calculation
  // - deviation² makes both hot and cold equally bad
  // - tolerance² controls how "wide" the bell is
  // - The exp() creates the smooth dropoff
  const bellCurve = Math.exp(-(deviation ** 2) / (2 * tolerance ** 2));
  
  // Scale the bell curve to our growth range
  // Result ranges from minGrowth (terrible conditions) to minGrowth + maxGrowth (perfect conditions)
  return minGrowth + maxGrowth * bellCurve;
}

/* ============================================================
   === MAIN COMPONENT =========================================
   ============================================================ */

export default function TemperatureSimulation() {
  const [data, setData] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [seed, setSeed] = useState(Math.random());
  const [foodData, setFoodData] = useState([]);

  useEffect(() => {
    const generated = [];

    for (let dayIndex = 0; dayIndex < TOTAL_DAYS; dayIndex++) {
      const year = Math.floor(dayIndex / DAYS_PER_YEAR);
      const dayOfYear = dayIndex % DAYS_PER_YEAR;

      const season = getSeasonForDay(dayOfYear);

      const base = seasonalBaseline(
        season.name,
        season.progress,
        dayOfYear
      );

      const daily =
        5 * Math.sin((2 * Math.PI * dayIndex) / 7);

      const noise =
        3 * Math.sin(dayIndex / 11.3 + seed * 10) +
        2 * Math.sin(dayIndex / 4.7 + seed * 20);


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
    
    // === FOOD PRODUCTION SIMULATION ===
    // Generate food data based on temperature
    // Each day has TWO datapoints: after growth, after consumption
    const foodSimulation = [];
    let currentFood = STARTING_FOOD;
    
    for (let dayIndex = 0; dayIndex < TOTAL_DAYS; dayIndex++) {
      // Get this day's temperature from our generated data
      const temp = generated[dayIndex].temperature;
      
      // Calculate how much food grows based on temperature
      const growth = calculateGrowth(temp);
      
      // === MORNING: After growth ===
      currentFood += growth;
      foodSimulation.push({
        x: dayIndex,              // Exact day (e.g., day 50.0)
        food: Math.round(currentFood * 10) / 10,  // Round to 1 decimal
        phase: 'growth',          // Label for debugging
        growth: Math.round(growth * 10) / 10  // Store growth amount for tooltip
      });
      
      // === MIDDAY: After consumption ===
      currentFood -= DAILY_CONSUMPTION;
      
      // Don't let food go negative (starvation would happen here in full sim)
      if (currentFood < 0) currentFood = 0;
      
      foodSimulation.push({
        x: dayIndex + 0.5,        // Half-day offset (e.g., day 50.5)
        food: Math.round(currentFood * 10) / 10,
        phase: 'consumption',
        consumed: DAILY_CONSUMPTION
      });
    }
    
    setFoodData(foodSimulation);
  }, [seed]);

  const current = data[currentDay] ?? {};

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Multi-Year Temperature Simulation</h1>

      <p>
        This simulation models daily temperatures across multiple years using
        smooth seasonal cycles, short-term variability, and rare extreme events.
      </p>

      {/* === CURRENT DAY READOUT === */}
      <div style={{ marginBottom: 15, padding: 10, background: '#f4f4f4' }}>
        <strong>Day:</strong> {currentDay} <br />
        <strong>Year:</strong> {current.year + 1 ?? '-'} <br />
        <strong>Season:</strong> {current.season ?? '-'} <br />
        <strong>Temperature:</strong> {current.temperature ?? '-'} °F <br />
        <strong>Food Stock:</strong> {foodData[currentDay * 2]?.food ?? '-'} units <br />
        <strong>Consumption Rate:</strong> {DAILY_CONSUMPTION} units/day <br />
        <strong>Daily Growth:</strong> {current.temperature ? calculateGrowth(current.temperature).toFixed(1) : '-'} units/day
      </div>

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
    
    <Legend />
    
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