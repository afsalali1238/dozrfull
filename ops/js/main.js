(function () {
  "use strict";

  var DATA = window.DOZR_OPS;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === "text") { node.textContent = attrs[key]; }
      else { node.setAttribute(key, attrs[key]); }
    });
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  function stageTone(stage, total) {
    if (stage >= total - 1) return "ok";
    if (stage <= 1) return "neutral";
    return "warn";
  }

  /* ---------------- Tabs ---------------- */
  function bindTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    if (tabs.length === 0) return;

    function selectTab(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.setAttribute("tabindex", selected ? "0" : "-1");
      });
      document.querySelectorAll(".tabpanel").forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
    }

    tabs.forEach(function (tab, index) {
      // Roving tabindex: only the selected tab is in the natural tab order.
      tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1");

      tab.addEventListener("click", function () { selectTab(tab); });

      tab.addEventListener("keydown", function (e) {
        var targetIndex = null;
        if (e.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
        else if (e.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") targetIndex = 0;
        else if (e.key === "End") targetIndex = tabs.length - 1;
        if (targetIndex === null) return;
        e.preventDefault();
        var next = tabs[targetIndex];
        selectTab(next);
        next.focus();
      });
    });
  }

  /* ---------------- Overview ---------------- */
  function renderOverview() {
    var summaryEl = document.getElementById("overview-summary");
    DATA.overview.summary.forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });

    var escList = document.getElementById("escalations-list");
    if (DATA.overview.escalations.length === 0) {
      escList.appendChild(el("div", { class: "empty-state", text: "No open escalations." }));
    }
    DATA.overview.escalations.forEach(function (e) {
      var tone = e.level === "L2" ? "warn" : "neutral";
      var row = el("div", { class: "panel-header" }, [
        el("div", {}, [
          el("span", { class: "status-chip", "data-tone": tone, text: e.level }),
          el("span", { class: "mono", text: " " + e.job + " " }),
          el("span", { text: e.issue })
        ]),
        el("div", { class: "note", text: e.owner + " · " + e.time })
      ]);
      escList.appendChild(row);
    });

    var checklist = document.getElementById("daily-checklist");
    DATA.overview.dailyChecklist.forEach(function (item) {
      var li = el("li", {});
      var label = el("label", { style: "display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;" });
      var box = el("input", { type: "checkbox" });
      if (item.done) box.setAttribute("checked", "checked");
      box.disabled = true;
      label.appendChild(box);
      label.appendChild(document.createTextNode(item.task));
      li.appendChild(label);
      checklist.appendChild(li);
    });
  }

  /* ---------------- Vendors ---------------- */
  function renderVendors() {
    var tbody = document.getElementById("vendors-tbody");
    DATA.vendors.forEach(function (v) {
      var tone = !v.active ? (v.plan === "Pending" ? "neutral" : "error") : (v.docsExpiring ? "warn" : "ok");
      var statusLabel = v.plan === "Pending" ? "Pending approval" : (v.active ? "Active" : "Deactivated");
      var row = el("tr", {}, [
        el("td", { class: "mono", text: v.id }),
        el("td", {}, [el("div", { class: "avatar-name" }, [
          el("span", { class: "avatar-dot", "data-tone": tone }),
          el("a", { href: "vendor-detail.html?id=" + encodeURIComponent(v.id), text: v.name })
        ])]),
        el("td", { text: v.plan }),
        el("td", { text: String(v.jobs30d) }),
        el("td", { text: v.onTime }),
        el("td", { text: v.joined }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": tone, text: statusLabel })]),
        el("td", {}, [
          el("a", { class: "btn btn-ghost btn-sm", href: "vendor-detail.html?id=" + encodeURIComponent(v.id), text: "View" })
        ])
      ]);
      tbody.appendChild(row);
    });
  }

  /* ---------------- Jobs ---------------- */
  function renderJobs() {
    var total = DATA.pipeline.length;
    var tbody = document.getElementById("jobs-tbody");
    DATA.jobs.forEach(function (j) {
      var tone = j.flagged ? "warn" : stageTone(j.stage, total);
      var row = el("tr", { "data-stage": String(j.stage) }, [
        el("td", { class: "mono" }, [el("a", { href: "job-detail.html?job=" + encodeURIComponent(j.code), text: j.code })]),
        el("td", { text: j.client }),
        el("td", { text: j.vendor }),
        el("td", { text: j.route }),
        el("td", { text: j.type }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": tone, text: (j.stage + 1) + " · " + DATA.pipeline[j.stage] })]),
        el("td", { class: "mono", text: j.price }),
        el("td", {}, [el("a", { class: "btn btn-ghost btn-sm", href: "job-detail.html?job=" + encodeURIComponent(j.code), text: "Open" })])
      ]);
      tbody.appendChild(row);
    });

    var strip = document.getElementById("pipeline-strip");
    DATA.pipeline.forEach(function (name, idx) {
      strip.appendChild(el("span", { class: "pipeline-step", "data-active": String(idx === DATA.jobs[0].stage), text: (idx + 1) + " " + name }));
    });

    var filter = document.getElementById("job-status-filter");
    if (filter) {
      filter.appendChild(el("option", { value: "all", text: "All stages" }));
      DATA.pipeline.forEach(function (name, idx) {
        filter.appendChild(el("option", { value: String(idx), text: (idx + 1) + " · " + name }));
      });
      filter.addEventListener("change", function () {
        var value = filter.value;
        Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (row) {
          row.hidden = value !== "all" && row.getAttribute("data-stage") !== value;
        });
      });
    }
  }

  /* ---------------- RFQs ---------------- */

  function rfqAwaitingClientQuote(r) {
    return r.quotesIn < r.sentTo.length && !r.quotedPrice;
  }

  function buildQuoteDocument(r) {
    var today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" +
      "<title>Quote " + r.code + " — Dozr</title>" +
      "<style>" +
      "body{font-family:'Hanken Grotesk',system-ui,sans-serif;color:#141518;max-width:680px;margin:40px auto;padding:0 24px;}" +
      "h1{font-family:'Space Grotesk',system-ui,sans-serif;font-size:22px;margin-bottom:4px;}" +
      ".mono{font-family:'Space Mono',monospace;font-size:12px;color:#5B5F66;}" +
      "table{width:100%;border-collapse:collapse;margin-top:24px;}" +
      "td{padding:10px 0;border-bottom:1px solid #E8E8E3;font-size:14px;}" +
      "td:first-child{color:#5B5F66;width:40%;}" +
      ".total{font-size:20px;font-weight:700;margin-top:24px;}" +
      ".accent{color:#E6AF00;}" +
      "</style></head><body>" +
      "<h1>Dozr <span class=\"accent\">quote</span></h1>" +
      "<div class=\"mono\">" + r.code + " · Issued " + today + "</div>" +
      "<table>" +
      "<tr><td>Client</td><td>" + r.client + (r.clientContact ? " (" + r.clientContact + ")" : "") + "</td></tr>" +
      "<tr><td>Route</td><td>" + r.route + "</td></tr>" +
      "<tr><td>Equipment</td><td>" + r.type + "</td></tr>" +
      "<tr><td>Deadline</td><td>" + r.deadline + "</td></tr>" +
      "</table>" +
      "<div class=\"total\">AED " + Number(r.quotedPrice).toLocaleString("en-US") + "</div>" +
      "<p class=\"mono\">This quote is valid for 48 hours from issue. Reply to confirm and we'll issue a PO.</p>" +
      "</body></html>";
  }

  function downloadQuote(r) {
    var html = buildQuoteDocument(r);
    var blob = new Blob([html], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Quote-" + r.code + ".html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function showToast(message) {
    var toast = document.getElementById("ops-toast");
    if (!toast) {
      toast = el("div", { id: "ops-toast", class: "ops-toast" });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.classList.remove("visible"); }, 3200);
  }

  function renderRfqs() {
    var wrap = document.getElementById("rfqs-list");
    wrap.innerHTML = "";
    if (DATA.rfqs.length === 0) {
      wrap.appendChild(el("div", { class: "empty-state", text: "No open RFQs." }));
      return;
    }
    DATA.rfqs.forEach(function (r) {
      var pending = r.sentTo.length - r.quotesIn;
      var tone = r.quotesIn === 0 ? "neutral" : (pending === 0 ? "ok" : "warn");
      var card = el("div", { class: "panel", id: "rfq-card-" + r.code }, [
        el("div", { class: "panel-header" }, [
          el("div", {}, [
            el("span", { class: "mono", text: r.code + " " }),
            el("strong", { text: r.client + " — " + r.route })
          ]),
          el("span", { class: "status-chip", "data-tone": tone, text: r.quotesIn + " / " + r.sentTo.length + " quoted" })
        ]),
        el("div", { class: "panel-body" }, [
          el("div", { class: "note", text: r.type + " · Deadline " + r.deadline }),
          el("div", { class: "note", style: "margin-top:6px;", text: "Sent to: " + r.sentTo.join(", ") }),
          el("div", { class: "note", style: "margin-top:6px;", text: "Client contact: " + (r.clientContact || "—") + " · " + r.clientEmail }),
          el("div", { style: "margin-top:10px;display:flex;gap:8px;" }, [
            el("button", { class: "btn btn-primary btn-sm", type: "button", disabled: "disabled", title: "Not wired up on mock data - ships with the real backend", text: "Add vendor" }),
            el("button", { class: "btn btn-ghost btn-sm", type: "button", disabled: "disabled", title: "Not wired up on mock data - ships with the real backend", text: "Close RFQ" })
          ]),
          el("div", { class: "quote-form" }, [
            el("label", { class: "field-label", for: "quote-price-" + r.code, text: "Quote price to client (AED)" }),
            el("div", { class: "quote-form-row" }, [
              el("input", { type: "number", min: "0", step: "50", id: "quote-price-" + r.code, class: "quote-price-input", value: r.quotedPrice || "" }),
              el("button", { class: "btn btn-ghost btn-sm", type: "button", "data-action": "download", "data-code": r.code, text: "Download quote" }),
              el("button", { class: "btn btn-primary btn-sm", type: "button", "data-action": "email", "data-code": r.code, text: "Send to client" })
            ]),
            el("div", { class: "quote-status", id: "quote-status-" + r.code, text: r.emailedAt ? ("Emailed to " + r.clientEmail + " · AED " + Number(r.quotedPrice).toLocaleString("en-US") + " · " + r.emailedAt) : "" })
          ])
        ])
      ]);
      wrap.appendChild(card);
    });

    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-action]");
      if (!btn) return;
      var code = btn.getAttribute("data-code");
      var r = DATA.rfqs.filter(function (x) { return x.code === code; })[0];
      if (!r) return;
      var input = document.getElementById("quote-price-" + code);
      var price = parseFloat(input.value);
      var statusEl = document.getElementById("quote-status-" + code);

      if (!price || price <= 0) {
        statusEl.textContent = "Enter a valid price before continuing.";
        input.focus();
        return;
      }
      r.quotedPrice = price;

      if (btn.getAttribute("data-action") === "download") {
        downloadQuote(r);
        showToast("Quote downloaded for " + r.code + ".");
      } else if (btn.getAttribute("data-action") === "email") {
        r.emailedAt = "Just now";
        statusEl.textContent = "Emailed to " + r.clientEmail + " · AED " + price.toLocaleString("en-US") + " · Just now";
        showToast("Quote for " + r.code + " sent to " + r.clientEmail + " (simulated — no backend wired up yet).");
        renderNotifications();
      }
    });
  }

  /* ---------------- Notifications ---------------- */
  function renderNotifications() {
    var bell = document.getElementById("notif-bell");
    var badge = document.getElementById("notif-badge");
    var list = document.getElementById("notif-list");
    if (!bell) return;

    var pending = DATA.rfqs.filter(rfqAwaitingClientQuote);
    list.innerHTML = "";

    if (pending.length === 0) {
      badge.hidden = true;
      list.appendChild(el("div", { class: "empty-state", style: "padding:16px;", text: "No quote requests waiting." }));
      return;
    }

    badge.hidden = false;
    badge.textContent = String(pending.length);
    pending.forEach(function (r) {
      var item = el("button", { type: "button", class: "notif-item", "data-code": r.code }, [
        el("span", { class: "mono", text: r.code }),
        el("span", { text: r.client + " — " + r.type })
      ]);
      list.appendChild(item);
    });
  }

  function bindNotifications() {
    var bell = document.getElementById("notif-bell");
    var dropdown = document.getElementById("notif-dropdown");
    if (!bell) return;

    bell.addEventListener("click", function () {
      var open = dropdown.hidden;
      dropdown.hidden = !open;
      bell.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function (e) {
      if (!dropdown.hidden && !e.target.closest(".notif-wrap")) {
        dropdown.hidden = true;
        bell.setAttribute("aria-expanded", "false");
      }
    });

    dropdown.addEventListener("click", function (e) {
      var item = e.target.closest(".notif-item");
      if (!item) return;
      var code = item.getAttribute("data-code");
      dropdown.hidden = true;
      bell.setAttribute("aria-expanded", "false");
      var rfqTab = document.getElementById("tab-rfqs");
      if (rfqTab) rfqTab.click();
      var card = document.getElementById("rfq-card-" + code);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.style.outline = "2px solid var(--yellow)";
        setTimeout(function () { card.style.outline = ""; }, 1600);
      }
    });
  }

  /* ---------------- Billing ---------------- */
  function renderBilling() {
    var summaryEl = document.getElementById("billing-summary");
    DATA.billing.summary.forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });

    var tbody = document.getElementById("billing-tbody");
    DATA.billing.invoices.forEach(function (inv) {
      var tone = inv.status === "Paid" ? "ok" : (inv.status === "Overdue" ? "error" : "warn");
      var row = el("tr", {}, [
        el("td", { class: "mono", text: inv.ref }),
        el("td", { text: inv.client }),
        el("td", { class: "mono", text: inv.amount }),
        el("td", { text: inv.issued }),
        el("td", { text: inv.due }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": tone, text: inv.status })]),
        el("td", {}, [el("button", { class: "btn btn-ghost btn-sm", type: "button", disabled: "disabled", title: "Not wired up on mock data - ships with the real backend", text: inv.status === "Paid" ? "Receipt" : "Remind" })])
      ]);
      tbody.appendChild(row);
    });
  }

  /* ---------------- Escalations ---------------- */
  function renderEscalations() {
    var summaryEl = document.getElementById("escalations-summary");
    DATA.escalations.summary.forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });

    var tbody = document.getElementById("escalations-tbody");
    DATA.escalations.log.forEach(function (e) {
      var levelTone = e.level === "L3" ? "error" : (e.level === "L2" ? "warn" : "neutral");
      var statusTone = e.status === "Open" ? "warn" : "ok";
      var row = el("tr", {}, [
        el("td", {}, [el("span", { class: "status-chip", "data-tone": levelTone, text: e.level })]),
        el("td", { class: "mono" }, [el("a", { href: "job-detail.html?job=" + encodeURIComponent(e.job), text: e.job })]),
        el("td", { text: e.issue }),
        el("td", { text: e.owner }),
        el("td", { text: e.time }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": statusTone, text: e.status })])
      ]);
      tbody.appendChild(row);
    });

    var rulesEl = document.getElementById("routing-rules");
    DATA.escalations.rules.forEach(function (group) {
      var tone = group.level === "L3" ? "error" : (group.level === "L2" ? "warn" : "neutral");
      var block = el("div", { style: "margin-bottom:16px;" }, [
        el("div", { style: "display:flex;align-items:center;gap:8px;margin-bottom:8px;" }, [
          el("span", { class: "status-chip", "data-tone": tone, text: group.level }),
          el("strong", { style: "font-size:13px;", text: group.title })
        ])
      ]);
      var list = el("ul", { style: "margin:0;padding-left:18px;" });
      group.items.forEach(function (item) {
        var li = el("li", { style: "font-size:12px;color:var(--slate);line-height:1.6;margin-bottom:4px;", text: item });
        list.appendChild(li);
      });
      block.appendChild(list);
      rulesEl.appendChild(block);
    });
  }

  function bindClock() {
    var updated = document.getElementById("last-updated");
    if (updated) updated.textContent = DATA.lastUpdated;
  }

  function qsParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ---------------- Job detail page ---------------- */
  function renderJobDetailPage() {
    var code = qsParam("job");
    var job = DATA.jobs.filter(function (j) { return j.code === code; })[0];
    var root = document.getElementById("job-detail-root");
    if (!job) {
      root.appendChild(el("div", { class: "empty-state", text: code ? "No job found for " + code + "." : "No job specified." }));
      return;
    }
    document.getElementById("job-detail-title").textContent = job.code + " — " + job.client;

    var strip = el("div", { class: "pipeline-strip" });
    DATA.pipeline.forEach(function (name, idx) {
      strip.appendChild(el("span", { class: "pipeline-step", "data-active": String(idx === job.stage), text: (idx + 1) + " " + name }));
    });

    var summary = el("section", { class: "summary-grid" }, [
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Client" }), el("div", { class: "value", style: "font-size:16px;", text: job.client }), el("div", { class: "note", text: job.clientContact || "" })]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Vendor" }), el("div", { class: "value", style: "font-size:16px;", text: job.vendor }), el("div", { class: "note", text: job.driver ? "Driver: " + job.driver : "" })]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Route" }), el("div", { class: "value", style: "font-size:16px;", text: job.route }), el("div", { class: "note", text: job.type })]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Price" }), el("div", { class: "value", style: "font-size:16px;", text: job.price })])
    ]);

    var docsPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Documents" })]),
      el("div", { class: "panel-body", id: "job-docs" })
    ]);
    var docsBody = docsPanel.querySelector("#job-docs");
    if (!job.documents || job.documents.length === 0) {
      docsBody.appendChild(el("div", { class: "empty-state", text: "No documents generated yet." }));
    } else {
      job.documents.forEach(function (d) {
        docsBody.appendChild(el("div", { style: "display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);" }, [
          el("span", { text: d.label }),
          el("span", { class: "mono", text: d.ref })
        ]));
      });
    }

    var timelinePanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Activity timeline" })]),
      el("div", { class: "panel-body", id: "job-timeline" })
    ]);
    var timelineBody = timelinePanel.querySelector("#job-timeline");
    (job.timeline || []).forEach(function (t) {
      timelineBody.appendChild(el("div", { style: "display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--line);" }, [
        el("span", { class: "mono", style: "color:var(--slate);min-width:110px;flex-shrink:0;", text: t.time }),
        el("span", { text: t.note })
      ]));
    });

    root.appendChild(strip);
    root.appendChild(summary);
    root.appendChild(docsPanel);
    root.appendChild(timelinePanel);
  }

  /* ---------------- Vendor detail page ---------------- */
  function renderVendorDetailPage() {
    var id = qsParam("id");
    var vendor = DATA.vendors.filter(function (v) { return v.id === id; })[0];
    var root = document.getElementById("vendor-detail-root");
    if (!vendor) {
      root.appendChild(el("div", { class: "empty-state", text: id ? "No vendor found for " + id + "." : "No vendor specified." }));
      return;
    }
    document.getElementById("vendor-detail-title").textContent = vendor.name;

    var tone = !vendor.active ? (vendor.plan === "Pending" ? "neutral" : "error") : (vendor.docsExpiring ? "warn" : "ok");
    var statusLabel = vendor.plan === "Pending" ? "Pending approval" : (vendor.active ? "Active" : "Deactivated");

    var summary = el("section", { class: "summary-grid" }, [
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Status" }), el("div", {}, [el("span", { class: "status-chip", "data-tone": tone, text: statusLabel })])]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Plan" }), el("div", { class: "value", style: "font-size:18px;", text: vendor.plan })]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Jobs (30d)" }), el("div", { class: "value", style: "font-size:18px;", text: String(vendor.jobs30d) })]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "On-time rate" }), el("div", { class: "value", style: "font-size:18px;", text: vendor.onTime })])
    ]);

    var infoPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Company details" })]),
      el("div", { class: "panel-body" }, [
        el("div", { style: "margin-bottom:6px;", text: "TRN: " + vendor.trn }),
        el("div", { style: "margin-bottom:6px;", text: "Phone: " + (vendor.phone || "—") }),
        el("div", { style: "margin-bottom:6px;", text: "Fleet: " + (vendor.fleet || "—") }),
        el("div", { text: "Joined: " + vendor.joined })
      ])
    ]);

    var docsPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Verified documents" })]),
      el("div", { class: "panel-body", id: "vendor-docs" })
    ]);
    var docsBody = docsPanel.querySelector("#vendor-docs");
    (vendor.documents || []).forEach(function (d) {
      var expiring = /expires in|expired/i.test(d.status);
      docsBody.appendChild(el("div", { style: "display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);" }, [
        el("span", { text: d.label }),
        el("span", { class: "status-chip", "data-tone": expiring ? "error" : "ok", text: d.status })
      ]));
    });

    var jobsPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Job history" })]),
      el("div", { class: "panel-body no-pad table-scroll", id: "vendor-jobs" })
    ]);
    var jobsWrap = jobsPanel.querySelector("#vendor-jobs");
    var vendorJobs = DATA.jobs.filter(function (j) { return j.vendor === vendor.name; });
    if (vendorJobs.length === 0) {
      jobsWrap.appendChild(el("div", { class: "empty-state", text: "No jobs on record yet." }));
    } else {
      var table = el("table", { class: "data-table" });
      var thead = el("thead", {}, [el("tr", {}, [
        el("th", { scope: "col", text: "Job" }), el("th", { scope: "col", text: "Client" }),
        el("th", { scope: "col", text: "Route" }), el("th", { scope: "col", text: "Stage" }), el("th", { scope: "col", text: "Price" })
      ])]);
      var tbody = el("tbody");
      vendorJobs.forEach(function (j) {
        tbody.appendChild(el("tr", {}, [
          el("td", { class: "mono" }, [el("a", { href: "job-detail.html?job=" + encodeURIComponent(j.code), text: j.code })]),
          el("td", { text: j.client }),
          el("td", { text: j.route }),
          el("td", { text: DATA.pipeline[j.stage] }),
          el("td", { class: "mono", text: j.price })
        ]));
      });
      table.appendChild(thead);
      table.appendChild(tbody);
      jobsWrap.appendChild(table);
    }

    root.appendChild(summary);
    root.appendChild(infoPanel);
    root.appendChild(docsPanel);
    root.appendChild(jobsPanel);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    bindClock();
    if (page === "job-detail") {
      renderJobDetailPage();
      return;
    }
    if (page === "vendor-detail") {
      renderVendorDetailPage();
      return;
    }
    bindTabs();
    bindNotifications();
    renderOverview();
    renderVendors();
    renderJobs();
    renderRfqs();
    renderEscalations();
    renderBilling();
    renderNotifications();
  });
})();
