import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from 'recharts';

/*****************************************************************************************
 * TIME-BASED SEASONAL CLIMATE SIMULATION
 * -------------------------------------
 * This component simulates daily temperature over a full year (365 ticks).
 * 
 * Key design principles:
 * 1. Time drives seasons (NOT temperature)
 * 2. Seasons have realistic, fixed lengths
 * 3. Temperature is composed of multiple layers:
 *    - Seasonal baseline
 *    - Daily oscillation
 *    - Multi-day weather noise
 *    - Rare extreme events
 *
 * The math is intentionally separated into small, readable functions so it is easy
 * to debug, tune, or extend (latitude, climate change, multiple years, etc.).
 *****************************************************************************************/

// ----------------------------------------------------------------------------------------
// GLOBAL TIME CONSTANTS
// ----------------------------------------------------------------------------------------

// One full simulated year = 365 ticks (1 tick ≈ 1 day)
const DAYS_PER_YEAR = 365;

// ----------------------------------------------------------------------------------------
// SEASON DEFINITIONS
// ----------------------------------------------------------------------------------------

// Seasons are defined by FIXED TIME LENGTHS (in days)
// These values closely mirror real-world meteorological seasons
const SEASONS = [
  { name: 'Winter', length: 90, color: '#e3f2fd' },
  { name: 'Spring', length: 92, color: '#e8f5e9' },
  { name: 'Summer', length: 92, color: '#fff3e0' },
  { name: 'Fall',   length: 91, color: '#fbe9e7' },
];

// Each season has a temperature profile:
// - mean: average temperature for that season
// - amp:  how much temperature rises/falls within the season
const SEASON_PROFILES = {
  Winter: { mean: 30, amp: 10 },
  Spring: { mean: 50, amp: 15 },
  Summer: { mean: 75, amp: 10 },
  Fall:   { mean: 55, amp: 15 },
};

// ----------------------------------------------------------------------------------------
// SEASON RESOLUTION FUNCTIONS
// ----------------------------------------------------------------------------------------

/**
 * getSeason(dayOfYear)
 * --------------------
 * Converts a day index (0–364) into:
 * - Which season we're in
 * - How far we are through that season
 *
 * This function is PURE and deterministic.
 */
function getSeason(dayOfYear) {
  let day = dayOfYear;
  let start = 0;

  for (const season of SEASONS) {
    if (day < season.length) {
      return {
        ...season,
        startDay: start,
        dayInSeason: day,
        // progress ∈ [0, 1]
        // Used to smoothly interpolate temperature across the season
        progress: day / season.length,
      };
    }
    day -= season.length;
    start += season.length;
  }
}

/**
 * seasonalBaseline(seasonName, progress)
 * --------------------------------------
 * Produces the BASE temperature for a season.
 *
 * Math explanation:
 * - Uses sin(progress × π) instead of a full sine wave
 * - This gives a smooth rise and fall within a season
 * - Temperature peaks in the middle of the season
 *
 * Result:
 * - No sharp edges
 * - Natural warming/cooling curve
 */
/**
 * seasonalBaseline(seasonName, progress, dayOfYear)
 * -------------------------------------------------
 * Produces a SMOOTH seasonal baseline temperature.
 *
 * Previous version:
 * - Each season was independent
 * - Temperature reset sharply at season boundaries
 *
 * New approach:
 * - Use a continuous ANNUAL sine wave for large-scale warming/cooling
 * - Modulate it by season-specific offsets
 * - This guarantees smooth transitions between seasons
 */
function seasonalBaseline(seasonName, progress, dayOfYear) {
  // --- 1. Global annual temperature cycle ---
  // One full sine wave over the year
  // Coldest near mid-winter, warmest near mid-summer
  // Shift the entire annual temperature wave forward in time so that
  // the peak (warmest point) occurs squarely during Summer
  //
  // 45-day shift was chosen so the maximum aligns near mid-summer
  const WAVE_SHIFT_DAYS = -45;

  const annualProgress = (dayOfYear + WAVE_SHIFT_DAYS) / DAYS_PER_YEAR; // 0 → 1
  const annualMean = 52;        // Average yearly temperature
  const annualAmplitude = 22;   // Strength of seasonal contrast

  const annualWave =
    annualMean +
    annualAmplitude * Math.sin(2 * Math.PI * (annualProgress - 0.25));

  // --- 2. Season-specific adjustment ---
  // Small offsets to shape each season without breaking continuity
  const seasonAdjustments = {
    Winter: -5,
    Spring: 0,
    Summer: +5,
    Fall: 0,
  };

  // --- 3. Intra-season shaping ---
  // Gentle curvature so seasons still "feel" distinct
  const intraSeason =
    SEASON_PROFILES[seasonName].amp *
    Math.sin(progress * Math.PI) * 0.3; // reduced influence

  return annualWave + seasonAdjustments[seasonName] + intraSeason;
}

