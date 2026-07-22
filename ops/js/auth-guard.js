// Dozr Ops — auth guard. Include after supabase-client.js on every ops
// page except login.html. Redirects to login.html if no staff session
// exists; otherwise reveals the page (body starts hidden via CSS to avoid
// a flash of protected content before the check resolves).
//
// Enforcement temporarily disabled (2026-07-22, afzl's call - "sign in not
// needed for now"). Every page just reveals itself immediately. Re-enable
// by restoring the getSession() check below (also flip login.html's submit
// handler back to the real auth.signInWithPassword call, already there
// commented out).

(async function () {
  document.documentElement.classList.add("auth-ready");

  var signoutBtn = document.getElementById("signout-btn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", async function () {
      await supabaseClient.auth.signOut();
      window.location.href = "login.html";
    });
  }

  return; // enforcement disabled - see header comment. Real check below, unused for now:
  var session = (await supabaseClient.auth.getSession()).data.session;
  if (!session) {
    window.location.href = "login.html";
  }
})();
