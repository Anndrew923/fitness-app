import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import GenderSelection from './GenderSelection';
import UserInfo from './UserInfo';
import Overview from './Overview';
import Strength from './Strength';
import StrengthInstructions from './StrengthInstructions';
import Cardio from './Cardio';
import Power from './Power';
import Muscle from './Muscle';
import FFMI from './FFMI';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GenderSelection />} />
          <Route path="/userinfo" element={<UserInfo />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/strength" element={<Strength />} />
          <Route path="/strength/instructions" element={<StrengthInstructions />} />
          <Route path="/cardio" element={<Cardio />} />
          <Route path="/power" element={<Power />} />
          <Route path="/muscle" element={<Muscle />} />
          <Route path="/ffmi" element={<FFMI />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;