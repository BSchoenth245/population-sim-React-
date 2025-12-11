import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function PopulationSimulation() {
  // State variables (change each tick)
  const [population, setPopulation] = useState(100);
  const [availableResources, setAvailableResources] = useState(450);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Parameter variables (user adjusts these)
  const [birthRate, setBirthRate] = useState(0.12);
  const [deathRate, setDeathRate] = useState(0.1);
  const [consumptionPerIndividual, setConsumptionPerIndividual] = useState(1);
  const [resourceRegenerationAmount, setResourceRegenerationAmount] = useState(100);
  const [regenerationInterval, setRegenerationInterval] = useState(1);
  const [maxResourceCapacity, setMaxResourceCapacity] = useState(500);
  
  function runSimulationTick() {
    // Step 1: Calculate births
    const births = population * birthRate;
    
    // Step 2: Calculate deaths
    const resourcesPerIndividual = availableResources / population;
    let deaths;
    if (resourcesPerIndividual < consumptionPerIndividual) {
      deaths = population * (deathRate / resourcesPerIndividual);
      if(deaths > population){
        deaths = population;
      }
    } else {
      deaths = population * deathRate;
    }
    
    // Step 3: Update population
    const newPopulation = population + births - deaths;
    setPopulation(newPopulation);
    
    // Step 4: Consume resources
    const actualConsumption = Math.min(
      population * consumptionPerIndividual,
      availableResources
    );
    const newResources = availableResources - actualConsumption;
    
    // Step 5: Regenerate resources
    let regeneratedResources = newResources;
    if (tickCount % regenerationInterval === 0) {
      if (newResources < maxResourceCapacity) {
        regeneratedResources = Math.min(newResources + resourceRegenerationAmount, maxResourceCapacity);
      }
    }
    setAvailableResources(regeneratedResources);
    
    // Step 6: Increment tick
    const newTick = tickCount + 1;
    setTickCount(newTick);
    
    // Step 7: Store history for graphing
    // Step 7: Store history for graphing (every 5 ticks)
    if (newTick % 5 === 0) {
      setHistory([...history, { 
        tick: newTick, 
        population: Math.round(newPopulation), 
        resources: Math.round(regeneratedResources) 
    }]);
}
  }

  function resetSimulation() {
  // Reset simulation state
  setPopulation(100);
  setAvailableResources(450);
  setTickCount(0);
  setHistory([]);
  setIsRunning(false);
}
  
  // Auto-run simulation when isRunning is true
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(runSimulationTick, 300);
      return () => clearInterval(interval);
    }
  }, [isRunning, runSimulationTick]);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Population Simulation</h1>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Tick:</strong> {tickCount}</p>
        <p><strong>Population:</strong> {Math.round(population)}</p>
        <p><strong>Available Resources:</strong> {Math.round(availableResources)}</p>
      </div>
      <div style={{ marginBottom: '20px' }}>

        <button 
          onClick={() => setShowMenu(!showMenu)}
          style={{ 
            padding: '10px 15px',
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          ☰
        </button>

        <button 
          onClick={runSimulationTick}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px'

          }}
        >
          Run One Tick
        </button>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{ 
            padding: '10px 20px',
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: isRunning ? '#ff6b6b' : '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={resetSimulation}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Reset Simulation
        </button>
      </div>
      <div>
        {showMenu && (
  <div style={{ 
    padding: '20px', 
    backgroundColor: '#f9f9f9', 
    borderRadius: '5px',
    marginBottom: '20px'
  }}>
    <h3>Sliders</h3>
    
    <div>
      <label>
        Birth Rate: {birthRate} ({(birthRate * 100).toFixed(1)}%)
        <input 
          type="range"
          min={0.01}
          max={0.5}
          step={0.005}
          value={birthRate}
          onChange={(e) => setBirthRate(parseFloat(e.target.value))}
        />
      </label>
    </div>

    <div>
      <label>
        Death Rate: {deathRate} ({(deathRate * 100).toFixed(1)}%)
        <input 
          type="range"
          min={0.01}
          max={0.5}
          step={0.005}
          value={deathRate}
          onChange={(e) => setDeathRate(parseFloat(e.target.value))}
        />
      </label>
    </div>

    <div>
      <label>
        Consumption Per Individual: {consumptionPerIndividual}
        <input 
          type="range"
          min={1}
          max={5}
          step={0.2}
          value={consumptionPerIndividual}
          onChange={(e) => setConsumptionPerIndividual(parseFloat(e.target.value))}
        />
      </label>
    </div>

    <div>
      <label>
        Resource Regeneration Amount: {resourceRegenerationAmount}
        <input 
          type="range"
          min={100}
          max={1000}
          step={5}
          value={resourceRegenerationAmount}
          onChange={(e) => setResourceRegenerationAmount(parseFloat(e.target.value))}
        />
      </label>
    </div>

    <div>
      <label>
        Regeneration Interval: {regenerationInterval}
        <input 
          type="range"
          min={1}
          max={10}
          step={1}
          value={regenerationInterval}
          onChange={(e) => setRegenerationInterval(parseFloat(e.target.value))}
        />
      </label>
    </div>

    <div>
      <label>
        Max Resource Capacity: {maxResourceCapacity}
        <input 
          type="range"
          min={500}
          max={5000}
          step={25}
          value={maxResourceCapacity}
          onChange={(e) => setMaxResourceCapacity(parseFloat(e.target.value))}
        />
      </label>
    </div>
    
  </div>
)}
      </div>
      
      <LineChart width={700} height={400} data={history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tick" label={{ value: 'Time (Ticks)', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="population" stroke="#8884d8" name="Population" />
        <Line type="monotone" dataKey="resources" stroke="#82ca9d" name="Resources" />
      </LineChart>
    </div>
  );
}

export default PopulationSimulation;