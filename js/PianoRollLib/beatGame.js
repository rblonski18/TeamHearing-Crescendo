const BeatGame = (function(){

class BeatChecker {
    constructor(pianoRoll) {
        pianoRoll.addBeatListener((i, t) => this._onBeatPlay(i, t));

        this._isCurrentlyChecking = false;
        this._expectedBeat = undefined;   
    }

    setCurrentlyChecking(value) {
        this._isCurrentlyChecking = value;
    }

    setExpectedBeat(expectedBeat) {
        this._expectedBeat = expectedBeat;
    }

    _onBeatPlay(beatIndex, time) {
        if (!this._isCurrentlyChecking) {
            return;
        }

        // The beat is played at an arbitrary point in the future, we must delay 
        // calling the callbacks until approx that time
        const delay = Math.floor((time - pianoRoll.audioCtx.currentTime) * 1000);

        var isCorrect = true;

        for (let i = 0; i < pianoRoll.instrument.notes.length; i++) {
            if (this._expectedBeat.isBeatToggled(beatIndex, i) != pianoRoll.isBeatToggled(beatIndex, i)) {
                isCorrect = false;

                this._callDelayed(() => this.onIncorrectNote?.(beatIndex, i), delay);
            }
            else {

                this._callDelayed(() => this.onCorrectNote?.(beatIndex, i), delay);
            }
        }

        // If correct but the beat is not finished
        if (isCorrect && beatIndex < pianoRoll.length - 1)
            return;

        if (isCorrect) {
            this._callDelayed(() => this._onBeatSucceed(), delay);
        }
        else {
            this._callDelayed(() => this._onBeatFailed(), delay);
        }
    }

    _callDelayed(f, delay) {
        if (delay < 10) {
            f();
        }
        else {
            setTimeout(f, delay);
        }
    }

    _onBeatFailed() {
        pianoRoll.stop();
        this.onFail?.();
    }

    _onBeatSucceed() {
        this.onSuccess?.();
    }
}

var _numWaveforms = 0;

function createGamePianoRoll(domParent, instrument, length, audioCtx){
    // TODO: create a custom piano roll controller to control the piano roll.
    // This controller should allow for testing a runthrough of the level or 
    // submitting a sequence. Input should be disabled when the piano roll is
    // running in submit mode
    // A gamestate object should also be created 

    const stackContainer = document.createElement("div");
    stackContainer.classList.add("gameSpace");
    domParent.appendChild(stackContainer);

    const wavesurferContainer = document.createElement("div");
    wavesurferContainer.classList.add("wavesurfContainer");
    wavesurferContainer.id = "waveform_" + _numWaveforms;
    wavesurferContainer.style.width = "800px"
    stackContainer.appendChild(wavesurferContainer);
    
    const wavesurfer = WaveSurfer.create({
        container: "#" + wavesurferContainer.id,
        waveColor: 'black',
        progressColor: 'orange',
        height: 100,
        interact: false,
        normalize: true
    });

    wavesurfer.on('finish', () => wavesurfer.seekTo(0));

    _numWaveforms += 1;

    const pianoRollContainer = document.createElement("div");
    pianoRollContainer.classList.add("pianoRollContainer");
    stackContainer.appendChild(pianoRollContainer);

    const pianoRoll = PianoRoll.createRoll(pianoRollContainer, instrument, length, audioCtx);
    
    const newGame = new Game(pianoRoll, wavesurfer);

    const controls = document.createElement("div");
    controls.classList.add("pianoRollRow");
    controls.classList.add("pianoRollControls");
    pianoRollContainer.appendChild(controls);

    const listenBtn = createControllerButton("Listen", () => {
        wavesurfer.play(0);
    });

    controls.appendChild(listenBtn);

    const playBtn = createControllerButton("Play", () => {
        pianoRoll.resetPlayProgress();
        pianoRoll.play(newGame.currentLevel.bpm, false);
    });

    controls.appendChild(playBtn);

    const submitBtn = createControllerButton("Submit", () => newGame.submitSolution());

    controls.appendChild(submitBtn);

    return {
        game: newGame,
        wavesurfer: wavesurfer
    }
}

function createControllerButton(text, onClick){
    const btn = document.createElement("button");
    btn.classList.add("pianoRollButton");
    btn.innerText = text;
    btn.onclick = onClick;

    return btn;
}


class Game {
    constructor(pianoRoll, wavesurfer) {
        this.pianoRoll = pianoRoll;
        this.wavesurfer = wavesurfer;

        this._beatChecker = new BeatChecker(pianoRoll);

        this._beatChecker.onCorrectNote = (i, j) => this._onCorrectNote(i, j);
        this._beatChecker.onIncorrectNote = (i, j) => this._onIncorrectNote(i, j);
        this._beatChecker.onFail = () => this._onFail();
        this._beatChecker.onSuccess = () => this._onSuccess();

        this.currentLevel = undefined;
    }

    startLevel(level) {
        this.currentLevel = level;
        this._beatChecker.setExpectedBeat(level.beat);

        PianoRoll.renderBeat(level.beat, this.pianoRoll.instrument, level.bpm)
            .then(audioBuffer => {
                this.wavesurfer.loadDecodedBuffer(audioBuffer);
            });
    }

    submitSolution() {
        this._beatChecker.setCurrentlyChecking(true);
        pianoRoll.isInteractionEnabled = false;

        pianoRoll.resetPlayProgress();
        pianoRoll.play(this.currentLevel.bpm, false);
    }

    _onCorrectNote(beatIndex, noteIndex) {
        if (this.currentLevel.beat.isBeatToggled(beatIndex, noteIndex)) {
            pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareSucceeded");
        }
    }

    _onIncorrectNote(beatIndex, noteIndex) {
        if (!this.currentLevel.beat.isBeatToggled(beatIndex, noteIndex)) {
            pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareFailed");
        }
    }

    _onFail() {
        this._beatChecker.setCurrentlyChecking(false);
        pianoRoll.isInteractionEnabled = true;
    }

    _onSuccess() {
        this._beatChecker.setCurrentlyChecking(false);
        pianoRoll.isInteractionEnabled = true;

        this.onlevelcomplete?.();
    }
}

function level(beat, bpm){
    this.beat = beat;
    this.bpm = bpm;
}

const levels = [
    new level(PianoRoll.beatFromEncodedState(3, 16, "qqoICIGC"), 70),
    new level(PianoRoll.beatFromEncodedState(3, 16, "/j8ICINC"), 70)
]

const melodicLevels = [
    new level(PianoRoll.beatFromEncodedState(5, 16, "CIAAACAgAACACA"), 70)
]


return {
    BeatChecker: BeatChecker,
    createGamePianoRoll: createGamePianoRoll,
    level: level,
    levels: levels,
    melodicLevels: melodicLevels
};

})();