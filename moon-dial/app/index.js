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
const dayOfWeekLabel = document.getElementById("dayOfWeekLabel");
const monthLabel = document.getElementById("monthLabel");
const dayOfMonthLabel = document.getElementById("dayOfMonthLabel");
const dialgroup = document.getElementById("dialgroup");

clock.granularity = "seconds"; // TODO change to minutes 

clock.ontick = (evt) => {
    // get time information from API
    let todayDate = evt.date;
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

    displaySteps();
    updateBattery();

    updatePhaseIcon();
    updatePhaseLabel();

    updateDayField(evt);
    updateDateFields(evt);

    rotateImage()
};

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

let currentAngle = 0; // Initial angle TODO TEMP
function rotateImage() { // TODO this fuction is a temporary demo stub
    // TODO change to get angle from array
    currentAngle += 5; // Increment angle for rotation
    dialgroup.groupTransform.rotate.angle = currentAngle;
}

/**
 * Updates the moon phase icon image. 
 */
function updatePhaseIcon() {
    const phase = moon.getLunarPhase();

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
            moonIcon.image = "";
    }
}

/**
 * Displays a very short label for moon phase. 
 * Will display, "New", "Full", "Wax", "Wan", or
 * if there is an error or unexpected condition 
 * an empty string will be set in label.
 */
function updatePhaseLabel() {
    const phase = moon.getLunarPhase();

    if (phase === moon.newMoon) {
        moonPaseLabel.text = "New";

    } else if (phase === moon.fullMoon) {
        moonPaseLabel.text = "Full";

    } else if ((moon.isWaxing() && moon.isWaning()) 
        || (!moon.isWaxing() && !moon.isWaning())) {
        // guard condition should not happen, but if it does handel it
        moonPaseLabel.text = " ";

    } else if (moon.isWaxing()) {
        moonPaseLabel.text = "Wax";

    } else if (moon.isWaning()) {
        moonPaseLabel.text = "Wan";

    } else {
        // should not get here, but if it does, handel it
        moonPaseLabel.text = " ";
    }
    moonPaseLabel.text = moonPaseLabel.text.toUpperCase();
}