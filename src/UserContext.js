import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    gender: '',
    height: 0, // 改為 0
    weight: 0, // 改為 0
    age: 0,    // 改為 0
    scores: {
      strength: 0,
      explosivePower: 0,
      cardio: 0,
      muscleMass: 0,
      bodyFat: 0,
    },
  });

  // 包裝 setUserData，確保數據格式正確
  const updateUserData = (newData) => {
    setUserData((prev) => {
      const updatedData = { ...prev, ...newData };
      // 確保 scores 是一個對象
      if (newData.scores && typeof newData.scores === 'object') {
        updatedData.scores = {
          strength: Number(newData.scores.strength) || 0,
          explosivePower: Number(newData.scores.explosivePower) || 0,
          cardio: Number(newData.scores.cardio) || 0,
          muscleMass: Number(newData.scores.muscleMass) || 0,
          bodyFat: Number(newData.scores.bodyFat) || 0,
        };
      }
      // 確保 height、weight、age 是數字
      updatedData.height = Number(updatedData.height) || 0;
      updatedData.weight = Number(updatedData.weight) || 0;
      updatedData.age = Number(updatedData.age) || 0;
      return updatedData;
    });
  };

  return (
    <UserContext.Provider value={{ userData, setUserData: updateUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}