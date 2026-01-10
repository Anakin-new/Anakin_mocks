const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ"; // Use your existing key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function initDashboard() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    // --- New Profile Logic Starts ---
    try {
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

        let finalName = "";
        if (profile && profile.username) {
            // Agar profile table mein name mil gaya
            finalName = profile.username;
        } else {
            // Fallback: Agar profile nahi mila toh email use karein
            const rawUsername = user.email.split('@')[0];
            finalName = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
        }
        
        document.getElementById('username-display').innerText = finalName;
    } catch (err) {
        console.error("Profile fetch error:", err);
    }
    // --- New Profile Logic Ends ---

    showLatestScore(user.id);
    loadSSCNews();
    displayRandomQuote();
}

async function showLatestScore(userId) {
    const { data, error } = await supabaseClient
        .from('mock_scores')
        .select('score, total, subject')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        document.getElementById('last-mock-name').innerText = "Sync Error.";
        return;
    }

    const scoreEl = document.getElementById('last-score');
    const nameEl = document.getElementById('last-mock-name');

    if (data && data.length > 0) {
        const lastTest = data[0];
        scoreEl.innerText = `${lastTest.score}/${lastTest.total}`;
        nameEl.innerText = `Last attempt: ${lastTest.subject}`;
    } else {
        scoreEl.innerText = "0/0";
        nameEl.innerText = "Take your first mock to see progress!";
    }
}

async function loadSSCNews() {
    const newsBox = document.getElementById('ssc-news');
    try {
        const { data, error } = await supabaseClient
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return;

        if (data && data.length > 0) {
            newsBox.innerHTML = data.map(item => `
                <p class="news-item">📌 ${item.content}</p>
            `).join('');
        } else {
            newsBox.innerHTML = '<p class="news-item">No new updates today.</p>';
        }
    } catch (err) { console.error(err); }
}

function displayRandomQuote() {
    const quotes = [
        "SSC ka syllabus aur tumhari speed mein wahi rishta hai jo 'Acche Din' aur middle class mein hai—aane wale hain, par kab?",
        "Percentage ke sawal hal nahi ho rahe? Koi baat nahi, Inspector banne ke baad hisab-kitab toh peon hi karega.",
        "Ek question par 5 minute? Itne mein toh SSC ka vendor badal jata hai. Speed badhao! 😓",
        "Padhai kar lo, warna agle saal phir se 'Form' bharna padega."
    ];
    const quoteElement = document.getElementById('daily-quote');
    if(quoteElement) {
        quoteElement.innerText = quotes[Math.floor(Math.random() * quotes.length)];
    }
}

function toggleMenu() {
    const sideDrawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('overlay');
    const currentLeft = window.getComputedStyle(sideDrawer).left;

    if (currentLeft === '0px') {
        sideDrawer.style.left = '-280px';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    } else {
        overlay.style.display = 'block';
        setTimeout(() => {
            sideDrawer.style.left = '0px';
            overlay.style.opacity = '1';
        }, 10);
    }
}

async function handleLogout() {
    if(confirm("Tayyari chhod kar ja rahe ho? Exit?")) {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    }
}

initDashboard();