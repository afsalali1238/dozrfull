/* Shared tracking link behavior. */
const trackingParams = new URLSearchParams(window.location.search);
const jobRef = trackingParams.get("job") || "DOZR-J-1042";
const unitName = trackingParams.get("unit") || "CAT 320";
document.getElementById("jobRefLabel").textContent = `Your delivery - ${jobRef}`;
document.getElementById("trackingTitle").textContent = `${unitName} - en route`;
document.getElementById("mapUnit").textContent = unitName;
document.getElementById("mapPanel").setAttribute("aria-label", `Live GPS map showing ${unitName} en route to Al Quoz`);

document.getElementById("shareButton").addEventListener("click", async () => {
  try {
    if (navigator.share) {
      await navigator.share({ title: `Dozr delivery tracking ${jobRef}`, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    const btn = document.getElementById("shareButton");
    const originalText = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  } catch (err) {
    if (err.name !== "AbortError") console.warn("Share failed:", err);
  }
});
