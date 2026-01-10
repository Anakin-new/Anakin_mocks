const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allNotes = []; // This stores everything from the database

async function fetchNotes() {
    const { data, error } = await supabaseClient
        .from('notes')
        .select('*');

    if (error) {
        console.error("Error fetching notes:", error);
        return;
    }

    allNotes = data;
    displayNotes(allNotes); // Initially show everything
}

function displayNotes(notesList) {
    const grid = document.getElementById('notes-grid');
    grid.innerHTML = '';

    if (notesList.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; margin-top: 20px;">No materials found here yet... 🌿</p>`;
        return;
    }

    notesList.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        let icon = '📄'; 
        if(note.type === 'video') icon = '🎥';
        if(note.type === 'image') icon = '🖼️';
        
        card.innerHTML = `
            <div class="note-icon">${icon}</div>
            <div class="note-info">
                <h3>${note.title}</h3>
                <p>${note.subject}</p>
            </div>
            <button onclick="openFile('${note.file_url}', '${note.type}', '${note.title.replace(/'/g, "\\'")}')">Open</button>
        `;
        grid.appendChild(card);
    });
}

function filterNotes(type) {
    // 1. Update the UI buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Remove active class from all
        btn.classList.remove('active');
        // Add active class if it matches the clicked type
        if (btn.innerText.toLowerCase().includes(type) || (type === 'all' && btn.innerText === 'All')) {
            btn.classList.add('active');
        }
    });

    // 2. Filter the logic
    if (type === 'all') {
        displayNotes(allNotes);
    } else {
        // We filter 'allNotes' based on the 'type' column in your Supabase table
        const filtered = allNotes.filter(n => n.type.toLowerCase() === type.toLowerCase());
        displayNotes(filtered);
    }
}

// --- Video Player Logic ---
function openFile(url, type, title) {
    if (type === 'video') {
        const videoId = extractVideoID(url);
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            document.getElementById('youtube-player').src = embedUrl;
            document.getElementById('modal-title').innerText = title;
            document.getElementById('video-modal').style.display = 'flex';
        } else {
            alert("Invalid YouTube Link");
        }
    } else {
        window.open(url, '_blank');
    }
}

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function closeVideo() {
    document.getElementById('video-modal').style.display = 'none';
    document.getElementById('youtube-player').src = ''; 
}

// Start the garden!
fetchNotes();