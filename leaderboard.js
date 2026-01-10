const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ"; // Use your existing key

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadLeaderboard() {
    const listElement = document.getElementById('leaderboard-list');

    try {
        // Step 1: Fetch top 10 scores independently
        const { data: scores, error: scoreErr } = await supabaseClient
            .from('mock_scores')
            .select('score, total, subject, user_id')
            .order('score', { ascending: false })
            .limit(10);

        if (scoreErr) throw scoreErr;

        if (!scores || scores.length === 0) {
            listElement.innerHTML = "<p>No scores found. Be the first to top!</p>";
            return;
        }

        // Step 2: Fetch all usernames from profiles table to match them
        const { data: profiles, error: profileErr } = await supabaseClient
            .from('profiles')
            .select('id, username');

        if (profileErr) throw profileErr;

        // Step 3: Create a quick lookup map (ID -> Username)
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.id] = p.username;
        });

        // Step 4: Map scores with usernames manually
        listElement.innerHTML = scores.map((entry, index) => {
            let rankLabel = index + 1;
            if (index === 0) rankLabel = "🥇";
            if (index === 1) rankLabel = "🥈";
            if (index === 2) rankLabel = "🥉";

            // Agar profile table mein name nahi mila toh 'Unknown Warrior' dikhayenge
            const displayName = profileMap[entry.user_id] || 'Unknown Warrior';

            return `
                <div class="news-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 15px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 1.2rem;">${rankLabel}</span>
                        <div>
                            <div style="font-weight: 700; color: #ffafbd;">${displayName}</div>
                            <div style="font-size: 0.75rem; color: #888;">${entry.subject}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: #a8d5a2;">${entry.score}/${entry.total}</div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Leaderboard Sync Error:", error);
        listElement.innerHTML = `<p style="color: #ff8fa3;">Sync Error: ${error.message}</p>`;
    }
}

// Start the engine!
loadLeaderboard();