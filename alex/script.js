const WORDS_ENDED_TEXT = "Слова закончились";
const LOCAL_STORAGE_WORDS_KEY = "wordsSet";
let currentWord;

let rememberButton = document.getElementById('rememberButton');
let forgotButton = document.getElementById('forgotButton');
let inputForm = document.getElementById("addWordForm");
let input = document.getElementById("addWordInput");
let wordDiv = document.getElementById('word');

rememberButton.addEventListener('click', rememberButtonOnClick);
forgotButton.addEventListener('click', forgotButtonOnClick);
inputForm.addEventListener('submit', inputFormOnSubmit);

let wordsSet = new Set(getWordsFromLocalStorage());
let wordQueue = returnShuffledArrayFromSet(wordsSet);

displayNextWord();


function displayNextWord() {
	if (wordQueue.length === 0) {
		wordDiv.innerText = WORDS_ENDED_TEXT;
		return;
	}
    
    currentWord = wordQueue.pop();
    wordDiv.innerText = currentWord || WORDS_ENDED_TEXT;
}

function getWordsFromLocalStorage() {
    try{
        return Array.from(JSON.parse(localStorage.getItem(LOCAL_STORAGE_WORDS_KEY)));
    } catch(e) {
        return [];
    }
}

function returnShuffledArrayFromSet(set) {
	let array = Array.from(wordsSet);

	if (array.length === 0) return [];
	if (array.length === 1) return array;
	return array.sort(() => Math.random() - 0.5);
}

function rememberButtonOnClick() {
	wordsSet.delete(currentWord);
	localStorage.setItem(LOCAL_STORAGE_WORDS_KEY, JSON.stringify(Array.from(wordsSet)));
    displayNextWord();
}

function forgotButtonOnClick() {
    displayNextWord();
}


function inputFormOnSubmit(e) {
	e.preventDefault();
    let word = input.value;
    inputForm.reset();
    if(!word.trim()) return false;

    wordsSet.add(word);
    wordQueue.push(word);
    localStorage.setItem(LOCAL_STORAGE_WORDS_KEY, JSON.stringify(Array.from(wordsSet)));
    
	if (!currentWord) displayNextWord();
	
	return false;
}