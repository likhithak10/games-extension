const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const timeDisplay = document.getElementById('time');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');

// Common English words for typing practice
const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
];

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timeLeft = 30;
let timer = null;
let testActive = false;
let startTime;
let totalWords = 0;
let correctCharacters = 0;
let totalCharacters = 0;

function generateWords(count = 50) {
    const newWords = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * commonWords.length);
        newWords.push(commonWords[randomIndex]);
    }
    return newWords;
}

function displayWords() {
    const visibleWords = words.slice(currentWordIndex, currentWordIndex + 20);
    const wordElements = visibleWords.map((word, index) => {
        const isCurrentWord = index === 0;
        const characters = word.split('').map((char, charIndex) => {
            let className = 'upcoming';
            if (isCurrentWord) {
                if (charIndex < currentCharIndex) {
                    const inputChar = inputField.value[charIndex];
                    className = inputChar === char ? 'correct' : 'incorrect';
                } else if (charIndex === currentCharIndex) {
                    className = 'current';
                }
            }
            return `<span class="${className}">${char}</span>`;
        }).join('');
        
        return `<span class="word-wrapper"><span class="word">${characters}</span>${isCurrentWord && currentCharIndex === word.length ? '<span class="cursor"></span>' : ''}</span>`;
    }).join('');
    
    textDisplay.innerHTML = wordElements;

    // Add cursor at current position if within word
    if (currentCharIndex < words[currentWordIndex].length) {
        const currentWord = textDisplay.children[0];
        if (currentWord) {
            const chars = currentWord.getElementsByClassName('word')[0].children;
            if (chars[currentCharIndex]) {
                const cursorSpan = document.createElement('span');
                cursorSpan.className = 'cursor';
                chars[currentCharIndex].insertAdjacentElement('beforebegin', cursorSpan);
            }
        }
    }
}

function calculateWPM() {
    const timeElapsed = Math.max((Date.now() - startTime) / 1000 / 60, 0.001); // in minutes
    return Math.round(totalWords / timeElapsed);
}

function calculateAccuracy() {
    return totalCharacters === 0 ? 0 : Math.round((correctCharacters / totalCharacters) * 100);
}

function updateStats() {
    if (testActive) {
        const wpm = calculateWPM();
        const accuracy = calculateAccuracy();
        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + '%';
    }
}

function startTest() {
    if (!testActive) {
        testActive = true;
        timeLeft = 30;
        totalWords = 0;
        correctCharacters = 0;
        totalCharacters = 0;
        startTime = Date.now();
        inputField.focus();
        
        timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft + 's';
            
            if (timeLeft <= 0) {
                endTest();
            }
        }, 1000);
    }
}

function endTest() {
    testActive = false;
    clearInterval(timer);
    inputField.disabled = true;
    
    const finalWPM = calculateWPM();
    const finalAccuracy = calculateAccuracy();
    
    textDisplay.innerHTML = `<span class="word correct">Test completed! WPM: ${finalWPM} Accuracy: ${finalAccuracy}%</span>`;
}

function handleInput(e) {
    const currentChar = e.data;
    if (!currentChar) return; // Handle deletions separately

    if (!testActive) {
        startTest();
    }

    const currentWord = words[currentWordIndex];
    
    if (currentChar === ' ') {
        if (currentCharIndex === currentWord.length) {
            // Completed word correctly
            totalWords++;
            currentWordIndex++;
            currentCharIndex = 0;
            inputField.value = '';

            // Generate more words if needed
            if (currentWordIndex >= words.length - 10) {
                words = words.concat(generateWords(30));
            }
        }
    } else if (currentCharIndex < currentWord.length) {
        totalCharacters++;
        if (currentChar === currentWord[currentCharIndex]) {
            correctCharacters++;
        }
        currentCharIndex++;
    }

    displayWords();
    updateStats();
}

function handleKeydown(e) {
    if (e.key === 'Backspace') {
        if (currentCharIndex > 0) {
            currentCharIndex--;
            totalCharacters--;
            displayWords();
        }
    }
}

// Event Listeners
inputField.addEventListener('input', handleInput);
inputField.addEventListener('keydown', handleKeydown);

// Initial setup
words = generateWords(50);
displayWords();
inputField.focus(); 