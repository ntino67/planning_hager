import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [ces, setCEs] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [planning, setPlanning] = useState([]);

  const value = {
    employees,
    setEmployees,
    ces,
    setCEs,
    sectors,
    setSectors,
    skills,
    setSkills,
    planning,
    setPlanning,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}