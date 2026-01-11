const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getRankTitle(xp) {
    if (xp >= 6001) return "Field Marshal 👑";
    if (xp >= 3001) return "Major General 🦅";
    if (xp >= 1501) return "Lieutenant ⚔️";
    if (xp >= 501)  return "Sergeant 🎖️";
    return "Private (Recruit) 🪖";
}

async function loadLeaderboard() {
    const listElement = document.getElementById('leaderboard-list');
    if (!listElement) return;

    try {
        const { data: users, error: profileErr } = await supabaseClient
            .from('profiles')
            .select('id, username, xp')
            .order('xp', { ascending: false })
            .limit(20);

        if (profileErr) throw profileErr;

        const userIds = users.map(u => u.id);
        const { data: allScores } = await supabaseClient
            .from('mock_scores')
            .select('user_id, score, total')
            .in('user_id', userIds);

        const bestScoreMap = {};
        if (allScores) {
            allScores.forEach(s => {
                if (!bestScoreMap[s.user_id] || s.score > bestScoreMap[s.user_id].score) {
                    bestScoreMap[s.user_id] = { score: s.score, total: s.total };
                }
            });
        }

        listElement.innerHTML = users.map((user, index) => {
            let rankLabel = index + 1;
            let rankClass = "";
            
            // --- ANAKIN ADMIN CHECK ---
            const isAdmin = user.username && user.username.toLowerCase() === "anakin";
            const adminClass = isAdmin ? "admin-card" : "";
            const adminBadge = isAdmin ? '<span class="admin-badge">Admin</span>' : "";

            if (index === 0) { rankLabel = "🥇"; rankClass = "rank-1"; }
            else if (index === 1) { rankLabel = "🥈"; rankClass = "rank-2"; }
            else if (index === 2) { rankLabel = "🥉"; rankClass = "rank-3"; }

            const title = getRankTitle(user.xp || 0);
            const best = bestScoreMap[user.id] || { score: 0, total: 0 };

            return `
                <div class="topper-card ${rankClass} ${adminClass}">
                    <div class="card-main">
                        <div class="rank-side">
                            <span class="rank-num">${rankLabel}</span>
                        </div>
                        <div class="user-info">
                            <div class="topper-name">
                                ${user.username || 'Soldier'} ${adminBadge}
                            </div>
                            <div class="topper-title">${title}</div>
                        </div>
                        <div class="xp-side">
                            <div class="xp-value">${user.xp || 0}</div>
                            <div class="xp-label">XP (RANK POINTS)</div>
                        </div>
                    </div>
                    <div class="best-score-badge">
                        <span>Best Mission Record</span>
                        <span class="best-score-val">🎯 ${best.score}/${best.total}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Leaderboard Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);