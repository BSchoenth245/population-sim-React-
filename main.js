import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function PopulationSimulation() {
  // State variables (change each tick)
  const [population, setPopulation] = useState(100);
  const [availableResources, setAvailableResources] = useState(450);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
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
    setHistory([...history, { 
      tick: newTick, 
      population: Math.round(newPopulation), 
      resources: Math.round(regeneratedResources) 
    }]);
  }
  
  // Auto-run simulation when isRunning is true
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(runSimulationTick, 100);
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
          onClick={runSimulationTick}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Run One Tick
        </button>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{ 
            padding: '10px 20px',
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