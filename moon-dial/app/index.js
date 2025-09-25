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
import { preferences, units } from "user-settings";
import * as moon from "./lunarcalculator";

const timeLabel = document.getElementById("timeLabel");
const moonPaseLabel = document.getElementById("moonPaseLabel");
const dialgroup = document.getElementById("dialgroup");
const phaseLabel = document.getElementById("phaseLabel"); // TODO remove temporary label

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

    updatePhaseLabel();

    phaseLabel.text = moon.calculateLunarPhase(); // TODO eventually change to only fire once a day
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

let currentAngle = 0; // Initial angle

function rotateImage() {
    // TODO change to get angle from array
    currentAngle += 5; // Increment angle for rotation
    dialgroup.groupTransform.rotate.angle = currentAngle;
}

/**
 * Displays a very short label for moon phase. 
 * Will display, "New", "Full", "Wax", "Wan", or
 * if there is an error or unexpected condition 
 * an empty string will be set in label.
 */
function updatePhaseLabel() {
    const phase = moon.calculateLunarPhase();

    if (phase === "New Moon") {
        moonPaseLabel.text = "New";

    } else if (phase === "Full Moon") {
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
}