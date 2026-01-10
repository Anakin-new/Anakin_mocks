const SUPABASE_URL = "https://eewezmljxaqbjcuzzwmq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2V6bWxqeGFxYmpjdXp6d21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDE4NDksImV4cCI6MjA4MzQxNzg0OX0.qIqB5A5qiCxmq1SHPhlm1QGn1objoPvywf0JYFCebtQ"; // Use your full key here
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isLoginMode = true; // By default login mode

function toggleForm() {
    isLoginMode = !isLoginMode; // Mode switch karo
    
    const title = document.getElementById('form-title');
    const subtitle = document.getElementById('form-subtitle');
    const mainBtn = document.getElementById('main-btn');
    const toggleMsg = document.getElementById('toggle-msg');
    const toggleLink = document.getElementById('toggle-link');

    if (isLoginMode) {
        title.innerText = "Welcome 🌸";
        subtitle.innerText = "Your garden is waiting for you.";
        mainBtn.innerText = "Login";
        toggleMsg.innerText = "Don't have an account?";
        toggleLink.innerText = "Sign up";
    } else {
        title.innerText = "Join Us ✨";
        subtitle.innerText = "Start your journey today.";
        mainBtn.innerText = "Create Account";
        toggleMsg.innerText = "Already have an account?";
        toggleLink.innerText = "Login";
    }
}

// Ye function decide karega kaunsa action lena hai
async function handleSubmit() {
    if (isLoginMode) {
        await handleLogin();
    } else {
        await handleSignUp();
    }
}

async function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if(!user || !pass) return alert("Fill all fields!");

    const fakeEmail = `${user}@sscapp.com`;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: fakeEmail,
        password: pass,
    });

    if (error) alert(error.message);
    else window.location.href = "dashboard.html";
}

async function handleSignUp() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    
    if(!user || pass.length < 6) return alert("Username required and Password must be 6+ chars");

    const fakeEmail = `${user}@sscapp.com`; 
    const { data, error } = await supabaseClient.auth.signUp({
        email: fakeEmail,
        password: pass,
    });

    if (error) alert(error.message);
    else {
        alert("Account created! Now you can login.");
        toggleForm(); // Account banne ke baad wapas login mode par le jao
    }
}