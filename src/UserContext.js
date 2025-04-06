// src/UserContext.js
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    gender: '',
    height: '',
    weight: '',
    age: '',
    scores: {
      strength: 0,
      explosivePower: 0,
      cardio: 0,
      muscleMass: 0,
      bodyFat: 0,
    },
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}