const SHIFT_CYCLE = [
  { morning: [1, 4, 3, 2], afternoon: [2, 1, 4, 3], night: [3, 2, 1, 4] }
];

const SHIFT_PATTERNS = {
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

export const generateShiftSchedule = (ceId, currentWeek, shiftType) => {
  const weekInCycle = (currentWeek - 1) % 4;
  const ceIndex = SHIFT_CYCLE[0].morning.indexOf(ceId);
  const shiftIndex = (ceIndex + weekInCycle) % 4;
  const shiftPattern = SHIFT_PATTERNS[shiftType];

  let schedule = {};

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