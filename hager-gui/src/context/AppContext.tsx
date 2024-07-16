import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Employee {
  ID: number;
  Name: string;
  CEID: number;
  SectorID: number;
  Skills: Skill[];
}

interface CE {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  name: string;
}

interface PlanningEntry {
  id: number;
  date: string;
  week: number;
  shift: string;
  status: string;
  employee?: Employee;
  sector?: Sector;
  ce?: CE;
}

interface AppContextType {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  ces: CE[];
  setCEs: React.Dispatch<React.SetStateAction<CE[]>>;
  sectors: Sector[];
  setSectors: React.Dispatch<React.SetStateAction<Sector[]>>;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  planning: PlanningEntry[];
  setPlanning: React.Dispatch<React.SetStateAction<PlanningEntry[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ces, setCEs] = useState<CE[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [planning, setPlanning] = useState<PlanningEntry[]>([]);

  const value: AppContextType = {
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
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}