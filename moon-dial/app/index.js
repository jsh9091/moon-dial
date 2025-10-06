/*
 * MIT License
 *
 * Copyright (c) 2025 Joshua Horvath
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as document from "document";
import clock from "clock";
import { preferences } from "user-settings";
import * as moon from "./lunarcalculator";
import { today as activity } from "user-activity";
import { me as appbit } from "appbit";
import { battery } from "power";

// Get a handle on the <text> elements
const stepCountLabel = document.getElementById("stepCountLabel");
const batteryLabel = document.getElementById("batteryLabel");
const batteryIcon = document.getElementById("batteryIcon");
const moonIcon = document.getElementById("moonIcon");
const moonPaseLabel = document.getElementById("moonPaseLabel");
const timeLabel = document.getElementById("timeLabel");
const timeShadow = document.getElementById("timeShadow");
const dayOfWeekLabel = document.getElementById("dayOfWeekLabel");
const monthLabel = document.getElementById("monthLabel");
const dayOfMonthLabel = document.getElementById("dayOfMonthLabel");
const dialgroup = document.getElementById("dialgroup");

// Update the clock every second
clock.granularity = "minutes";

/* constants for dial angles for new moon phases */
// angles for ship side of dial
const DIAL_ANGLE_SHIP_NEW_MOON = 86;
const DIAL_ANGLE_SHIP_WAXING_CRESENT = 100;
const DIAL_ANGLE_SHIP_FIRST_QUARTER = 120;
const DIAL_ANGLE_SHIP_WAXING_GIBBOUS = 145;
const DIAL_ANGLE_SHIP_FULL_MOON = 175;
const DIAL_ANGLE_SHIP_WANING_GIBBOUS = 200;
const DIAL_ANGLE_SHIP_LAST_QUARTER = 230;
const DIAL_ANGLE_SHIP_WANING_CRESENT = 242;
// angles for deer side of dial
const DIAL_ANGLE_DEER_NEW_MOON = 266;
const DIAL_ANGLE_DEER_WAXING_CRESENT = 280;
const DIAL_ANGLE_DEER_FIRST_QUARTER = 300;
const DIAL_ANGLE_DEER_WAXING_GIBBOUS = 325;
const DIAL_ANGLE_DEER_FULL_MOON = 352;
const DIAL_ANGLE_DEER_WANING_GIBBOUS = 22;
const DIAL_ANGLE_DEER_LAST_QUARTER = 52;
const DIAL_ANGLE_DEER_WANING_CRESENT = 64;

let currentAngle = 0;
// last phase update fields for dial updates control
let lastPhaseUpdateDay = 0;
let lastPhaseUpdateMonth = 0;
let lastPhaseUpdateYear = 0;

/**
 * Enum to define each side of the dial. 
 */
const DialSide = Object.freeze({
  SHIP: 'ship',
  DEER: 'deer'
});

let currentDialSide = DialSide.DEER;
let currentMoonPhase = moon.newMoon;

clock.ontick = (evt) => {
    // get time information from API
    let todayDate = evt.date;

    displaySteps();
    updateBattery();

    updatePhaseIcon(todayDate);
    updatePhaseLabel(todayDate);

    timeDisplay(todayDate);

    updateDayField(evt);
    updateDateFields(evt);

    setDialRotation(todayDate);
};

/**
 * Operations for displaying time on clockface. 
 * @param {*} todayDate 
 */
function timeDisplay(todayDate) {
    const rawHours = todayDate.getHours();
    let mins = todayDate.getMinutes();
    let displayMins = zeroPad(mins);

    let hours;
    if (preferences.clockDisplay === "12h") {
        // 12 hour format
        hours = rawHours % 12 || 12;
    } else {
        // 24 hour format
        hours = rawHours;
    }

    // display time on main clock
    timeLabel.text = `${hours}` + ":" + `${displayMins}`;
    timeShadow.text = timeLabel.text;

    if (preferences.clockDisplay === "12h") {
        timeLabel.style.fontSize = 70;
        timeShadow.style.fontSize = 70;
    } else {
        // horizontal space is limited for 24hr time, so reduce font size a little
        timeLabel.style.fontSize = 65;
        timeShadow.style.fontSize = 65;
    }
}

/**
 * Front appends a zero to an integer if less than ten.
 * @param {*} i 
 * @returns 
 */
