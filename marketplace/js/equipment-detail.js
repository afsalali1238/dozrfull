/* Equipment detail rendering and quote link updates. */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const unit = requestedId ? getEquipmentById(requestedId) : (getEquipmentById("cat-320") || window.DOZR_EQUIPMENT[0]);
  const main = document.getElementById("detail-main");
  const rail = document.getElementById("quote-rail");
  if (!unit) {
    renderNotFound(requestedId, main, rail);
    return;
  }

  const weight = unit.weightTonnes ? `${unit.weightTonnes} tonne` : "verified";
  const specs = Object.entries(unit.specs || {}).map(([key, value]) => `<div class="spec-cell"><span>${key}</span><strong>${value}</strong></div>`).join("");

  main.innerHTML = `
    <div class="card-kicker">${unit.categoryLabel} - ${weight}</div>
    <h1 style="font-size:34px;margin-bottom:18px">${unit.name}</h1>
    <div class="photo detail-hero" style="background-image: url('assets/equipment/${unit.id}-hero.jpg');" role="img" aria-label="${unit.name} ${unit.categoryLabel} in-situ, Al Quoz" data-cap="${unit.name} - Al Quoz">${unit.verified ? '<span class="verified-badge">Verified supplier</span>' : ''}</div>
    <div class="thumb-row"><div class="photo" style="background-image: url('assets/equipment/${unit.id}-thumb-1.jpg');" aria-hidden="true" data-cap=""></div><div class="photo" style="background-image: url('assets/equipment/${unit.id}-thumb-2.jpg');" aria-hidden="true" data-cap=""></div><div class="photo" style="background-image: url('assets/equipment/${unit.id}-thumb-3.jpg');" aria-hidden="true" data-cap=""></div><div class="photo" style="background-image: url('assets/equipment/${unit.id}-thumb-4.jpg');" aria-hidden="true" data-cap=""></div></div>
    <div class="eyebrow" style="margin:32px 0 14px">Specs</div>
    <div class="spec-table">${specs}</div>
    <p class="text-muted" style="font-size:15px;line-height:1.7;margin:24px 0 0">${unit.description || 'Verified unit available through Dozr vendors. Share your dates and site location to receive a fixed vendor quote over WhatsApp.'}</p>`;

  rail.innerHTML = `
    <form class="quote-rail" id="quote-form">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px"><h2 style="font-size:21px">Request a quote</h2><span class="chip" aria-label="Availability">Same-day</span></div>
      <p class="text-muted" style="font-size:13px;line-height:1.5;margin:0 0 20px">Share your dates and site - the vendor sends a fixed price back, usually within the hour. No obligation.</p>
      <div class="form-stack">
        <div><label class="field-label" for="rentalStart">Rental start</label><input class="input-control" id="rentalStart" type="date" value="2026-08-12" required></div>
        <div><label class="field-label" for="rentalDuration">Duration</label><select class="input-control" id="rentalDuration" required><option value="1 week">1 week</option><option value="2 weeks" selected>2 weeks</option><option value="1 month">1 month</option><option value="Custom">Custom</option></select></div>
        <div><label class="field-label" for="deliverTo">Deliver to</label><input class="input-control" id="deliverTo" type="text" value="Al Quoz Industrial 3" required></div>
      </div>
      <button type="submit" id="requestQuote" class="btn btn-primary btn-full" style="margin-top:20px;margin-bottom:10px;text-decoration:none">Request Quote</button>
      <div style="text-align:center" class="stat-label">No payment required to request</div>
      <div class="text-muted" style="display:flex;align-items:center;gap:8px;font-size:13px;margin-top:12px"><span style="width:8px;height:8px;border-radius:var(--radius-pill);background:var(--green)"></span>Verified supplier - replies in ~40 min</div>
    </form>`;

  const start = document.getElementById("rentalStart");
  const duration = document.getElementById("rentalDuration");
  const deliverTo = document.getElementById("deliverTo");
  const form = document.getElementById("quote-form");
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dates = `${start.value || 'Start date TBD'} / ${duration.value}`;
    const url = DozrWhatsApp.requestQuote(unit.name, dates, deliverTo.value || 'Site location TBD');
    window.location.href = url;
  });

  function renderNotFound(id, mainTarget, railTarget) {
    document.title = "Equipment not found - Dozr";
    mainTarget.innerHTML = `<div class="not-found-panel"><div class="eyebrow" style="margin-bottom:10px">Equipment link expired</div><h1 style="font-size:34px;margin-bottom:12px">We could not find that unit.</h1><p class="text-muted" style="font-size:16px;line-height:1.6;margin:0 0 20px">The equipment link${id ? ` for <strong>${id}</strong>` : ""} may be stale, mistyped, or no longer available. Browse current inventory or ask Dozr to source an equivalent unit.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="browse.html">Browse equipment</a><a class="btn btn-secondary" href="${DozrWhatsApp.askAQuestion(`Replacement for equipment link ${id || "unknown"}`)}">Ask Dozr</a></div></div>`;
    railTarget.innerHTML = `<aside class="quote-rail"><h2 style="font-size:21px;margin-bottom:8px">Need a replacement?</h2><p class="text-muted" style="font-size:14px;line-height:1.6;margin:0 0 16px">Send the stale link to Dozr and we will match the closest available machine.</p><a class="btn btn-primary btn-full" href="${DozrWhatsApp.askAQuestion(`Replacement for equipment link ${id || "unknown"}`)}">Message Dozr</a></aside>`;
  }
});
