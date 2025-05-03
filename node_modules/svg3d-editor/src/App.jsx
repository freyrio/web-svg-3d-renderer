import React from 'react';
import './App.css';

// Import components
import Controls from './components/Controls/Controls';
import ViewController from './components/Viewport/ViewController';
import { AppContextProvider } from './context/AppContext';

function App() {
  return (
    <AppContextProvider>
      <div className="app">
        <ViewController />
        <Controls />
      </div>
    </AppContextProvider>
  );
}

export default App; 