function zeroPad(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

/**
 * Displays step count on screen. 
 */
function displaySteps() {
      // handle case of user permission for step counts is not there
  if (appbit.permissions.granted("access_activity")) {
    stepCountLabel.text = getSteps().formatted;
  } else {
    stepCountLabel.text = "-----";
  }
}

/**
 * Gets and formats user step count for the day.
 * @returns 
 */
function getSteps() {
  let val = activity.adjusted.steps || 0;
  return {
    raw: val,
    formatted:
      val > 999
        ? `${Math.floor(val / 1000)},${("00" + (val % 1000)).slice(-3)}`
        : val,
  };
}

/**
 * Update the displayed battery level. 
 * @param {*} charger 
 * @param {*} evt 
 */
battery.onchange = (charger, evt) => {
  updateBattery();
};

/**
 * Updates the battery battery icon and label.
 */
function updateBattery() {
  updateBatteryLabel();
  updateBatteryIcon();
}

/**
 * Updates the battery lable GUI for battery percentage. 
 */
function updateBatteryLabel() {
  let percentSign = "&#x25";
  batteryLabel.text = battery.chargeLevel + percentSign;
}

/**
 * Updates what battery icon is displayed. 
 */
function updateBatteryIcon() {
  const minFull = 70;
  const minHalf = 30;
  
  if (battery.charging) {
    batteryIcon.image = "battery-charging.png"
  } else if (battery.chargeLevel > minFull) {
    batteryIcon.image = "battery-full.png"
  } else if (battery.chargeLevel < minFull && battery.chargeLevel > minHalf) {
    batteryIcon.image = "battery-half.png"
  } else if (battery.chargeLevel < minHalf) {
    batteryIcon.image = "battery-low.png"
  }
}

/**
 * Updates day of week displayed. 
 * @param {*} evt 
 */
function updateDayField(evt) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let index = evt.date.getDay();
    dayOfWeekLabel.text = dayNames[index].toUpperCase();
}

/**
 * Updates the month and day of month fields.
 * @param {*} evt 
 */
function updateDateFields(evt) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let month = monthNames[evt.date.getMonth()];
  let dayOfMonth = evt.date.getDate();

  monthLabel.text = month.toUpperCase();
  dayOfMonthLabel.text = dayOfMonth;
}

/**
 * Updates the moon phase icon image. 
 * @param {*} date 
 */
function updatePhaseIcon(date) {
    const phase = moon.getLunarPhase(date);

    switch (phase) {
        case moon.newMoon:
            moonIcon.image = "moon/new-moon.png";
        break;
        case moon.waxingCrescent:
            moonIcon.image = "moon/waxing-cresent.png";
        break;
        case moon.firstQuarter:
            moonIcon.image = "moon/first-quarter.png";
        break;
        case moon.waxingGibbous:
            moonIcon.image = "moon/waxing-gibbous.png";
        break;
        case moon.fullMoon:
            moonIcon.image = "moon/full-moon.png";
        break;
        case moon.waningGibbous:
            moonIcon.image = "moon/waning-gibbous.png";
        break;
        case moon.lastQuarter:
            moonIcon.image = "moon/last-quarter.png";
        break;
        case moon.waningCrescent:
            moonIcon.image = "moon/waning-cresent.png";
        break;
        default: 
            // something went wrong
            moonIcon.image = "";
    }
}

/**
 * Displays a very short label for moon phase. 
 * Will display, "New", "Full", "Wax", "Wan", or
 * if there is an error or unexpected condition 
 * an empty string will be set in label.
 * @param {*} date 
 */
function updatePhaseLabel(date) {
    const phase = moon.getLunarPhase(date);

    if (phase === moon.newMoon) {
        moonPaseLabel.text = "New";

    } else if (phase === moon.fullMoon) {
        moonPaseLabel.text = "Full";

    } else if ((moon.isWaxing(date) && moon.isWaning(date)) 
        || (!moon.isWaxing(date) && !moon.isWaning(date))) {
        // guard condition should not happen, but if it does handel it
        moonPaseLabel.text = " ";

    } else if (moon.isWaxing(date)) {
        moonPaseLabel.text = "Wax";

    } else if (moon.isWaning(date)) {
        moonPaseLabel.text = "Wan";

    } else {
        // should not get here, but if it does, handel it
        moonPaseLabel.text = " ";
    }
    moonPaseLabel.text = moonPaseLabel.text.toUpperCase();
}

