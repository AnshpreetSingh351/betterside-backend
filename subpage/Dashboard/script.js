if (!localStorage.getItem("userName")) {
    window.location.href = "/";
}
// --- Navigation Logic ---
function showSection(sectionId) {
    // 1. Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active-section'));

    // 2. Show the selected section
    document.getElementById(sectionId).classList.add('active-section');

    // 3. Update Sidebar Active State
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    document.getElementById('nav-' + sectionId).classList.add('active');
}

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');

// Check Local Storage on Load
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Toggle Event
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
});

document.getElementById("logoutBtn").addEventListener("click", function(e) {
    e.preventDefault();

    // remove saved user data
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userProfileImage");

    // optional: clear everything
    // localStorage.clear();

    // redirect to login page
window.location.href = "/index.html";
});