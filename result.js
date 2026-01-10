document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage se naya data fetch karein
    const quizData = JSON.parse(localStorage.getItem('lastQuizResult'));

    if (!quizData) {
        window.location.href = 'dashboard.html';
        return;
    }

    // 1. Set Scores & Stats
    // Score display (Marks / Total Marks)
    document.getElementById('final-score').innerText = `${quizData.score}/${quizData.totalPossible}`;
    
    // Exact counts (Correct, Wrong, Skipped)
    document.getElementById('correct-count').innerText = quizData.correct;
    document.getElementById('wrong-count').innerText = quizData.wrong;
    
    // Accuracy (Jo mocks.js se calculate hoke aayi hai)
    const accuracy = quizData.accuracy || 0;
    document.getElementById('accuracy-percent').innerText = `${accuracy}% Accuracy`;

    // 2. Render Review List
    const reviewList = document.getElementById('review-list');
    
    // Clear purana list agar kuch hai toh
    reviewList.innerHTML = quizData.questions.map((q, index) => {
        // SSC Style Color Coding
        let statusClass = '';
        if (q.status === 'correct') statusClass = 'is-correct';
        else if (q.status === 'wrong') statusClass = 'is-wrong';
        else statusClass = 'is-skipped';

        return `
            <div class="review-card ${statusClass}">
                <p><strong>Q${index + 1}:</strong> ${q.questionText}</p>
                <div class="answer-box">
                    <div class="user-ans">Your Answer: <span class="ans-text">${q.userChoice}</span></div>
                    <div class="correct-ans">Correct Answer: <span class="ans-text">${q.correctAnswer}</span></div>
                </div>
                ${q.explanation ? `<div class="explanation">💡 <b>Explanation:</b> ${q.explanation}</div>` : ''}
            </div>
        `;
    }).join('');
});