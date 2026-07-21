/* =================================================================
   Client-side mock session for the client "Sign in" / "Sign up" flow.
   NO real backend or auth check - localStorage only, matches the
   no-backend pattern already used everywhere else in this repo (see
   js/whatsapp.js). Swap for real Supabase Auth later without touching
   page markup: only this file and login.html/signup.html's submit
   handlers need to change.
   ================================================================= */

const DOZR_SESSION_KEY = "dozr_client_session";

function dozrSaveSession(name, email) {
  localStorage.setItem(DOZR_SESSION_KEY, JSON.stringify({ name: name, email: email }));
}

function dozrGetSession() {
  try {
    const raw = localStorage.getItem(DOZR_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function dozrClearSession() {
  localStorage.removeItem(DOZR_SESSION_KEY);
}

function dozrRenderAuthNav() {
  const slot = document.querySelector("[data-client-auth]");
  if (!slot) return;
  const session = dozrGetSession();
  if (!session) return; // leave the default "Sign in" markup in place

  slot.innerHTML = "";
  const nameSpan = document.createElement("span");
  nameSpan.className = "nav-account";
  nameSpan.textContent = "Hi, " + session.name.split(" ")[0];

  const signOut = document.createElement("button");
  signOut.type = "button";
  signOut.className = "nav-signout";
  signOut.textContent = "Sign out";
  signOut.addEventListener("click", function () {
    dozrClearSession();
    window.location.href = "index.html";
  });

  slot.appendChild(nameSpan);
  slot.appendChild(signOut);
}

document.addEventListener("DOMContentLoaded", dozrRenderAuthNav);
