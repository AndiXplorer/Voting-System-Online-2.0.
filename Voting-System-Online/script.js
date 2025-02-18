//homepage

document.addEventListener('DOMContentLoaded', function () {
    if (getCookie('visited')) {
        Swal.fire({
            title: 'Mirësevini përsëri!',
            text: 'Jemi të lumtur që jeni rikthyer.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    } else {
        setCookie('visited', 'true', 365);
    }
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

function updateCountdown() {
    const electionDate = new Date().getTime();
    const now = new Date().getTime();
    const distance = electionDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    animateValue('days', days);
    animateValue('hours', hours);
    animateValue('minutes', minutes);
}

function animateValue(elementId, value) {
    const element = document.getElementById(elementId);
    const current = parseInt(element.textContent);
    if (current !== value) {
        element.style.transform = 'translateY(-20px)';
        element.style.opacity = '0';
        setTimeout(() => {
            element.textContent = String(value).padStart(2, '0');
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 300);
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();

const pollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.poll-bar');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    const percentage = bar.dataset.percentage;
                    const barFill = bar.querySelector('.bar');
                    barFill.style.setProperty('--percentage', `${percentage}%`);
                }, index * 200);
            });
        }
    });
}, { threshold: 0.5 });

pollObserver.observe(document.querySelector('.poll-chart'));

const loginBtn = document.querySelector('.vote-btn');
const loginModal = document.getElementById('loginModal');
const votingSystem = document.getElementById('votingSystem');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById("signupForm");
const registerBtn = document.getElementById("registerBtn")
const errorMessage = document.querySelector(".errorMessage");

function openSignup() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signinModal").style.display = "flex";
}

function openLogin() {
    document.getElementById("signinModal").style.display = "none";
    document.getElementById("loginModal").style.display = "flex";
}

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const leternjoftimi = signupForm.querySelector('input[type="number"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;

    if (!leternjoftimi || !password) {
        alert("Ju lutemi plotësoni të gjitha fushat.");
        return;
    }

    try {
        await validateLogin(leternjoftimi, password);

        const response = await axios.post("http://localhost:5000/register", {
            leternjoftimi,
            password,
        });

        if (response.data.success) {


            localStorage.setItem("token", response.data.token);
            localStorage.setItem("leternjoftimi", response.data.leternjoftimi);

            signinModal.style.display = 'none';
            votingSystem.classList.remove('hidden');
            initializeVotingSystem();
            scrollToVotingSystem();
        } else {
            alert("Gabim: " + response.data.message);
        }
    } catch (error) {
        if (error.response) {
            alert(`Gabim: ${error.response.data.message || "Nuk mund të lidhemi me serverin."}`);
        } else {
            alert("Gabim: Nuk mund të lidhemi me serverin.");
        }
    }
});




loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (getCookie('voted')) {
        Swal.fire({
            title: 'Nuk mund të votoni përsëri!',
            text: 'Ju keni votuar tashmë.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
    } else {
        loginModal.style.display = 'flex';
        setTimeout(() => {
            loginModal.querySelector('.modal-content').style.opacity = '1';
            loginModal.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
    }
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const leternjoftimi = loginForm.querySelector('input[type="number"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    if (validateLogin(leternjoftimi, password)) {
        try {
            const response = await axios.post("http://localhost:5000/login", {
                leternjoftimi,
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("leternjoftimi", response.data.leternjoftimi);

            loginModal.style.display = "none";
            votingSystem.classList.remove("hidden");
            initializeVotingSystem();
            scrollToVotingSystem();

        } catch (error) {
            errorMessage.style.display = "flex";
        }
    }
});


function validateLogin(personalNumber, password) {
    if (personalNumber.length < 6) {
        alert('Numri personal duhet të ketë së paku 6 karaktere!');
        return false;
    }

    if (password.length < 6) {
        alert('Fjalëkalimi duhet të ketë së paku 6 karaktere!');
        return false;
    }
    return true;
}

function scrollToVotingSystem() {
    votingSystem.scrollIntoView({ behavior: 'smooth' });
}

const parties = [
    { id: 1, name: 'Vetëvendosje', deputies: generateDeputies(110, 'Vetëvendosje') },
    { id: 2, name: 'LDK', deputies: generateDeputies(110, 'LDK') },
    { id: 3, name: 'PDK', deputies: generateDeputies(110, 'PDK') },
    { id: 4, name: 'AAK', deputies: generateDeputies(110, 'AAK') }
];

function generateDeputies(count, party) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Deputeti ${i + 1}`,
        party: party
    }));
}

function initializeVotingSystem() {
    const partyList = document.querySelector('.party-list');

    partyList.innerHTML = parties.map((party, index) => `
        <div class="party-option" data-party-id="${party.id}" style="animation: fadeInUp ${0.3 + index * 0.1}s ease forwards">
            <h3>${party.name}</h3>
            <button onclick="showDeputies(${party.id})">Zgjedh Deputetët</button>
        </div>
    `).join('');
}

let selectedDeputies = [];

function showDeputies(partyId) {
    const party = parties.find(p => p.id === partyId);
    const deputyList = document.querySelector('.deputy-list');
    document.querySelector('.party-list').classList.add('hidden');
    deputyList.classList.remove('hidden');

    deputyList.innerHTML = `
        <h3>Zgjedh deputetët e partisë ${party.name}</h3>
        <p>Zgjedh deri në 10 deputetë</p>
        <div class="deputy-grid">
            ${party.deputies.map((deputy, index) => `
                <div class="deputy-option" data-deputy-id="${deputy.id}" 
                     style="animation: fadeInUp ${0.2 + index * 0.02}s ease forwards">
                    <input type="checkbox" id="deputy${deputy.id}" 
                           onchange="handleDeputySelection(this, ${deputy.id})" 
                           ${selectedDeputies.includes(deputy.id) ? 'checked' : ''}>
                    <label for="deputy${deputy.id}">${deputy.name}</label>
                </div>
            `).join('')}
        </div>
        <div class="button-group" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
            <button onclick="submitVote()" class="submit-btn">Përfundo Votimin</button>
            <button onclick="backToParties()" class="back-btn">Kthehu</button>
        </div>
    `;
}

function handleDeputySelection(checkbox, deputyId) {
    if (checkbox.checked) {
        if (selectedDeputies.length >= 10) {
            alert('Nuk mund të zgjedhni më shumë se 10 deputetë!');
            checkbox.checked = false;
            return;
        }
        selectedDeputies.push(deputyId);
        checkbox.parentElement.classList.add('selected');
    } else {
        selectedDeputies = selectedDeputies.filter(id => id !== deputyId);
        checkbox.parentElement.classList.remove('selected');
    }
    updateSelectionCounter();
}

function updateSelectionCounter() {
    const counter = document.createElement('div');
    counter.className = 'selection-counter';
    counter.textContent = `${selectedDeputies.length}/10 deputetë të zgjedhur`;
    const existingCounter = document.querySelector('.selection-counter');
    if (existingCounter) {
        existingCounter.replaceWith(counter);
    } else {
        document.querySelector('.deputy-list h3').after(counter);
    }
}

function backToParties() {
    document.querySelector('.deputy-list').classList.add('hidden');
    document.querySelector('.party-list').classList.remove('hidden');
}

async function submitVote() {
    if (selectedDeputies.length === 0) {
        alert('Ju lutem zgjedhni së paku një deputet!');
        return;
    }

    const leternjoftimi = localStorage.getItem("leternjoftimi");

    try {
        const response = await axios.post("http://localhost:5000/vote", {
            leternjoftimi,
        });


        if (response.status === 200) {
            votingSystem.innerHTML = `
                <div class="success-message" style="text-align: center; animation: fadeInUp 0.5s ease">
                    <h2>Faleminderit për votimin tuaj!</h2>
                    <p>Votimi juaj u regjistrua me sukses në sistemin tonë.</p>
                    <div class="checkmark">✓</div>
                </div>
            `;
        }
    } catch (error) {
        alert(error.response?.data?.message || "❌ Ndodhi një gabim!");
    }
}

window.onclick = (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
};

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}



