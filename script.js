// Game state
let currentQuestion = 0;
let totalQuestions = 10;
let score = 0;
let streak = 0;
let questions = [];
let currentAnswers = [];
let currentDenominators = [];
let currentShapes = [];

// DOM elements
const questionNumberEl = document.getElementById('question-number');
const totalQuestionsEl = document.getElementById('total-questions');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const questionTextEl = document.getElementById('question-text');
const baseFractionEl = document.querySelector('.base-fraction');
const visualAreaEl = document.getElementById('visual-area');
const inputsAreaEl = document.querySelector('.inputs-area');
const feedbackEl = document.getElementById('feedback');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const progressFillEl = document.getElementById('progress-fill');
const difficultySelect = document.getElementById('difficulty-select');
const celebrationEl = document.getElementById('celebration');

// Difficulty settings
const difficultySettings = {
    easy: { minDenominator: 2, maxDenominator: 8, baseFractions: ['1/2', '1/3', '1/4', '2/3'] },
    medium: { minDenominator: 3, maxDenominator: 12, baseFractions: ['1/2', '1/3', '2/3', '3/4', '2/5'] },
    hard: { minDenominator: 5, maxDenominator: 16, baseFractions: ['3/5', '2/7', '4/9', '5/6', '3/8'] }
};

// Shape types
const shapeTypes = ['circle', 'square', 'triangle', 'rectangle'];

// Initialize the game
function initGame() {
    generateQuestions();
    loadQuestion(0);
    updateStats();
    updateProgressBar();
    
    // Event listeners
    checkBtn.addEventListener('click', checkAnswers);
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', previousQuestion);
    difficultySelect.addEventListener('change', changeDifficulty);
}

// Generate all questions
function generateQuestions() {
    questions = [];
    const difficulty = difficultySelect.value;
    const settings = difficultySettings[difficulty];
    
    for (let i = 0; i < totalQuestions; i++) {
        const baseFraction = settings.baseFractions[
            Math.floor(Math.random() * settings.baseFractions.length)
        ];
        
        questions.push({
            baseFraction,
            denominators: generateDenominators(baseFraction, settings),
            shapes: generateShapes(),
            answers: generateAnswers(baseFraction)
        });
    }
}

// Generate denominators for current question
function generateDenominators(baseFraction, settings) {
    const [numerator, denominator] = baseFraction.split('/').map(Number);
    const denominators = [];
    
    while (denominators.length < 3) {
        const multiplier = Math.floor(Math.random() * 3) + 2;
        const newDenominator = denominator * multiplier;
        
        if (newDenominator >= settings.minDenominator && 
            newDenominator <= settings.maxDenominator &&
            !denominators.includes(newDenominator)) {
            denominators.push(newDenominator);
        }
    }
    
    return denominators;
}

// Generate random shapes for current question
function generateShapes() {
    const shapes = [];
    while (shapes.length < 3) {
        const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        if (!shapes.includes(shape)) {
            shapes.push(shape);
        }
    }
    return shapes;
}

// Generate correct answers for current question
function generateAnswers(baseFraction) {
    const [numerator, denominator] = baseFraction.split('/').map(Number);
    const answers = [];
    
    for (let i = 2; i <= 4; i++) {
        answers.push(`${numerator * i}/${denominator * i}`);
    }
    
    return answers;
}

// Load a specific question
function loadQuestion(index) {
    if (index < 0 || index >= totalQuestions) return;
    
    currentQuestion = index;
    const question = questions[index];
    
    // Update UI
    questionNumberEl.textContent = currentQuestion + 1;
    baseFractionEl.textContent = question.baseFraction;
    questionTextEl.innerHTML = `Find fractions equivalent to <span class="base-fraction">${question.baseFraction}</span>`;
    
    // Clear previous content
    visualAreaEl.innerHTML = '';
    inputsAreaEl.innerHTML = '';
    feedbackEl.innerHTML = '';
    feedbackEl.className = 'feedback';
    
    // Reset next button
    nextBtn.disabled = true;
    
    // Store current state
    currentDenominators = [...question.denominators];
    currentShapes = [...question.shapes];
    currentAnswers = [...question.answers];
    
    // Generate shapes and inputs
    for (let i = 0; i < 3; i++) {
        createShape(i, question.denominators[i], question.shapes[i]);
        createInput(i, question.denominators[i], question.answers[i]);
    }
    
    // Update previous button
    prevBtn.disabled = currentQuestion === 0;
    
    updateProgressBar();
}

