import {createRoll, createRollWithController} from "./pianoRoll.js";
import {sample, sampler} from "./instrument.js";
import { levels, createGamePianoRoll } from "./beatGame.js";
var samples = [
    new sample("Kick", "./sounds/kick.wav"),
    new sample("Snare", "./sounds/snare.wav"),
    new sample("Hi Hat", "./sounds/hihat.wav")
]

const audioCtx = new AudioContext();

var smpler = new sampler(samples, audioCtx);

const rollAndController = createRollWithController(document.getElementById("roll1"), smpler, 16, audioCtx);

//startLevel(levels[0], rollAndController.roll);


const gameRollAndController = createGamePianoRoll(document.getElementById("roll2"), smpler, 16, audioCtx);
gameRollAndController.game.startLevel(levels[0]);