/**
 * Sets the dial rotation. 
 * @param {*} date 
 */
function setDialRotation(date) {
    let newAngle = 0;

    if (lastPhaseUpdateDay === date.getDate()
        && lastPhaseUpdateMonth === date.getMonth()
        && lastPhaseUpdateYear === date.getUTCFullYear()) {
            dialgroup.groupTransform.rotate.angle = currentAngle;
            // we already updated the dial angle today, stop
            return;
    }

    const phase = moon.getLunarPhase(date);

    // check if we need to update the current side
    if (currentMoonPhase === moon.waningCrescent && phase === moon.newMoon) {
        // do side update
        if (currentDialSide === DialSide.DEER) {
            currentDialSide = DialSide.SHIP;
        } else {
            currentDialSide = DialSide.DEER;
        }
    }

    if (currentDialSide == DialSide.DEER) {
        newAngle = calculateDialChangeDeerSide(date);
    } else {
        newAngle = calculateDialChangeShipSide(date);
    }

    // update the dial angle
    dialgroup.groupTransform.rotate.angle = newAngle;

    // updates for later
    currentAngle = newAngle;
    currentMoonPhase = phase; 
    lastPhaseUpdateDay = date.getDate();
    lastPhaseUpdateMonth = date.getMonth(); // DEBUGING NOTE: this field is zero based
    lastPhaseUpdateYear = date.getUTCFullYear();
}

/**
 * Calculates the angle for display on the deer side of dial. 
 * @param {*} date 
 * @returns number - angle for moon dial
 */
function calculateDialChangeDeerSide(date) {
    let newAngle = 0;

    let newPhase = moon.getLunarPhase(date);

    if (currentMoonPhase === newPhase) {
        // we are in the same lunar phase, do increment calculations
        newAngle = incrementAngleDeerSide(newPhase);
    } else {
        // we are in a new lunar phase, set starting values
        newAngle = startingValuesDialDeerSide(newPhase);
    }

    return newAngle;
}

/**
 * Calculates the angle for display on the ship side of dial. 
 * @param {*} date 
 * @returns number - angle for moon dial
 */
function calculateDialChangeShipSide(date) {
    let newAngle = 0;

    let newPhase = moon.getLunarPhase(date);

    if (currentMoonPhase === newPhase) {
        // we are in the same lunar phase, do increment calculations
        newAngle = incrementAngleShipSide(newPhase);
    } else {
        // we are in a new lunar phase, set starting values
        newAngle = startingValuesDialShipSide(newPhase);
    }

    return newAngle;
}

/**
 * Returns starting location values for deer side phases.
 * @param {*} phase string
 * @returns number 
 */
function startingValuesDialDeerSide(phase) {
    let newAngle = 0;

    switch (phase) {
        case moon.newMoon:
            newAngle = DIAL_ANGLE_DEER_NEW_MOON;
            break;
        case moon.waxingCrescent:
            newAngle = DIAL_ANGLE_DEER_WAXING_CRESENT;
            break;
        case moon.firstQuarter:
            newAngle = DIAL_ANGLE_DEER_FIRST_QUARTER;
            break;
        case moon.waxingGibbous:
            newAngle = DIAL_ANGLE_DEER_WAXING_GIBBOUS;
            break;
        case moon.fullMoon:
            newAngle = DIAL_ANGLE_DEER_FULL_MOON;
            break;
        case moon.waningGibbous:
            newAngle = DIAL_ANGLE_DEER_WANING_GIBBOUS;
            break;
        case moon.lastQuarter:
            newAngle = DIAL_ANGLE_DEER_LAST_QUARTER;
            break;
        case moon.waningCrescent:
            newAngle = DIAL_ANGLE_DEER_WANING_CRESENT;
            break;
    }
    return newAngle;
}

/**
 * Returns starting location values for ship side phases.
 * @param {*} phase string 
 * @returns number
 */
