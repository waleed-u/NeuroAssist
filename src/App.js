import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientDetails from './components/PatientDetails';
import EEGHistory from './components/EEGHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/patient/:patientId" element={<PatientDetails />} />
        <Route path="/patient/:patientId/eeg-history" element={<EEGHistory />} />
      </Routes>
    </Router>
  );
}

export default App; 