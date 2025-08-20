const words = [
    "a", "about", "after", "again", "all", "always", "am", "an", "and", "any",
    "are", "around", "as", "ask", "at", "ate", "away", "be", "because", "been",
    "before", "best", "better", "big", "black", "blue", "both", "bring", "brown",
    "but", "buy", "by", "call", "came", "can", "carry", "clean", "cold", "come",
    "could", "cut", "did", "do", "does", "done", "down", "draw", "drink", "eat",
    "eight", "every", "fall", "far", "fast", "find", "first", "five", "fly",
    "for", "found", "four", "from", "full", "funny", "gave", "get", "give", "go",
    "goes", "going", "good", "got", "gray", "green", "grow", "had", "has",
    "have", "he", "help", "her", "here", "him", "his", "hold", "hot", "how",
    "hurt", "i", "if", "in", "into", "is", "it", "its", "jump", "just", "keep",
    "kind", "know", "laugh", "let", "light", "like", "line", "little", "live",
    "long", "look", "made", "make", "many", "may", "me", "more", "most",
    "mother", "much", "must", "my", "myself", "name", "near", "need", "never",
    "new", "next", "night", "no", "not", "now", "number", "of", "off", "old",
    "on", "once", "one", "only", "open", "or", "other", "our", "out", "over",
    "own", "paper", "part", "people", "pick", "play", "please", "put", "rain",
    "read", "red", "ride", "right", "round", "run", "said", "saw", "say", "see",
    "seven", "shall", "she", "show", "sing", "sit", "six", "sleep", "small",
    "so", "some", "soon", "start", "stop", "sun", "take", "tell", "ten", "thank",
    "that", "the", "them", "then", "there", "they", "think", "this", "three",
    "time", "to", "today", "together", "too", "try", "two", "under", "up", "use",
    "very", "walk", "want", "was", "we", "well", "went", "were", "what", "when",
    "where", "which", "white", "who", "why", "will", "with", "work", "would",
    "write", "yellow", "yes", "you", "your", "computer", "phone", "table",
    "chair", "window", "door", "book", "school", "city", "music", "family",
    "morning", "evening", "garden", "river", "mountain", "ocean", "flower",
    "animal", "doctor", "student", "teacher", "picture", "moment", "country",
    "group", "process", "result", "system", "market", "program", "service",
    "power", "story", "history", "science", "energy", "winter", "summer",
    "spring", "autumn", "video", "letter", "machine", "future", "reason",
    "example", "section", "practice", "bridge", "skill", "career", "memory",
    "language", "project", "holiday", "problem", "solution", "data", "matter",
    "product", "industry", "village", "engine", "patient", "police", "series",
    "agency", "camera", "coffee", "culture", "design", "driver", "feature",
    "flight", "friend", "growth", "health", "income", "island", "leader",
    "minute", "nature", "office", "parent", "person", "record", "recent",
    "region", "school", "signal", "society", "strength", "traffic", "travel",
    "window", "writer", "zebra", "keyboard", "monitor", "comet"
  ]
  const wordsCount=words.length;

// game config and state
const VISIBLE_LINES = 3; // matches the visible height (3 * 35px)
const LINE_HEIGHT_PX = 35; // must match CSS line-height
let scrollLineIndex = 0;
let lastLineIndex = 0;

let isStarted = false;
let isFinished = false;
let timerId = null;
let startingTime = 30;
let timeLeft = startingTime;

function updateInfo(){
    const info = document.getElementById("info");
    if (info) info.textContent = String(timeLeft);
}

function startTimer(){
    if (timerId) return;
    isStarted = true;
    timerId = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0){
            timeLeft = 0;
            updateInfo();
            endGame();
            return;
        }
        updateInfo();
    }, 1000);
}

function stopTimer(){
    if (timerId){
        clearInterval(timerId);
        timerId = null;
    }
}

function computeResults(){
    const correct = document.querySelectorAll('.letter.correct').length;
    const incorrect = document.querySelectorAll('.letter.incorrect').length;
    const typed = correct + incorrect;
    const minutes = startingTime / 60;
    const wpm = minutes > 0 ? (correct / 5) / minutes : 0;
    const accuracy = typed > 0 ? (correct / typed) * 100 : 0;
    return {
        correct,
        incorrect,
        typed,
        wpm: Math.max(0, wpm),
        accuracy: Math.max(0, Math.min(100, accuracy))
    };
}

function showResultsOverlay(){
    const game = document.getElementById('game');
    if (!game) return;
    const { wpm, accuracy } = computeResults();
    const overlay = document.createElement('div');
    overlay.id = 'result-overlay';
    overlay.innerHTML = `
        <div class="result-card">
            <h2>Time's up!</h2>
            <div class="metric">WPM: <strong>${wpm.toFixed(0)}</strong></div>
            <div class="metric">Accuracy: <strong>${accuracy.toFixed(0)}%</strong></div>
            <button id="overlay-new-game">new game</button>
        </div>
    `;
    game.appendChild(overlay);
    const btn = document.getElementById('overlay-new-game');
    btn?.addEventListener('click', () => {
        newGame();
        game.focus();
    });
}