function startingValuesDialShipSide(phase) {
    let newAngle = 0;

    switch (phase) {
        case moon.newMoon:
            newAngle = DIAL_ANGLE_SHIP_NEW_MOON;
            break;
        case moon.waxingCrescent:
            newAngle = DIAL_ANGLE_SHIP_WAXING_CRESENT;
            break;
        case moon.firstQuarter:
            newAngle = DIAL_ANGLE_SHIP_FIRST_QUARTER;
            break;
        case moon.waxingGibbous:
            newAngle = DIAL_ANGLE_SHIP_WAXING_GIBBOUS;
            break;
        case moon.fullMoon:
            newAngle = DIAL_ANGLE_SHIP_FULL_MOON;
            break;
        case moon.waningGibbous:
            newAngle = DIAL_ANGLE_SHIP_WANING_GIBBOUS;
            break;
        case moon.lastQuarter:
            newAngle = DIAL_ANGLE_SHIP_LAST_QUARTER;
            break;
        case moon.waningCrescent:
            newAngle = DIAL_ANGLE_SHIP_WANING_CRESENT;
            break;
    }
    return newAngle;
}

/**
 * Increment deer side of dial, not based on phase change.
 * @param {*} phase string
 * @returns number
 */
function incrementAngleDeerSide(phase) {
    let newAngle = 0;

    switch (phase) {
        case moon.newMoon:
            newAngle = incrementAngle(DIAL_ANGLE_DEER_WAXING_CRESENT);
            break;
        case moon.waxingCrescent:
            newAngle = incrementAngle(DIAL_ANGLE_DEER_FIRST_QUARTER);
            break;
        case moon.firstQuarter:
            newAngle = incrementAngle(DIAL_ANGLE_DEER_WAXING_GIBBOUS);
            break;
        case moon.waxingGibbous:
            newAngle = incrementAngle(DIAL_ANGLE_DEER_FULL_MOON);
            break;
        case moon.fullMoon:
            // special case due to circle's min/max values in this side/phase
            newAngle = incrementAngle((360 + DIAL_ANGLE_DEER_WANING_GIBBOUS));
            break;
        case moon.waningGibbous:
            newAngle = incrementAngle(DIAL_ANGLE_DEER_LAST_QUARTER);
            break;
        case moon.lastQuarter:
            newAngle = incrementAngle(DIAL_ANGLE_DEER_WANING_CRESENT);
            break;
        case moon.waningCrescent:
            // next phase is new moon, but next phase value would be invalid due to side change
            newAngle = incrementAngle(Number.MAX_VALUE);
            break;
    }
    return newAngle;
}

/**
 * Increment ship side of dial, not based on phase change.
 * @param {*} phase string
 * @returns number
 */
function incrementAngleShipSide(phase) {
    let newAngle = 0;

    switch (phase) {
        case moon.newMoon:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_WAXING_CRESENT);
            break;
        case moon.waxingCrescent:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_FIRST_QUARTER);
            break;
        case moon.firstQuarter:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_WAXING_GIBBOUS);
            break;
        case moon.waxingGibbous:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_FULL_MOON);
            break;
        case moon.fullMoon:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_WANING_GIBBOUS);
            break;
        case moon.waningGibbous:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_LAST_QUARTER);
            break;
        case moon.lastQuarter:
            newAngle = incrementAngle(DIAL_ANGLE_SHIP_WANING_CRESENT);
            break;
        case moon.waningCrescent:
            // next phase is new moon, but next phase value would be invalid due to side change
            newAngle = incrementAngle(Number.MAX_VALUE);
            break;
    }
    return newAngle;
}

/**
 * Returns an incremented value for current angle not based on lunar phase change.
 * @param {*} nextPhaseAngle number - value we do not want to exceed
 * @returns number
 */
function incrementAngle(nextPhaseAngle) {
    let newAngle = currentAngle;

    if ((currentAngle + 7) < nextPhaseAngle) {
        newAngle = newAngle + 7;

    } else if ((currentAngle + 6) < nextPhaseAngle) {
        newAngle = newAngle + 6;

    } else if ((currentAngle + 5) < nextPhaseAngle) {
        newAngle = newAngle + 5;

    } else if ((currentAngle + 4) < nextPhaseAngle) {
        newAngle = newAngle + 4;

    } else if ((currentAngle + 3) < nextPhaseAngle) {
        newAngle = newAngle + 3;

    } else if ((currentAngle + 2) < nextPhaseAngle) {
        newAngle = newAngle + 2;

    } else if ((currentAngle + 1) < nextPhaseAngle) {
        newAngle++;
    }

    // min & max values of circle happen durring full moon on deer side of dial
    if (currentDialSide === DialSide.DEER && currentMoonPhase === moon.fullMoon) {
        // we require special logic in this condition due to 
        // max and min values of circle angles hit here.
        if (newAngle > 360) {
            newAngle = newAngle - 360;
        }
    }

    return newAngle;
}
