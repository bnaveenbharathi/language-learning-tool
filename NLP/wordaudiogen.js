const gtts = require('gtts');
const natural = require('natural');

// NLP tasks using Natural
function analyzeText(text) {
    
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);

    return { tokens };
}

//generate audio for a single letter
async function generateAudioForLetter(letter) {
    const language = 'en'; 
    const speech = new gtts(letter, language, true);
    const audioStream = await speech.stream();
    return new Promise((resolve, reject) => {
        const chunks = [];
        audioStream.on('data', chunk => chunks.push(chunk));
        audioStream.on('end', () => resolve(Buffer.concat(chunks)));
        audioStream.on('error', reject);
    });
}

// Function to generate audio for a word
async function generateAudioForWord(word) {
    const language = 'en';
    const speech = new gtts(word, language, true); 
    const audioStream = await speech.stream();
    return new Promise((resolve, reject) => {
        const chunks = [];
        audioStream.on('data', chunk => chunks.push(chunk));
        audioStream.on('end', () => resolve(Buffer.concat(chunks)));
        audioStream.on('error', reject);
    });
}

async function generateSplitAudioForWord(word) {
    const letters = word.split('');
    const audioStreams = [];
    for (const letter of letters) {
        const letterAudioBuffer = await generateAudioForLetter(letter);
        audioStreams.push(letterAudioBuffer);
    }
    const concatenatedAudio = Buffer.concat(audioStreams);
    return concatenatedAudio;
}

module.exports = {
    analyzeText,
    generateAudioForLetter,
    generateAudioForWord,
    generateSplitAudioForWord
};
