import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function TemperatureTest() {
  const [data, setData] = useState([]);
  const [currentTick, setCurrentTick] = useState(0);
  const [showNoise, setShowNoise] = useState(true);
  
  // Generate initial data - showing multiple cycles
  useEffect(() => {
    const tempData = [];
    for (let tick = 0; tick <= 200; tick++) {
      // Base seasonal temperature
      const seasonalTemp = 45 + 50 * Math.sin(tick / 10);
      
      // Daily variation
      const dailyVariation = 5 * Math.sin(tick / 2);
      
      // Weather noise (multiple sine waves at different frequencies)
      const weatherNoise = 
        3 * Math.sin(tick / 3.7) +
        2 * Math.sin(tick / 1.3) +
        1 * Math.sin(tick / 0.7);
      
      const temperatureWithNoise = seasonalTemp + dailyVariation + weatherNoise;
      const temperatureSmooth = seasonalTemp + dailyVariation;
      
      tempData.push({
        tick: tick,
        temperatureWithNoise: Math.round(temperatureWithNoise * 10) / 10,
        temperatureSmooth: Math.round(temperatureSmooth * 10) / 10,
        seasonal: Math.round(seasonalTemp * 10) / 10
      });
    }
    setData(tempData);
  }, []);
  
  // Calculate current temperature
  const seasonalTemp = 45 + 50 * Math.sin(currentTick / 10);
  const dailyVariation = 5 * Math.sin(currentTick / 2);
  const weatherNoise = 
    3 * Math.sin(currentTick / 3.7) +
    2 * Math.sin(currentTick / 1.3) +
    1 * Math.sin(currentTick / 0.7);
  const currentTemp = seasonalTemp + dailyVariation + weatherNoise;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Temperature Sin Wave Test (With Noise)</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Seasonal:</strong> 45 + 50 × sin(ticks / 10)</p>
        <p><strong>Daily Variation:</strong> 5 × sin(ticks / 2)</p>
        <p><strong>Weather Noise:</strong> 3×sin(t/3.7) + 2×sin(t/1.3) + 1×sin(t/0.7)</p>
        <p style={{ marginTop: '10px' }}><strong>Current Tick:</strong> {currentTick}</p>
        <p><strong>Current Temperature:</strong> {currentTemp.toFixed(1)}°F</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input 
            type="checkbox"
            checked={showNoise}
            onChange={(e) => setShowNoise(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          <strong>Show Weather Noise</strong>
        </label>
        
        <label style={{ display: 'block', marginTop: '15px' }}>
          <strong>Scrub through time (Tick: {currentTick}):</strong>
          <input 
            type="range"
            min={0}
            max={200}
            step={1}
            value={currentTick}
            onChange={(e) => setCurrentTick(parseInt(e.target.value))}
            style={{ width: '100%', marginTop: '10px' }}
          />
        </label>
      </div>
      
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="tick" 
          label={{ value: 'Ticks', position: 'insideBottom', offset: -5 }} 
        />
        <YAxis 
          domain={[-10, 100]}
          label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} 
        />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="seasonal" 
          stroke="#cccccc" 
          strokeWidth={1}
          name="Seasonal Only" 
          dot={false}
          strokeDasharray="5 5"
        />
        <Line 
          type="monotone" 
          dataKey="temperatureSmooth" 
          stroke="#4ecdc4" 
          strokeWidth={2}
          name="With Daily Variation" 
          dot={false}
        />
        {showNoise && (
          <Line 
            type="monotone" 
            dataKey="temperatureWithNoise" 
            stroke="#ff6b6b" 
            strokeWidth={2}
            name="With Weather Noise" 
            dot={false}
          />
        )}
      </LineChart>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
        <h3>Temperature Layers:</h3>
        <ul>
          <li><strong>Gray dashed line:</strong> Seasonal baseline (smooth yearly cycle)</li>
          <li><strong>Cyan line:</strong> + Daily temperature swings (~5°F)</li>
          <li><strong>Red line:</strong> + Weather noise (realistic unpredictability)</li>
        </ul>
        <p style={{ marginTop: '10px' }}>
          <strong>Toggle the checkbox</strong> to see how the weather noise layer adds realistic variation!
        </p>
      </div>
    </div>
  );
}

export default TemperatureTest;