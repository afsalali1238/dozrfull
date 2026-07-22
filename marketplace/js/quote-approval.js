/* Shared quote approval link behavior.
   Note: deliberately does NOT read/display a "vendor" param - Dozr manages
   vendor relationships and never surfaces vendor identity to clients (see
   CLAUDE.md / ops SUPABASE_PLAN.md). The heading always reads "Your Dozr
   quote", regardless of what a URL might carry. */
const approvalParams = new URLSearchParams(window.location.search);
const quoteRef = approvalParams.get("quote") || approvalParams.get("ref") || "DOZR-Q-1042";
const quotedUnit = approvalParams.get("unit") || "CAT 320";
const quotePrice = approvalParams.get("price") || "AED 18,400";
const quoteDate = approvalParams.get("date") || "12 Aug 2026";
const quoteDuration = approvalParams.get("duration") || "2 weeks";
const quoteLocation = approvalParams.get("location") || "Al Quoz Industrial 3";

const quotedEquipment = typeof getEquipmentByName === "function" ? getEquipmentByName(quotedUnit) : undefined;
const equipmentLabel = quotedEquipment
  ? `${quotedUnit} - ${quotedEquipment.weightTonnes ? `${quotedEquipment.weightTonnes} tonne ` : ""}${quotedEquipment.categoryLabel.toLowerCase()}`
  : `${quotedUnit} - verified equipment`;
const photoUrl = quotedEquipment ? `assets/equipment/${quotedEquipment.id}-hero.jpg` : "assets/equipment/cat-320-hero.jpg";

document.getElementById("equipmentLabel").textContent = equipmentLabel;
document.getElementById("quoteHeading").textContent = "Your Dozr quote";
document.getElementById("quotePrice").textContent = quotePrice;
document.getElementById("quoteDate").textContent = quoteDate;
document.getElementById("quoteDuration").textContent = quoteDuration;
document.getElementById("quoteLocation").textContent = quoteLocation;
document.getElementById("approvalPhoto").style.backgroundImage = `url('${photoUrl}')`;
document.getElementById("approvalPhoto").setAttribute("aria-label", `${quotedUnit} quoted for ${quoteLocation}`);
document.getElementById("approvalPhoto").setAttribute("data-cap", `${quotedUnit} quote`);
document.getElementById("askQuestion").href = DozrWhatsApp.askAQuestion(`Quote ${quoteRef} for ${quotedUnit}`);

document.getElementById("approveQuote").addEventListener("click", () => {
  window.open(DozrWhatsApp.approveQuote(quoteRef), "_blank", "noopener,noreferrer");
  window.setTimeout(() => {
    document.getElementById("approval-body").innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 0 10px"><span style="width:54px;height:54px;border-radius:var(--radius-pill);background:var(--green);color:var(--surface);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">✓</span><h1 style="font-size:22px;margin-bottom:8px">Approved - PO sent to vendor</h1><p class="text-muted" style="font-size:14px;line-height:1.6;margin:0 0 18px">Dozr has recorded your approval for quote ${quoteRef}. The vendor receives the PO and dispatch details on WhatsApp.</p><a class="btn btn-secondary btn-full" href="tracking.html?job=${encodeURIComponent(quoteRef)}&unit=${encodeURIComponent(quotedUnit)}">Open tracking link</a></div>`;
  }, 150);
});
