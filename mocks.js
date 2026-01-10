const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ"; // Use your full key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allQuestions = [];
let filteredQuestions = [];
let currentSection = 'All';
let currentIndex = 0;
let userAnswers = {}; 
let markedQuestions = {}; 
let timerInterval;
let timeLeft = 0;

async function initExam() {
    const savedMock = localStorage.getItem('selectedMock');
    if (!savedMock) { window.location.href = 'selection.html'; return; }

    const { data, error } = await supabaseClient
        .from('questions')
        .select('*')
        .eq('mock_name', savedMock);

    if (error || !data || data.length === 0) {
        alert("No questions found for this test.");
        window.location.href = 'selection.html';
        return;
    }

    allQuestions = data;
    
    // Timer Logic based on Mock Type
    if (savedMock.toLowerCase().includes("full")) {
        timeLeft = 60 * 60; 
        document.getElementById('subject-tabs').style.display = 'flex';
        switchSection('Maths'); 
    } else {
        timeLeft = 15 * 60; // Short mocks usually 15 mins
        document.getElementById('subject-tabs').style.display = 'none';
        filteredQuestions = allQuestions; 
        displayQuestion();
    }
    startTimer();
}

function switchSection(section) {
    currentSection = section;
    currentIndex = 0;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === section);
    });

    filteredQuestions = allQuestions.filter(q => q.subject === section);
    displayQuestion();
    togglePalette(false);
}

function displayQuestion() {
    const q = filteredQuestions[currentIndex];
    if (!q) return;

    document.getElementById('question-text').innerText = q.question_text;
    document.getElementById('current-q-num').innerText = currentIndex + 1;
    document.getElementById('q-subject-display').innerText = q.subject;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${userAnswers[q.id] === idx ? 'selected' : ''}`;
        btn.innerHTML = `<span class="opt-label">${labels[idx]}</span> ${opt}`;
        btn.onclick = () => {
            userAnswers[q.id] = idx;
            displayQuestion(); 
            updatePalette();
        };
        container.appendChild(btn);
    });

    document.getElementById('prev-btn').style.visibility = (currentIndex === 0) ? "hidden" : "visible";
    const nextBtn = document.getElementById('next-btn');
    nextBtn.innerText = (currentIndex === filteredQuestions.length - 1) ? "Review Map" : "Save & Next";
}

function nextQuestion() {
    if (currentIndex < filteredQuestions.length - 1) {
        currentIndex++;
        displayQuestion();
    } else {
        togglePalette(true);
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        displayQuestion();
    }
}

function markForReview() {
    const q = filteredQuestions[currentIndex];
    markedQuestions[q.id] = !markedQuestions[q.id]; 
    updatePalette();
    nextQuestion();
}

function togglePalette(show) {
    const modal = document.getElementById('palette-modal');
    modal.style.display = (show ?? modal.style.display !== 'flex') ? 'flex' : 'none';
    if (modal.style.display === 'flex') updatePalette();
}

function updatePalette() {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    filteredQuestions.forEach((q, idx) => {
        const dot = document.createElement('div');
        let status = '';
        if (markedQuestions[q.id]) status = 'marked';
        else if (userAnswers[q.id] !== undefined) status = 'answered';

        dot.className = `dot ${status}`;
        dot.innerText = idx + 1;
        dot.onclick = () => { currentIndex = idx; displayQuestion(); togglePalette(false); };
        grid.appendChild(dot);
    });
}

function startTimer() {
    timerInterval = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timer').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTest(true);
        }
        timeLeft--;
    }, 1000);
}

// --- REAL SSC LOGIC START ---
async function submitTest(force = false) {
    if (!force && !confirm("Khatam karna hai? Soch lo, Inspector Sahiba!")) return; 
    clearInterval(timerInterval);

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const reviewData = allQuestions.map(q => {
        const userChoiceIdx = userAnswers[q.id];
        const isSkipped = userChoiceIdx === undefined;
        const isCorrect = !isSkipped && userChoiceIdx === q.correct_idx;

        if (isSkipped) skippedCount++;
        else if (isCorrect) correctCount++;
        else wrongCount++;

        return {
            questionText: q.question_text,
            userChoice: isSkipped ? "Skipped" : q.options[userChoiceIdx],
            correctAnswer: q.options[q.correct_idx],
            explanation: q.explanation || "No explanation provided.",
            isCorrect: isCorrect,
            status: isSkipped ? 'skipped' : (isCorrect ? 'correct' : 'wrong')
        };
    });

    // SSC Marking: +2 for correct, -0.5 for wrong
    const finalScore = (correctCount * 2) - (wrongCount * 0.5);
    const totalPossible = allQuestions.length * 2;
    const accuracy = correctCount + wrongCount > 0 
        ? ((correctCount / (correctCount + wrongCount)) * 100).toFixed(2) 
        : 0;

    const resultSummary = {
        score: finalScore.toFixed(2),
        totalPossible: totalPossible,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy: accuracy,
        questions: reviewData
    };

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            await supabaseClient.from('mock_scores').insert([{
                user_id: user.id,
                score: finalScore,
                total: totalPossible,
                subject: localStorage.getItem('selectedMock'),
                correct_count: correctCount,
                wrong_count: wrongCount
            }]);
        }
        localStorage.setItem('lastQuizResult', JSON.stringify(resultSummary));
        localStorage.removeItem('selectedMock');
        window.location.href = "result.html";
    } catch (err) { 
        localStorage.setItem('lastQuizResult', JSON.stringify(resultSummary));
        window.location.href = "result.html"; 
    }
}
// --- REAL SSC LOGIC END ---

function exitTest() {
    if (confirm("Chhod kar ja rahi ho? SSC clear nahi hoga aise!")) {
        localStorage.removeItem('selectedMock');
        window.location.href = "dashboard.html";
    }
}

initExam();