function endGame(){
    isFinished = true;
    stopTimer();
    const game = document.getElementById('game');
    if (game) addClass(game, 'finished');
    showResultsOverlay();
}

function resetTimer(){
    stopTimer();
    isStarted = false;
    isFinished = false;
    timeLeft = startingTime;
    updateInfo();
}

function updateScrollToCurrentLine(){
    const wordsEl = document.getElementById("words");
    const currentWord = document.querySelector(".word.current");
    const currentLetter = document.querySelector(".letter.current");
    if (!wordsEl || (!currentWord && !currentLetter)) return;

    const anchor = currentLetter || currentWord;
    const currentLine = Math.floor(anchor.offsetTop / LINE_HEIGHT_PX);
    if (currentLine !== lastLineIndex){
        scrollLineIndex = currentLine; // place the new line at the top
        lastLineIndex = currentLine;
    }

    wordsEl.style.transform = `translateY(-${scrollLineIndex * LINE_HEIGHT_PX}px)`;
}

function addClass(el, name){
    el.className+= ' ' + name;
}

function removeClass(el, name){
    el.className=el.className.replace(name, '');
}

function randomWord(){
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word){
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame(){
    const wordsEl = document.getElementById("words");
    if (!wordsEl) return;
    const game = document.getElementById('game');
    if (game) removeClass(game, 'finished');
    const existingOverlay = document.getElementById('result-overlay');
    if (existingOverlay) existingOverlay.remove();
    wordsEl.innerHTML = "";
    wordsEl.style.transform = "translateY(0px)";
    scrollLineIndex = 0;
    lastLineIndex = 0;
    for (let i = 0; i < 200; i++){
        wordsEl.innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector(".word"), "current");
    addClass(document.querySelector(".letter"), "current");
    resetTimer();
    updateScrollToCurrentLine();
    const cursor = document.getElementById("cursor");
    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector(".word.current");
    if (cursor){
        const rect = (nextLetter || nextWord)?.getBoundingClientRect();
        if (rect){
            cursor.style.top = rect.top + 2 + 'px';
            cursor.style.left = nextLetter ? (rect.left + 'px') : (rect.right + 2 + 'px');
        }
    }
}

document.getElementById("game").addEventListener("keyup", ev => {
    const key = ev.key;
    const currentWord = document.querySelector(".word.current");
    const currentLetter = document.querySelector(".letter.current");
    
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentWord?.firstChild === currentLetter;

    console.log(key, expected);

    if (!isStarted && !isFinished && (isLetter || isSpace || isBackspace)){
        startTimer();
    }

    if (isFinished){
        return;
    }

    if(isLetter){
        if (currentLetter) {
            addClass(currentLetter, key === expected ? "correct" : "incorrect");
            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling){
                addClass(currentLetter.nextSibling, 'current');
            }
        } else if (currentWord) {
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }

    if (isSpace) {
        if (expected !== ' ') {
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter => {
                addClass(letter, 'incorrect');
            });
        }
        removeClass(currentWord, 'current');
        addClass(currentWord.nextSibling, 'current');
        if (currentLetter) {
            removeClass(currentLetter, 'current');
        }
        addClass(currentWord.nextSibling.firstChild, 'current');
    }

    if (isBackspace) {
        if (currentLetter && isFirstLetter && currentWord.previousSibling) {
            removeClass(currentWord, 'current');
            addClass(currentWord.previousSibling, 'current');
            removeClass(currentLetter, 'current');
            const lastLetter = currentWord.previousSibling.lastChild;
            if (lastLetter) {
                addClass(lastLetter, 'current');
                removeClass(lastLetter, 'incorrect');
                removeClass(lastLetter, 'correct');
            }
        } else if (currentLetter && !isFirstLetter) {
            removeClass(currentLetter, 'current');
            const prevLetter = currentLetter.previousSibling;
            if (prevLetter) {
                addClass(prevLetter, 'current');
                removeClass(prevLetter, 'incorrect');
                removeClass(prevLetter, 'correct');
            }
        } else if (!currentLetter && currentWord) {
            // If we're at the end of a word, move to the last letter
            const lastLetter = currentWord.lastChild;
            if (lastLetter) {
                addClass(lastLetter, 'current');
                removeClass(lastLetter, 'incorrect');
                removeClass(lastLetter, 'correct');
            }
        }
    }

    // update scrolling within the game box so current line stays visible
    updateScrollToCurrentLine();



    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector(".word.current");
    const cursor = document.getElementById("cursor");
    
    if (cursor) {
        const rect = (nextLetter || nextWord)?.getBoundingClientRect();
        if (rect) {
            cursor.style.top = rect.top + 2 + 'px';  
            if (nextLetter) {
                cursor.style.left = rect.left + 'px';
            } else if (nextWord) {
                cursor.style.left = rect.right + 2 + 'px';  
            }
        }
    }
});

newGame();

// UI wiring
const newGameBtn = document.querySelector('#buttons button');
if (newGameBtn){
    newGameBtn.addEventListener('click', () => {
        newGame();
        const game = document.getElementById('game');
        game?.focus();
    });
}

const gameEl = document.getElementById('game');
if (gameEl){
    gameEl.addEventListener('click', () => gameEl.focus());
}

