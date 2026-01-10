const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadProfile() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const { data, error } = await supabaseClient
        .from('mock_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) { console.error(error); return; }

    renderHistory(data);
}

function renderHistory(scores) {
    const list = document.getElementById('history-list');
    const totalTestsEl = document.getElementById('total-tests');
    const avgScoreEl = document.getElementById('avg-score');

    if (!scores || scores.length === 0) {
        list.innerHTML = "<p>No history. Take a test to see stats! 🌸</p>";
        totalTestsEl.innerText = "0";
        avgScoreEl.innerText = "0%";
        return;
    }

    totalTestsEl.innerText = scores.length;
    
    let totalPercent = 0;
    list.innerHTML = '';

    scores.forEach(item => {
        // SSC Style Percentage: (Obtained Marks / Total Marks) * 100
        // Marks can be negative, so we handle that with Math.max(0, ...) if you want to avoid negative %
        const percent = Math.round((item.score / item.total) * 100);
        totalPercent += percent;

        const date = new Date(item.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short'
        });

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-info">
                <strong>${item.subject}</strong>
                <span>${date}</span>
            </div>
            <div class="history-score">
                <span class="score-text">${item.score}/${item.total}</span>
                <span class="percent-tag ${percent < 40 ? 'low' : ''}">${percent}%</span>
            </div>
        `;
        list.appendChild(card);
    });

    avgScoreEl.innerText = Math.round(totalPercent / scores.length) + "%";
}

async function clearHistory() {
    if (confirm("History delete karni hai? Saari mehnat mitti mein mil jayegi!")) {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) return;

            const { error } = await supabaseClient
                .from('mock_scores')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            alert("History Cleared! Fresh Start. 🌿");
            window.location.reload();
        } catch (err) { alert("Error: " + err.message); }
    }
}

loadProfile();