// Create a shape SVG
function createShape(index, denominator, shapeType) {
    const container = document.createElement('div');
    container.className = 'shape-container';
    
    const title = document.createElement('div');
    title.className = 'shape-title';
    title.textContent = `Shape ${index + 1} (${shapeType})`;
    container.appendChild(title);
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '150');
    svg.setAttribute('height', '150');
    svg.setAttribute('class', 'shape-svg');
    svg.setAttribute('data-index', index);
    
    // Draw different shapes based on type
    switch(shapeType) {
        case 'circle':
            drawCircle(svg, denominator);
            break;
        case 'square':
            drawSquare(svg, denominator);
            break;
        case 'triangle':
            drawTriangle(svg, denominator);
            break;
        case 'rectangle':
            drawRectangle(svg, denominator);
            break;
    }
    
    container.appendChild(svg);
    visualAreaEl.appendChild(container);
}

// Draw a circle divided into slices
function drawCircle(svg, denominator) {
    const centerX = 75;
    const centerY = 75;
    const radius = 60;
    
    for (let i = 0; i < denominator; i++) {
        const startAngle = (i * 2 * Math.PI) / denominator;
        const endAngle = ((i + 1) * 2 * Math.PI) / denominator;
        
        const x1 = centerX + radius * Math.sin(startAngle);
        const y1 = centerY - radius * Math.cos(startAngle);
        const x2 = centerX + radius * Math.sin(endAngle);
        const y2 = centerY - radius * Math.cos(endAngle);
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const largeArc = 0;
        
        path.setAttribute('d', 
            `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
        );
        path.setAttribute('class', 'slice');
        path.setAttribute('data-index', i);
        path.addEventListener('click', toggleSlice);
        
        svg.appendChild(path);
    }
}

// Draw a square divided into equal parts
function drawSquare(svg, denominator) {
    const size = 120;
    const offsetX = 15;
    const offsetY = 15;
    
    // Determine grid dimensions
    let rows = 1;
    let cols = denominator;
    
    // Try to make a more square-like grid
    for (let i = Math.floor(Math.sqrt(denominator)); i >= 1; i--) {
        if (denominator % i === 0) {
            rows = i;
            cols = denominator / i;
            break;
        }
    }
    
    const cellWidth = size / cols;
    const cellHeight = size / rows;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index >= denominator) break;
            
            const x = offsetX + col * cellWidth;
            const y = offsetY + row * cellHeight;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', cellWidth);
            rect.setAttribute('height', cellHeight);
            rect.setAttribute('class', 'slice');
            rect.setAttribute('data-index', index);
            rect.addEventListener('click', toggleSlice);
            
            svg.appendChild(rect);
        }
    }
}

// Draw a triangle divided into equal parts
function drawTriangle(svg, denominator) {
    const base = 120;
    const height = 100;
    const offsetX = 15;
    const offsetY = 40;
    
    // For simplicity, we'll use horizontal divisions
    for (let i = 0; i < denominator; i++) {
        const y1 = offsetY + (i * height) / denominator;
        const y2 = offsetY + ((i + 1) * height) / denominator;
        
        // Calculate width at this height
        const width1 = base * (1 - i / denominator);
        const width2 = base * (1 - (i + 1) / denominator);
        
        const x1 = offsetX + (base - width1) / 2;
        const x2 = offsetX + (base - width2) / 2;
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', 
            `${x1},${y1} ${x1 + width1},${y1} ${x2 + width2},${y2} ${x2},${y2}`
        );
        polygon.setAttribute('class', 'slice');
        polygon.setAttribute('data-index', i);
        polygon.addEventListener('click', toggleSlice);
        
        svg.appendChild(polygon);
    }
}

// Draw a rectangle divided into equal parts
function drawRectangle(svg, denominator) {
    const width = 140;
    const height = 80;
    const offsetX = 5;
    const offsetY = 35;
    
    // Determine orientation (horizontal or vertical division)
    const horizontal = Math.random() > 0.5;
    
    if (horizontal) {
        // Divide horizontally
        const cellHeight = height / denominator;
        
        for (let i = 0; i < denominator; i++) {
            const y = offsetY + i * cellHeight;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', offsetX);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', cellHeight);
            rect.setAttribute('class', 'slice');
            rect.setAttribute('data-index', i);
            rect.addEventListener('click', toggleSlice);
            
            svg.appendChild(rect);
        }
    } else {
        // Divide vertically
        const cellWidth = width / denominator;
        
        for (let i = 0; i < denominator; i++) {
            const x = offsetX + i * cellWidth;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', offsetY);
            rect.setAttribute('width', cellWidth);
            rect.setAttribute('height', height);
            rect.setAttribute('class', 'slice');
            rect.setAttribute('data-index', i);
            rect.addEventListener('click', toggleSlice);
            
            svg.appendChild(rect);
        }
    }
}

// Toggle slice color
function toggleSlice(event) {
    const slice = event.target;
    slice.classList.toggle('active');
}

// Create input field for a fraction
function createInput(index, denominator, correctAnswer) {
    const container = document.createElement('div');
    container.className = 'input-container';
    
    const label = document.createElement('div');
    label.className = 'shape-title';
    label.textContent = `Fraction ${index + 1}`;
    container.appendChild(label);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'fraction-input';
    input.placeholder = `?/${denominator}`;
    input.dataset.index = index;
    input.dataset.correct = correctAnswer;
    
    container.appendChild(input);
    inputsAreaEl.appendChild(container);
}

// Check all answers
function checkAnswers() {
    const inputs = document.querySelectorAll('.fraction-input');
    const shapes = document.querySelectorAll('.shape-svg');
    let allCorrect = true;
    
    inputs.forEach((input, index) => {
        const shape = shapes[index];
        const activeSlices = shape.querySelectorAll('.slice.active').length;
        const denominator = currentDenominators[index];
        const userInput = input.value.trim().replace(/\s/g, '');
        const correctAnswer = currentAnswers[index];
        
        // Parse the base fraction
        const [baseNum, baseDen] = questions[currentQuestion].baseFraction.split('/').map(Number);
        const expectedNumerator = (baseNum * denominator) / baseDen;
        
        // Check if input matches AND slices match
        const inputCorrect = userInput === correctAnswer;
        const slicesCorrect = activeSlices === expectedNumerator;
        
        if (inputCorrect && slicesCorrect) {
            input.classList.remove('wrong');
            input.classList.add('correct');
        } else {
            input.classList.remove('correct');
            input.classList.add('wrong');
            allCorrect = false;
        }
    });
    
    // Update feedback
    if (allCorrect) {
        feedbackEl.textContent = `🎉 Excellent! All ${streak + 1} in a row correct!`;
        feedbackEl.className = 'feedback correct';
        score += 10;
        streak++;
        showCelebration();
        nextBtn.disabled = false;
    } else {
        feedbackEl.textContent = 'Not quite right. Check your fractions and colored sections!';
        feedbackEl.className = 'feedback wrong';
        streak = 0;
    }
    
    updateStats();
}

// Show celebration animation
function showCelebration() {
    celebrationEl.classList.remove('hidden');
    
    setTimeout(() => {
        celebrationEl.classList.add('hidden');
    }, 1500);
}

// Move to next question
function nextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
        loadQuestion(currentQuestion + 1);
    } else {
        // Game completed
        alert(`Congratulations! You completed all ${totalQuestions} questions with a score of ${score}!`);
        resetGame();
    }
}

// Move to previous question
function previousQuestion() {
    if (currentQuestion > 0) {
        loadQuestion(currentQuestion - 1);
    }
}

// Change difficulty
function changeDifficulty() {
    if (confirm('Changing difficulty will reset your progress. Continue?')) {
        resetGame();
    } else {
        // Reset to previous value
        difficultySelect.value = Object.keys(difficultySettings).find(
            key => JSON.stringify(difficultySettings[key]) === 
                  JSON.stringify(difficultySettings[difficultySelect.value])
        );
    }
}

// Reset game with new difficulty
function resetGame() {
    currentQuestion = 0;
    score = 0;
    streak = 0;
    generateQuestions();
    loadQuestion(0);
    updateStats();
}

// Update statistics display
function updateStats() {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
}

// Update progress bar
function updateProgressBar() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    progressFillEl.style.width = `${progress}%`;
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