// ----------------------------------------------------------------------------------------
// CLIMATE SAMPLING FUNCTION (THE "ENGINE")
// ----------------------------------------------------------------------------------------

/**
 * sampleClimate(tick, phases)
 * ---------------------------
 * This is the heart of the simulation.
 * Given a tick (day), it returns a full climate snapshot.
 *
 * Temperature layers (added in order):
 * 1. Seasonal baseline (long-term climate)
 * 2. Daily oscillation (day/night cycle)
 * 3. Weather noise (multi-day systems)
 * 4. Rare extreme events (heat waves / cold snaps)
 */
function sampleClimate(tick, phases) {
  // Convert absolute tick into day-of-year (wraps every 365 days)
  const dayOfYear = tick % DAYS_PER_YEAR;

  // Determine season & progress
  const season = getSeason(dayOfYear);

  // --- 1. Seasonal baseline ---
  const base = seasonalBaseline(season.name, season.progress, dayOfYear);

  // --- 2. Daily temperature oscillation ---
  // One full sine wave per day (day/night temperature swing)
  const daily = 5 * Math.sin(tick * 2 * Math.PI + phases.daily);

  // --- 3. Weather noise ---
  // Lower-frequency sine waves simulate multi-day weather patterns
  const noise =
    3 * Math.sin(tick / 7 + phases.noise1) + // weekly systems
    2 * Math.sin(tick / 3 + phases.noise2);  // short-term fronts

  // --- 4. Extreme events ---
  // Rare, sharp deviations from normal temperature
  let extreme = 0;

  // Convert sine wave into probability-like signal [0,1]
  const extremeChance = Math.sin(tick * 0.17 + phases.extreme) * 0.5 + 0.5;

  // Roughly ~1–2% of days have extreme events
  if (extremeChance > 0.985) {
    if (season.name === 'Summer') {
      // Heat waves only in summer
      extreme = 10 + Math.random() * 5;
    } else if (season.name === 'Winter') {
      // Cold snaps only in winter
      extreme = -10 - Math.random() * 5;
    } else {
      // Transitional seasons can go either way
      extreme = Math.random() > 0.5 ? 10 : -10;
    }
  }

  // Final temperature is the sum of all layers
  const temperature = base + daily + noise + extreme;

  return {
    tick,
    dayOfYear,
    season: season.name,
    temperature: Math.round(temperature * 10) / 10,
    base: Math.round(base * 10) / 10,
  };
}

// ----------------------------------------------------------------------------------------
// REACT COMPONENT
// ----------------------------------------------------------------------------------------

export default function TemperatureTest() {
  const [data, setData] = useState([]);
  const [currentTick, setCurrentTick] = useState(0);

  // Random phases are generated ONCE per simulation run
  // This keeps the climate consistent until refresh
  const phases = useMemo(() => ({
    daily: Math.random() * Math.PI * 2,
    noise1: Math.random() * Math.PI * 2,
    noise2: Math.random() * Math.PI * 2,
    extreme: Math.random() * Math.PI * 2,
  }), []);

  // Generate one full year of data
  useEffect(() => {
    const yearData = [];
    for (let tick = 0; tick < DAYS_PER_YEAR; tick++) {
      yearData.push(sampleClimate(tick, phases));
    }
    setData(yearData);
  }, [phases]);

  const current = data[currentTick];

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Time-Based Seasonal Temperature Simulation (365 Days)</h1>

      {current && (
        <div style={{ marginBottom: 15 }}>
          <strong>Day:</strong> {current.dayOfYear + 1} / 365<br />
          <strong>Season:</strong> {current.season}<br />
          <strong>Temperature:</strong> {current.temperature}°F
        </div>
      )}

      {/* Day scrubber */}
      <input
        type="range"
        min={0}
        max={DAYS_PER_YEAR - 1}
        value={currentTick}
        onChange={(e) => setCurrentTick(Number(e.target.value))}
        style={{ width: '100%', marginBottom: 20 }}
      />

      <LineChart width={900} height={420} data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="dayOfYear"
          label={{ value: 'Day of Year', position: 'insideBottom', offset: -5 }}
        />

        <YAxis
          domain={[-10, 100]}
          label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }}
        />

        <Tooltip />
        <Legend />

        {/* Background season bands for visual clarity */}
        {SEASONS.map((s, i) => (
          <ReferenceArea
            key={s.name}
            x1={SEASONS.slice(0, i).reduce((a, b) => a + b.length, 0)}
            x2={SEASONS.slice(0, i + 1).reduce((a, b) => a + b.length, 0)}
            fill={s.color}
            fillOpacity={0.65}
          />
        ))}

        {/* Seasonal baseline (no daily noise) */}
        <Line
          type="monotone"
          dataKey="base"
          stroke="#999"
          strokeDasharray="5 5"
          dot={false}
          name="Seasonal Baseline"
        />

        {/* Final temperature including all effects */}
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#ff6b6b"
          strokeWidth={2}
          dot={false}
          name="Final Temperature"
        />
      </LineChart>
    </div>
  );
}
