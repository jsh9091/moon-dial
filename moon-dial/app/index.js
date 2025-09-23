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
import * as moon from "./lunarcalculator";

const dialgroup = document.getElementById("dialgroup");
const phaseLabel = document.getElementById("phaseLabel");

clock.granularity = "seconds"; // TODO change to minutes 

clock.ontick = (evt) => {
    phaseLabel.text =  moon.calculateLunarPhase(); // TODO eventually change to only fire once a day
    rotateImage()
};


let currentAngle = 0; // Initial angle

function rotateImage() {
    // TODO change to get angle from array
    currentAngle += 5; // Increment angle for rotation
    dialgroup.groupTransform.rotate.angle = currentAngle;
}