import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function TemperatureTest() {
  const [data, setData] = useState([]);
  const [currentTick, setCurrentTick] = useState(0);
  
  // Generate initial data - showing multiple cycles
  useEffect(() => {
    const tempData = [];
    for (let tick = 0; tick <= 200; tick++) {
      const temperature = 45 + 50 * Math.sin(tick / 10);
      tempData.push({
        tick: tick,
        temperature: Math.round(temperature * 10) / 10  // Round to 1 decimal
      });
    }
    setData(tempData);
  }, []);
  
  // Calculate current temperature
  const currentTemp = 45 + 50 * Math.sin(currentTick / 10);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Temperature Sin Wave Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Formula:</strong> temperature = 45 + 50 × sin(ticks / 10)</p>
        <p><strong>1 tick = 0.1 on x-axis</strong></p>
        <p><strong>Current Tick:</strong> {currentTick}</p>
        <p><strong>Current Temperature:</strong> {currentTemp.toFixed(1)}°F</p>
        <p><strong>Range:</strong> -5°F to 95°F</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
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
          dataKey="temperature" 
          stroke="#ff6b6b" 
          strokeWidth={2}
          name="Temperature" 
          dot={false}
        />
      </LineChart>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
        <h3>Key Points:</h3>
        <ul>
          <li><strong>Tick 0:</strong> Temperature ≈ 45°F (middle)</li>
          <li><strong>Peak (≈π/2 × 10 or tick ~15.7):</strong> Temperature = 95°F</li>
          <li><strong>Valley (≈3π/2 × 10 or tick ~47.1):</strong> Temperature = -5°F</li>
          <li><strong>Full cycle:</strong> Every 2π × 10 ≈ 62.8 ticks</li>
          <li><strong>One year = ~63 ticks</strong> (if you think of it as seasonal)</li>
        </ul>
      </div>
    </div>
  );
}

export default TemperatureTest;