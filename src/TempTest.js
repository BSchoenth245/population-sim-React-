import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea
} from 'recharts';

/* ============================================================
   === SIMULATION CONSTANTS ===================================
   ============================================================ */

const DAYS_PER_YEAR = 365;
const YEAR_COUNT = 3;
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
  Winter: { mean: 30, amp: 10 },
  Spring: { mean: 55, amp: 12 },
  Summer: { mean: 80, amp: 10 },
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

/* ============================================================
   === MAIN COMPONENT =========================================
   ============================================================ */

export default function TemperatureSimulation() {
  const [data, setData] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [seed, setSeed] = useState(Math.random());

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
        <strong>Temperature:</strong> {current.temperature ?? '-'} °F
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
      <label>
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

      {/* === CHART === */}
      <LineChart width={900} height={450} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="dayIndex"
          type="number"
          domain={[0, TOTAL_DAYS]}
          label={{ value: 'Day (3 Years)', position: 'insideBottom', offset: -5 }}
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
  );
}
