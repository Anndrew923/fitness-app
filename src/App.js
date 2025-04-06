// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; // 導入 UserProvider
import Home from './Home';
import UserInfo from './UserInfo';
import Strength from './Strength';
import Cardio from './Cardio';
import Power from './Power';
import Muscle from './Muscle';
import FFMI from './FFMI';
import StrengthInstructions from './StrengthInstructions';

function App() {
  return (
    <UserProvider> {/* 包裹所有路由 */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/strength" element={<Strength />} />
          <Route path="/cardio" element={<Cardio />} />
          <Route path="/explosive-power" element={<Power />} />
          <Route path="/muscle-mass" element={<Muscle />} />
          <Route path="/body-fat" element={<FFMI />} />
          <Route path="/strength-instructions" element={<StrengthInstructions />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;