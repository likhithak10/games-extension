const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const timeDisplay = document.getElementById('time');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');

// Backup words in case API fails
const backupWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
];

let words = [];
let wordCache = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timeLeft = 30;
let timer = null;
let testActive = false;
let startTime;
let totalWords = 0;
let correctCharacters = 0;
let totalCharacters = 0;
let isLoadingWords = false;

// List of common word topics to get varied words
const topics = ['freq=20', 'topics=common', 'topics=basic', 'rel_trg=word'];

async function fetchWords() {
    if (isLoadingWords) return;
    isLoadingWords = true;

    try {
        // Randomly select a topic and get words
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const response = await fetch(`https://api.datamuse.com/words?${randomTopic}&max=100`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Filter and process the words
        const newWords = data
            .map(word => word.word.toLowerCase())
            .filter(word => {
                // Filter criteria:
                // 1. Word length between 2 and 8 characters
                // 2. Only contains letters
                // 3. No repeated words
                return word.length >= 2 && 
                       word.length <= 8 && 
                       /^[a-z]+$/.test(word) &&
                       !wordCache.includes(word);
            });

        // Shuffle the words
        const shuffledWords = newWords.sort(() => Math.random() - 0.5);
        
        wordCache = wordCache.concat(shuffledWords);
        console.log('Fetched new words:', shuffledWords);
        isLoadingWords = false;
    } catch (error) {
        console.error('Error fetching words:', error);
        // Use backup words if API fails
        const shuffledBackup = [...backupWords].sort(() => Math.random() - 0.5);
        wordCache = wordCache.concat(shuffledBackup);
        isLoadingWords = false;
    }
}

function getWords(count = 30) {
    // If we need more words and we're running low in cache, fetch more
    if (wordCache.length < count) {
        fetchWords();
    }
    
    // Get words from cache and shuffle them
    const wordsToReturn = wordCache.splice(0, count);
    
    // If we're running low on cached words, fetch more for next time
    if (wordCache.length < 50) {
        fetchWords();
    }
    
    return wordsToReturn.length > 0 ? wordsToReturn : backupWords.slice(0, count);
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
    if (currentCharIndex < words[currentWordIndex]?.length) {
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

            // Get more words if needed
            if (currentWordIndex >= words.length - 10) {
                words = words.concat(getWords(30));
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
async function initialize() {
    await fetchWords(); // Get initial batch of words
    words = getWords(50); // Get first 50 words for the test
    displayWords();
    inputField.focus();
}

initialize(); 