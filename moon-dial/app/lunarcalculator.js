/**
 * Performs calculations for what phase the moon is in. 
 * 
 * Code in this file base on examples found here: 
 * https://jasonsturges.medium.com/moons-lunar-phase-in-javascript-a5219acbfe6e
 */

export const newMoon = "New Moon";
export const waxingCrescent = "Waxing Crescent";
export const firstQuarter = "First Quarter";
export const waxingGibbous = "Waxing Gibbous";
export const fullMoon = "Full Moon";
export const waningGibbous = "Waning Gibbous";
export const lastQuarter = "Last Quarter";
export const waningCrescent = "Waning Crescent";

const getJulianDate = (date = new Date()) => {
  const time = date.getTime();
  const tzoffset = date.getTimezoneOffset()
  return (time / 86400000) - (tzoffset / 1440) + 2440587.5;
}

const LUNAR_MONTH = 29.530588853;

const getLunarAge = (date = new Date()) => {
  const percent = getLunarAgePercent(date);
  const age = percent * LUNAR_MONTH;
  return age;
}
const getLunarAgePercent = (date = new Date()) => {
  return normalize((getJulianDate(date) - 2451550.1) / LUNAR_MONTH);
}
const normalize = value => {
  value = value - Math.floor(value);
  if (value < 0)
    value = value + 1
  return value;
}

/**
 * Gets and analyzes values for moon phase. 
 * @param {*} date 
 * @returns string with phase value
 */
const getLunarPhase = (date = new Date()) => {
  const age = getLunarAge(date);
  if (age < 1.84566)
    return newMoon;
  else if (age < 5.53699)
    return waxingCrescent;
  else if (age < 9.22831)
    return firstQuarter;
  else if (age < 12.91963)
    return waxingGibbous;
  else if (age < 16.61096)
    return fullMoon;
  else if (age < 20.30228)
    return waningGibbous;
  else if (age < 23.99361)
    return lastQuarter;
  else if (age < 27.68493)
    return waningCrescent;
  return newMoon;
}

export const isWaxing = (date = new Date()) => {
  const age = getLunarAge(date);
  return age <= 14.765;
}
export const isWaning = (date = new Date()) => {
  const age = getLunarAge(date);
  return age > 14.765;
}

/**
 * Fires calculation for calculating lunar phase. 
 * @returns string with phase value
 */
export function calculateLunarPhase() {
  //let date = new Date("2025-04-12"); // debuging code

  return getLunarPhase();
}

