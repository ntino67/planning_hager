type ShiftCycle = {
  morning: number[];
  afternoon: number[];
  night: number[];
}

type ShiftPattern = {
  morning: string[];
  afternoon: string[];
  night: string[];
}

const SHIFT_CYCLE: ShiftCycle[] = [
  { morning: [1, 4, 3, 2], afternoon: [2, 1, 4, 3], night: [3, 2, 1, 4] }
];

const SHIFT_PATTERNS: Record<string, ShiftPattern> = {
  '4x8 L': {
    morning: ['Tu', 'We', 'Th', 'Fr', 'Sa'],
    afternoon: ['Mo', 'Tu', 'We', 'Th'],
    night: ['Su', 'Mo', 'Tu']
  },
  '4x8 N': {
    morning: ['Tu', 'We', 'Th', 'Fr', 'Sa'],
    afternoon: ['Mo', 'Tu', 'We', 'Th'],
    night: ['Mo', 'Tu']
  },
  '4x8 C': {
    morning: ['Tu', 'We', 'Th', 'Fr'],
    afternoon: ['Mo', 'Tu', 'We', 'Th'],
    night: ['Mo', 'Tu']
  }
};

type Schedule = Record<string, string>;

export const generateShiftSchedule = (ceId: number, currentWeek: number, shiftType: string): Schedule => {
  const weekInCycle = (currentWeek - 1) % 4;
  const ceIndex = SHIFT_CYCLE[0].morning.indexOf(ceId);
  const shiftIndex = (ceIndex + weekInCycle) % 4;
  const shiftPattern = SHIFT_PATTERNS[shiftType];

  let schedule: Schedule = {};

  if (shiftIndex === 0) {
    schedule = { ...shiftPattern.morning.reduce((acc, day) => ({ ...acc, [day]: 'M' }), {}) };
  } else if (shiftIndex === 1) {
    schedule = { ...shiftPattern.afternoon.reduce((acc, day) => ({ ...acc, [day]: 'S' }), {}) };
  } else if (shiftIndex === 2) {
    schedule = { ...shiftPattern.night.reduce((acc, day) => ({ ...acc, [day]: 'N' }), {}), 'Fr': 'S' };
  } else {
    schedule = { 'Mo': 'M' };
  }

  return schedule;
};