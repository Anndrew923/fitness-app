// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; // 導入 UserProvider
import ScrollToTop from './ScrollToTop'; // 引入 ScrollToTop
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
        <ScrollToTop /> {/* 添加 ScrollToTop 組件 */}
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