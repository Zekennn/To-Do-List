async function hashPassword(password){
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const loginMsg = document.getElementById("loginMsg");

    if(!username || !password){ loginMsg.textContent="Enter username & password"; return; }

    const users = JSON.parse(localStorage.getItem("users")||"{}");
    const hashed = await hashPassword(password);

    if(users[username] && users[username] === hashed){
        localStorage.setItem("currentUser", username);
        window.location.href="todo.html";
    } else { loginMsg.textContent="Invalid username or password"; }
});

signupBtn.addEventListener("click", async () => {
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const signupMsg = document.getElementById("signupMsg");

    if(!username || !password){ signupMsg.textContent="Enter username & password"; return; }

    const users = JSON.parse(localStorage.getItem("users")||"{}");

    if(users[username]){ signupMsg.textContent="Username already exists"; return; }

    const hashed = await hashPassword(password);
    users[username] = hashed;
    localStorage.setItem("users", JSON.stringify(users));
    signupMsg.style.color = "green";
    signupMsg.textContent="Sign up successful! You can now login.";
});
