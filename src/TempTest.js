import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

function TemperatureTest() {
  const [data, setData] = useState([]);
  const [currentTick, setCurrentTick] = useState(0);
  const [showNoise, setShowNoise] = useState(true);
  const [showExtremes, setShowExtremes] = useState(true);
  
  // Generate random phase offsets once when component loads
  const [phases] = useState({
    seasonal: Math.random() * Math.PI * 2,
    daily: Math.random() * Math.PI * 2,
    noise1: Math.random() * Math.PI * 2,
    noise2: Math.random() * Math.PI * 2,
    noise3: Math.random() * Math.PI * 2,
    extreme: Math.random() * Math.PI * 2,
    extremeType: Math.random() * Math.PI * 2
  });
  
  // Triangle wave function for more even season distribution
  const triangleWave = (t) => {
    const x = (t % (Math.PI * 4)) / (Math.PI * 4); // 0 to 1
    if (x < 0.5) return x * 4 - 1; // -1 to 1 (rising)
    return 3 - x * 4; // 1 to -1 (falling)
  };
  
  // Function to calculate temperature with phases
  const calculateTemp = (tick) => {
    // Get both triangle and sine waves
    const triangle = triangleWave(tick / 10 + phases.seasonal);
    const sine = Math.sin(tick / 10 + phases.seasonal);
    
    // Blend them: 70% triangle (even seasons) + 30% sine (smooth peaks)
    const blendFactor = 0.7;
    const blended = triangle * blendFactor + sine * (1 - blendFactor);
    
    const seasonalTemp = 45 + 50 * blended;
    const dailyVariation = 5 * Math.sin(tick / 2 + phases.daily);
    const weatherNoise = 
      3 * Math.sin(tick / 3.7 + phases.noise1) +
      2 * Math.sin(tick / 1.3 + phases.noise2) +
      1 * Math.sin(tick / 0.7 + phases.noise3);
    
    let baseTemp = seasonalTemp + dailyVariation + weatherNoise;
    
    // Add rare extreme weather events (seasonal-appropriate)
    const extremeChance = Math.sin(tick * 0.123 + phases.extreme) * 0.5 + 0.5;
    const isExtreme = extremeChance > 0.95; // Top 5% = extreme event
    
    let finalTemp = baseTemp;
    if (isExtreme) {
      // Determine extreme type based on current season
      let extremeType;
      if (baseTemp > 70) {
        // Summer: heat waves only
        extremeType = 1;
      } else if (baseTemp < 40) {
        // Winter: cold snaps only
        extremeType = -1;
      } else {
        // Spring/Fall: could be either
        extremeType = Math.sin(tick * 0.456 + phases.extremeType) > 0 ? 1 : -1;
      }
      
      const extremeMagnitude = 10 + Math.abs(Math.sin(tick * 0.789 + phases.extreme)) * 5; // 10-15°F
      finalTemp += extremeType * extremeMagnitude;
    }
    
    return {
      seasonal: seasonalTemp,
      withDaily: seasonalTemp + dailyVariation,
      withNoise: baseTemp,
      withExtremes: finalTemp,
      isExtreme: isExtreme
    };
  };
  
  // Generate initial data
  useEffect(() => {
    const tempData = [];
    for (let tick = 0; tick <= 200; tick++) {
      const temps = calculateTemp(tick);
      tempData.push({
        tick: tick,
        temperatureWithExtremes: Math.round(temps.withExtremes * 10) / 10,
        temperatureWithNoise: Math.round(temps.withNoise * 10) / 10,
        temperatureSmooth: Math.round(temps.withDaily * 10) / 10,
        seasonal: Math.round(temps.seasonal * 10) / 10
      });
    }
    setData(tempData);
  }, [phases]);
  
  // Calculate current temperature and season
  const currentTemps = calculateTemp(currentTick);
  const currentTemp = currentTemps.withExtremes;
  const isCurrentExtreme = currentTemps.isExtreme;
  
  // Determine current season based on temperature
  const getCurrentSeason = (temp) => {
    if (temp < 40) return 'Winter';
    if (temp >= 40 && temp < 70) return 'Spring/Fall';
    return 'Summer';
  };
  const currentSeason = getCurrentSeason(currentTemp);
  
  // Function to regenerate with new random phases
  const regenerate = () => {
    window.location.reload();
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Temperature Sin Wave Test (With Randomness)</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Seasonal:</strong> Blended triangle (70%) + sine (30%) wave</p>
        <p><strong>Daily Variation:</strong> 5 × sin(ticks / 2 + random_phase)</p>
        <p><strong>Weather Noise:</strong> 3×sin(t/3.7 + φ₁) + 2×sin(t/1.3 + φ₂) + 1×sin(t/0.7 + φ₃)</p>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <strong>Note:</strong> Triangle wave creates more balanced seasons with smooth peaks!
        </p>
        <p style={{ marginTop: '10px' }}><strong>Current Tick:</strong> {currentTick}</p>
        <p><strong>Current Temperature:</strong> {currentTemp.toFixed(1)}°F 
          {isCurrentExtreme && <span style={{ color: '#e74c3c', fontWeight: 'bold' }}> ⚠️ EXTREME EVENT</span>}
        </p>
        <p><strong>Current Season:</strong> {currentSeason}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={regenerate}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '15px'
          }}
        >
          Generate New Random Pattern
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input 
            type="checkbox"
            checked={showNoise}
            onChange={(e) => setShowNoise(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          <strong>Show Weather Noise</strong>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input 
            type="checkbox"
            checked={showExtremes}
            onChange={(e) => setShowExtremes(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          <strong>Show Extreme Events</strong>
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
        
        {/* Season boundary lines */}
        <ReferenceLine 
          y={40} 
          stroke="#3498db" 
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{ value: 'Winter/Spring (40°F)', position: 'right', fill: '#3498db', fontSize: 12 }}
        />
        <ReferenceLine 
          y={70} 
          stroke="#e74c3c" 
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{ value: 'Spring/Summer (70°F)', position: 'right', fill: '#e74c3c', fontSize: 12 }}
        />
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
          <>
            <Line 
              type="monotone" 
              dataKey="temperatureWithNoise" 
              stroke="#95a5a6" 
              strokeWidth={1.5}
              name="With Weather Noise" 
              dot={false}
            />
            </>
        )}
       
        {showExtremes && (
          <>
            <Line 
              type="monotone" 
              dataKey="temperatureWithExtremes" 
              stroke="#ff6b6b" 
              strokeWidth={2}
              name="With Extreme Events" 
              dot={false}
            />
          </>
        )}
      </LineChart>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
        <h3>How Randomness Works:</h3>
        <ul>
          <li><strong>Phase offsets:</strong> Each sine wave starts at a random point in its cycle</li>
          <li><strong>Smooth but unique:</strong> Pattern is different every time, but still realistic</li>
          <li><strong>Click "Generate New Random Pattern"</strong> to see a completely different temperature curve!</li>
          <li><strong>Same simulation run:</strong> Temperature stays consistent within one simulation</li>
        </ul>
        
        <h3 style={{ marginTop: '15px' }}>Temperature-Based Seasons:</h3>
        <ul>
          <li><strong>Winter:</strong> Below 40°F</li>
          <li><strong>Spring/Fall:</strong> 40-70°F</li>
          <li><strong>Summer:</strong> Above 70°F</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Seasons are determined by current temperature, not fixed time periods!
        </p>
      </div>
    </div>
  );
}

export default TemperatureTest;