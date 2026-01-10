let currentStep = 'mode'; // mode, subjects, chapters, mocks
let selectedSubject = '';
let selectedTopic = '';

function showFullMocks() {
    currentStep = 'mocks';
    document.getElementById('view-title').innerText = "Full Length Mocks";
    // Change these to match your Database exactly
    renderGrid(['SSC CGL Full Mock 1', 'SSC Full Mock 2', 'SSC Full Mock 3'], 'startMock');
}

function showSubjects() {
    currentStep = 'subjects';
    document.getElementById('view-title').innerText = "Select Subject";
    renderGrid(['Maths', 'GS', 'English', 'Reasoning'], 'selectSubject');
}

function selectSubject(subj) {
    selectedSubject = subj;
    currentStep = 'chapters';
    document.getElementById('view-title').innerText = subj + " Chapters";
    
    // In a real app, you'd fetch these from Supabase. For now:
    const chapters = {
        'Maths': ['Percentage', 'Profit & Loss', 'Algebra', 'Trigonometry'],
        'GS': ['Ancient History', 'Polity', 'Biology', 'Current Affairs']
    };
    renderGrid(chapters[subj] || ['Generic Chapter'], 'selectTopic');
}

function selectTopic(topic) {
    selectedTopic = topic;
    currentStep = 'topicMocks';
    document.getElementById('view-title').innerText = topic + " Mocks";
    renderGrid([topic + ' Mock 1', topic + ' Mock 2'], 'startMock');
}

function renderGrid(items, onClickFunctionName) {
    document.getElementById('mode-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
    
    const grid = document.getElementById('item-grid');
    grid.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.innerText = item;
        div.onclick = () => window[onClickFunctionName](item);
        grid.appendChild(div);
    });
}

function startMock(mockName) {
    // Save the selection to localStorage so mocks.html knows what to load
    localStorage.setItem('selectedMock', mockName);
    window.location.href = 'mocks.html';
}

function goBack() {
    window.location.reload(); // Simplest way to reset the view
}