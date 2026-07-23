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

  // Keeps Tab/Shift+Tab cycling within an open modal instead of leaking
  // focus out to the page behind the overlay. Attached once per overlay at
  // bind time (not per open) - the handler is a no-op while overlay.hidden
  // is true, so it's safe to leave attached permanently. Shared by all four
  // modals (vendor, asset, new-enquiry, equipment) - found missing in the
  // 2026-07-22 UI/UX audit.
  function bindModalFocusTrap(overlay) {
    if (!overlay) return;
    overlay.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || overlay.hidden) return;
      var focusable = overlay.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
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

  // Tabs had no hash-based routing at all - "Back to Pipeline"/"Back to
  // Vendors" links from job-detail.html/vendor-detail.html (and now the
  // Dashboard task list's Billing link) pointed at index.html#panel-X, but
  // nothing ever read the hash, so landing back on index.html always just
  // showed whichever tab is selected="true" in the static HTML (Dashboard).
  // The link's target tab never actually activated (found while wiring the
  // Dashboard task list, 2026-07-22). Reuses the click handler bindTabs()
  // already wired up, so no duplicate selection logic here.
  function activateTabFromHash() {
    if (!window.location.hash) return;
    var targetTab = document.querySelector('[role="tab"][aria-controls="' + window.location.hash.slice(1) + '"]');
    if (targetTab) targetTab.click();
  }

  /* ---------------- Vertical classification (Logistics vs Equipment Rental) ---------------- */
  // Dozr has two business lines, same split Marketplace already uses
  // (browse.html = equipment, freight.html = logistics). Jobs don't have an
  // explicit vertical field yet (mock data predates this ask), so this
  // infers it from the free-text `type` field. Trucks/trailers/flatbeds
  // move freight (logistics); cranes/excavators/lifts are rented equipment.
  var LOGISTICS_KEYWORDS = ["flatbed", "low-bed", "low bed", "box truck", "trailer"];
  function jobVertical(job) {
    if (job.vertical) return job.vertical; // real Supabase jobs carry this column now
    var t = (job.type || "").toLowerCase();
    for (var i = 0; i < LOGISTICS_KEYWORDS.length; i++) {
      if (t.indexOf(LOGISTICS_KEYWORDS[i]) !== -1) return "logistics";
    }
    return "equipment";
  }
  function verticalLabel(v) { return v === "logistics" ? "Logistics" : "Equipment Rental"; }

  /* ---------------- Live jobs (Supabase) ---------------- */
  // Enquiries/Kanban/Reports read from here, not DATA.jobs, once loaded.
  // job-detail.html now also queries Supabase directly by code (fixed
  // 2026-07-22 - see renderJobDetailPage), falling back to DATA.jobs only
  // for documents/timeline, which aren't modeled in Supabase yet. Only
  // vendor-detail.html's mock-vendor job history panel is still genuinely
  // mock-only (DATA.jobs filtered by vendor name).
  var LIVE_JOBS = [];

  async function loadJobsFromSupabase() {
    if (typeof supabaseClient === "undefined") return LIVE_JOBS;
    var result = await supabaseClient.from("jobs").select("*").order("created_at", { ascending: false });
    if (result.error) {
      console.error("loadJobsFromSupabase:", result.error);
      return LIVE_JOBS;
    }
    LIVE_JOBS = result.data.map(function (row) {
      return {
        id: row.id,
        code: row.code,
        client: row.client_name,
        clientContact: row.client_contact,
        vendor: row.vendor_name || "— unassigned",
        driver: row.driver || "— unassigned",
        route: row.route,
        type: row.type,
        stage: row.stage,
        price: row.price,
        flagged: row.flagged,
        vertical: row.vertical,
        vendorCost: row.vendor_cost,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        vendorInvoiceRef: row.vendor_invoice_ref,
        vendorPaymentStatus: row.vendor_payment_status,
        vendorPaidAt: row.vendor_paid_at
      };
    });
    return LIVE_JOBS;
  }

  function bindVerticalFilter(containerId, onChange) {
    var container = document.getElementById(containerId);
    if (!container) return { get: function () { return "all"; } };
    var current = "all";
    var buttons = Array.prototype.slice.call(container.querySelectorAll("[data-vertical]"));
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        current = btn.getAttribute("data-vertical");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        onChange(current);
      });
    });
    return { get: function () { return current; } };
  }

  /* ---------------- Dashboard: enquiries summary ---------------- */
  // Was its own tab, then briefly merged into Kanban, then split back out
  // into a dedicated "Dashboard" tab when Kanban was renamed to "Pipeline"
  // (afzl's call, 2026-07-22) - Dashboard is just these 3 summary cards for
  // now, Pipeline is the job board.
  function renderEnquiries() {
    var summaryEl = document.getElementById("enquiries-summary");
    if (!summaryEl) return;
    var allNew = LIVE_JOBS.filter(function (j) { return j.stage === 0; });
    var logisticsCount = allNew.filter(function (j) { return jobVertical(j) === "logistics"; }).length;
    var equipmentCount = allNew.filter(function (j) { return jobVertical(j) === "equipment"; }).length;
    summaryEl.innerHTML = "";
    [
      { label: "New enquiries", value: String(allNew.length), note: "Not yet sent to vendors" },
      { label: "Logistics", value: String(logisticsCount), note: "Freight / trucking enquiries" },
      { label: "Equipment Rental", value: String(equipmentCount), note: "Crane / excavator / lift enquiries" }
    ].forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });
  }

  // Returns true if a "YYYY-MM-DD" date string is within `days` days from now
  // (or already past). Used for vendor doc-expiry checks on the Dashboard
  // task list. Bad/missing dates return false rather than throwing.
  function isExpiringOrPast(dateStr, days) {
    if (!dateStr) return false;
    var target = new Date(dateStr);
    if (isNaN(target.getTime())) return false;
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return target.getTime() <= cutoff.getTime();
  }

  // Returns hours elapsed since a timestamp (ISO string or "YYYY-MM-DD").
  // Bad/missing dates return -1 (never triggers an aging alert) rather than
  // NaN or throwing.
  function hoursSince(dateStr) {
    if (!dateStr) return -1;
    var then = new Date(dateStr);
    if (isNaN(then.getTime())) return -1;
    return (Date.now() - then.getTime()) / 36e5;
  }

  // SLA aging threshold - a job sitting at Quote Requested/Quote Sent this
  // long with no stage change is the classic TMS "stuck load" alert (afzl's
  // ask, 2026-07-23: alerts & SLA tracking). 48h chosen as a starting point,
  // not tuned against real volume yet - revisit once real jobs flow through.
  var AGING_THRESHOLD_HOURS = 48;

  // Dashboard "Needs your attention" - aggregates the 6 task types afzl
  // confirmed (2026-07-22 + 2026-07-23): unquoted enquiries, jobs aging in
  // early pipeline stages, jobs missing vendor cost at Payment Received,
  // vendors with expiring/expired docs, vendors pending approval, and
  // overdue invoices. Each renders as a clickable row that jumps straight to
  // the relevant record (job/vendor detail page, or the Billing tab via
  // activateTabFromHash()).
  function renderDashboardTasks() {
    var root = document.getElementById("dashboard-tasks");
    if (!root) return;
    root.innerHTML = "";
    var tasks = [];

    // 1. Unquoted enquiries - stage 0, sitting with no quote sent yet.
    LIVE_JOBS.filter(function (j) { return j.stage === 0; }).forEach(function (j) {
      tasks.push({
        tag: "Quote needed",
        title: j.code + " · " + (j.client || "Unknown client"),
        detail: (jobVertical(j) === "logistics" ? "Freight" : "Equipment") + " enquiry - not yet sent to a vendor",
        href: "job-detail.html?job=" + encodeURIComponent(j.code)
      });
    });

    // 2. Aging in pipeline - stuck at Quote Requested/Quote Sent (stage 0-1)
    // with no stage change in 48h+. Uses updated_at, falling back to
    // created_at if a job has never been updated since creation.
    LIVE_JOBS.filter(function (j) { return j.stage <= 1; }).forEach(function (j) {
      var hours = hoursSince(j.updatedAt || j.createdAt);
      if (hours >= AGING_THRESHOLD_HOURS) {
        tasks.push({
          tag: "Aging in pipeline",
          title: j.code + " · " + (j.client || "Unknown client"),
          detail: "No stage change in " + Math.floor(hours / 24) + "+ day(s) - still at " + DATA.pipeline[j.stage],
          href: "job-detail.html?job=" + encodeURIComponent(j.code)
        });
      }
    });

    // 3. Payment received but vendor cost not entered yet - blocks Payables/Profit.
    LIVE_JOBS.filter(function (j) { return j.stage === 5 && (j.vendorCost === null || j.vendorCost === undefined); }).forEach(function (j) {
      tasks.push({
        tag: "Missing vendor cost",
        title: j.code + " · " + (j.client || "Unknown client"),
        detail: "Payment received from client, but vendor cost not recorded",
        href: "job-detail.html?job=" + encodeURIComponent(j.code)
      });
    });

    // 4. Mock vendors with expiring/expired docs or pending approval.
    DATA.vendors.forEach(function (v) {
      if (v.docsExpiring) {
        tasks.push({
          tag: "Docs expiring",
          title: v.name,
          detail: "Trade license or insurance needs renewal",
          href: "vendor-detail.html?id=" + encodeURIComponent(v.id)
        });
      }
      if (v.pendingApproval) {
        tasks.push({
          tag: "Pending approval",
          title: v.name,
          detail: "Vendor application awaiting review",
          href: "vendor-detail.html?id=" + encodeURIComponent(v.id)
        });
      }
    });

    // 5. Overdue invoices.
    DATA.billing.invoices.filter(function (inv) { return inv.status === "Overdue"; }).forEach(function (inv) {
      tasks.push({
        tag: "Invoice overdue",
        title: inv.ref + " · " + inv.client,
        detail: inv.amount + " - was due " + inv.due,
        href: "index.html#panel-billing"
      });
    });

    function renderTasks() {
      if (tasks.length === 0) {
        root.appendChild(el("div", { class: "task-row" }, [
          el("div", { class: "task-row-main" }, [
            el("div", { class: "task-row-text" }, [
              el("div", { class: "task-row-title", text: "All caught up" }),
              el("div", { class: "task-row-detail", text: "No open items need attention right now." })
            ])
          ])
        ]));
        return;
      }
      tasks.forEach(function (t) {
        root.appendChild(el("a", { class: "task-row", href: t.href }, [
          el("div", { class: "task-row-main" }, [
            el("span", { class: "status-chip", "data-tone": "warn", text: t.tag }),
            el("div", { class: "task-row-text" }, [
              el("div", { class: "task-row-title", text: t.title }),
              el("div", { class: "task-row-detail", text: t.detail })
            ])
          ]),
          el("span", { class: "task-row-arrow", "aria-hidden": "true", text: "→" })
        ]));
      });
    }

    // 6. Live (Supabase) vendors with expiring/expired docs - async, appended
    // once loaded so the other 5 (synchronous) task types show immediately.
    if (typeof supabaseClient !== "undefined") {
      supabaseClient
        .from("vendors")
        .select("id, name, trade_license_expiry, insurance_expiry")
        .then(function (result) {
          if (!result.error && result.data) {
            result.data.forEach(function (v) {
              if (HIDDEN_VENDOR_NAMES.indexOf(v.name) !== -1) return;
              if (isExpiringOrPast(v.trade_license_expiry, 14) || isExpiringOrPast(v.insurance_expiry, 14)) {
                tasks.push({
                  tag: "Docs expiring",
                  title: v.name,
                  detail: "Trade license or insurance expires within 14 days (or has passed)",
                  href: "vendor-detail.html?id=" + encodeURIComponent(v.id)
                });
              }
            });
          }
          root.innerHTML = "";
          renderTasks();
        });
    } else {
      renderTasks();
    }
  }

  /* ---------------- Vendors ---------------- */
  function renderVendors() {
    var tbody = document.getElementById("vendors-tbody");
    DATA.vendors.forEach(function (v) {
      var tone = !v.active ? (v.pendingApproval ? "neutral" : "error") : (v.docsExpiring ? "warn" : "ok");
      var statusLabel = v.pendingApproval ? "Pending approval" : (v.active ? "Active" : "Deactivated");
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

    loadLiveVendors();
  }

  /* ---------------- Live vendors (Supabase) ---------------- */
  // Vendors added via "+ Onboard vendor" are real Supabase rows, appended
  // below the demo/mock rows above. Mock rows stay as-is (jobs/RFQs still
  // reference them by name, not id) - this is additive, not a migration.
  // "Dozr Verified Fleet" is a system placeholder (owns the 15 Marketplace-
  // mirrored assets seeded in 0008_seed_marketplace_equipment.sql) - it's
  // not a real vendor, so it's excluded here to keep it off the normal
  // Vendors list (and out of reach of the row Delete button, which would
  // cascade-delete all 15 assets). Still in the DB, still assignable via
  // Assets - just hidden from this table (afzl's call, 2026-07-22).
  var HIDDEN_VENDOR_NAMES = ["Dozr Verified Fleet"];

  function loadLiveVendors() {
    var tbody = document.getElementById("vendors-tbody");
    if (!tbody || typeof supabaseClient === "undefined") return;
    supabaseClient
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) { console.error("loadLiveVendors:", result.error); return; }
        tbody.querySelectorAll('[data-live-vendor="1"]').forEach(function (r) { r.remove(); });
        result.data.forEach(function (v) {
          if (HIDDEN_VENDOR_NAMES.indexOf(v.name) !== -1) return;
          var tone = v.active ? "ok" : "neutral";
          var row = el("tr", { "data-live-vendor": "1" }, [
            el("td", { class: "mono", text: v.id.slice(0, 8) }),
            el("td", {}, [el("div", { class: "avatar-name" }, [
              el("span", { class: "avatar-dot", "data-tone": tone }),
              el("a", { href: "vendor-detail.html?id=" + encodeURIComponent(v.id), text: v.name })
            ])]),
            el("td", { text: v.plan }),
            el("td", { text: "—" }),
            el("td", { text: "—" }),
            el("td", { text: v.joined_at }),
            el("td", {}, [el("span", { class: "status-chip", "data-tone": tone, text: v.active ? "Active" : "Deactivated" })]),
            el("td", { style: "white-space:nowrap;" }, [
              el("a", { class: "btn btn-ghost btn-sm", href: "vendor-detail.html?id=" + encodeURIComponent(v.id), text: "View" }),
              el("button", { class: "btn btn-ghost btn-sm", type: "button", "data-delete-vendor": v.id, style: "color:var(--error);margin-left:4px;", text: "Delete" })
            ])
          ]);
          tbody.appendChild(row);
        });
      });
  }

  function bindVendorDelete() {
    var tbody = document.getElementById("vendors-tbody");
    if (!tbody) return;
    tbody.addEventListener("click", async function (e) {
      var btn = e.target.closest("[data-delete-vendor]");
      if (!btn) return;
      var id = btn.getAttribute("data-delete-vendor");
      var name = btn.closest("tr").querySelector("a").textContent;
      if (!window.confirm("Delete " + name + "? This also deletes its equipment/assets. This can't be undone.")) return;
      btn.disabled = true;
      var result = await supabaseClient.from("vendors").delete().eq("id", id);
      if (result.error) {
        showToast("Could not delete " + name + " - try again.");
        btn.disabled = false;
        return;
      }
      showToast(name + " deleted.");
      loadLiveVendors();
    });
  }

  /* ---------------- Add vendor modal ---------------- */
  function bindVendorModal() {
    var overlay = document.getElementById("vendor-modal-overlay");
    var openBtn = document.getElementById("add-vendor-btn");
    if (!overlay || !openBtn) return;
    bindModalFocusTrap(overlay);
    var closeBtn = document.getElementById("vendor-modal-close");
    var cancelBtn = document.getElementById("vendor-modal-cancel");
    var form = document.getElementById("vendor-form");
    var errorEl = document.getElementById("vendor-form-error");
    var submitBtn = document.getElementById("vendor-form-submit");

    function openModal() {
      overlay.hidden = false;
      errorEl.hidden = true;
      form.reset();
      document.getElementById("vf-name").focus();
    }
    function closeModal() { overlay.hidden = true; }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeModal(); });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var name = document.getElementById("vf-name").value.trim();
      if (!name) {
        errorEl.textContent = "Company name is required.";
        errorEl.hidden = false;
        return;
      }
      var payload = {
        name: name,
        contact_name: document.getElementById("vf-contact").value.trim() || null,
        phone: document.getElementById("vf-phone").value.trim() || null,
        email: document.getElementById("vf-email").value.trim() || null,
        plan: document.getElementById("vf-plan").value,
        trade_license_no: document.getElementById("vf-trade-license").value.trim() || null,
        trade_license_expiry: document.getElementById("vf-trade-license-expiry").value || null,
        insurance_expiry: document.getElementById("vf-insurance-expiry").value || null
      };
      submitBtn.disabled = true;
      submitBtn.textContent = "Adding...";
      var result = await supabaseClient.from("vendors").insert(payload).select().single();
      submitBtn.disabled = false;
      submitBtn.textContent = "Add vendor";
      if (result.error) {
        errorEl.textContent = result.error.message || "Could not add vendor - try again.";
        errorEl.hidden = false;
        return;
      }
      closeModal();
      showToast(name + " added to vendors.");
      loadLiveVendors();
    });
  }

  /* ---------------- New enquiry / job modal ---------------- */
  // The only way a job used to enter the jobs table was Supabase's raw
  // table editor - Marketplace's booking/quote forms are WhatsApp-native by
  // design (see marketplace/js/whatsapp.js) and don't write to a backend,
  // so nothing created jobs automatically. This is staff's manual logging
  // step for whatever comes in over WhatsApp/phone (added 2026-07-22).
  function generateJobCode() {
    return "DZR-J-" + Date.now().toString().slice(-6);
  }

  function bindJobModal() {
    var overlay = document.getElementById("job-modal-overlay");
    var openBtn = document.getElementById("add-job-btn");
    if (!overlay || !openBtn) return;
    bindModalFocusTrap(overlay);
    var closeBtn = document.getElementById("job-modal-close");
    var cancelBtn = document.getElementById("job-modal-cancel");
    var form = document.getElementById("job-form");
    var errorEl = document.getElementById("job-form-error");
    var submitBtn = document.getElementById("job-form-submit");

    function openModal() {
      overlay.hidden = false;
      errorEl.hidden = true;
      form.reset();
      document.getElementById("jf-client").focus();
    }
    function closeModal() { overlay.hidden = true; }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeModal(); });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var clientName = document.getElementById("jf-client").value.trim();
      var type = document.getElementById("jf-type").value.trim();
      if (!clientName || !type) {
        errorEl.textContent = "Client name and what's needed are required.";
        errorEl.hidden = false;
        return;
      }
      var payload = {
        code: generateJobCode(),
        client_name: clientName,
        client_contact: document.getElementById("jf-contact").value.trim() || null,
        route: document.getElementById("jf-route").value.trim() || null,
        type: type,
        vertical: document.getElementById("jf-vertical").value,
        stage: 0,
        price: "Quote pending",
        flagged: false
      };
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging...";
      var result = await supabaseClient.from("jobs").insert(payload).select().single();
      submitBtn.disabled = false;
      submitBtn.textContent = "Log enquiry";
      if (result.error) {
        errorEl.textContent = result.error.message || "Could not log enquiry - try again.";
        errorEl.hidden = false;
        return;
      }
      closeModal();
      showToast(clientName + "'s enquiry logged as " + result.data.code + ".");
      await loadJobsFromSupabase();
      refreshAllJobViews();
    });
  }

  /* ---------------- Assets (central equipment page) ---------------- */
  // Lists every equipment/vehicle row across all vendors, regardless of
  // which vendor's detail page it was added from. Uses a foreign-table
  // select to pull the vendor's name in the same query.
  async function renderAssets() {
    var tbody = document.getElementById("assets-tbody");
    if (!tbody || typeof supabaseClient === "undefined") return;
    var result = await supabaseClient
      .from("equipment")
      .select("*, vendors(name)")
      .order("created_at", { ascending: false });
    tbody.innerHTML = "";
    if (result.error) {
      tbody.appendChild(el("tr", {}, [el("td", { colspan: "8", class: "empty-state", text: "Could not load assets - try refreshing." })]));
      console.error("renderAssets:", result.error);
      return;
    }
    if (result.data.length === 0) {
      tbody.appendChild(el("tr", {}, [el("td", { colspan: "8", class: "empty-state", text: "No equipment added yet. Use \"+ Add asset\" above." })]));
      return;
    }
    result.data.forEach(function (eq) {
      var imageUrl = (eq.images && eq.images[0]) || null;
      var thumbCell = el("td", { class: "asset-thumb-cell" }, [
        imageUrl ? el("img", { src: imageUrl, alt: eq.name }) : el("div", { class: "equipment-thumb-placeholder", text: "—" })
      ]);

      var availSelect = el("select", { class: "availability-select", "data-tone": eq.availability_status }, [
        el("option", { value: "available", text: "Available" }),
        el("option", { value: "on_job", text: "On job" }),
        el("option", { value: "maintenance", text: "Maintenance" })
      ]);
      availSelect.value = eq.availability_status;
      availSelect.disabled = !eq.active;
      availSelect.addEventListener("change", async function () {
        var newStatus = availSelect.value;
        availSelect.disabled = true;
        var res = await supabaseClient.from("equipment").update({ availability_status: newStatus }).eq("id", eq.id);
        availSelect.disabled = false;
        if (res.error) { showToast("Could not update availability - try again."); availSelect.value = eq.availability_status; return; }
        eq.availability_status = newStatus;
        availSelect.setAttribute("data-tone", newStatus);
        showToast(eq.name + " marked " + newStatus.replace("_", " ") + ".");
      });

      var statusChip = el("span", { class: "status-chip", "data-tone": eq.active ? "ok" : "neutral", text: eq.active ? "Active" : "Off" });
      var toggleBtn = el("button", {
        class: "btn btn-ghost btn-sm", type: "button", "data-id": eq.id, text: eq.active ? "Turn off" : "Reactivate"
      });
      toggleBtn.addEventListener("click", async function () {
        var newActive = !eq.active;
        toggleBtn.disabled = true;
        var res = await supabaseClient.from("equipment").update({ active: newActive }).eq("id", eq.id);
        toggleBtn.disabled = false;
        if (res.error) { showToast("Could not update - try again."); return; }
        eq.active = newActive;
        statusChip.setAttribute("data-tone", newActive ? "ok" : "neutral");
        statusChip.textContent = newActive ? "Active" : "Off";
        toggleBtn.textContent = newActive ? "Turn off" : "Reactivate";
        availSelect.disabled = !newActive;
        showToast(eq.name + (newActive ? " reactivated." : " turned off."));
      });

      var deleteBtn = el("button", { class: "btn btn-ghost btn-sm", type: "button", style: "color:var(--error);margin-left:4px;", text: "Delete" });
      deleteBtn.addEventListener("click", async function () {
        if (!window.confirm("Delete " + eq.name + "? This can't be undone.")) return;
        deleteBtn.disabled = true;
        var res = await supabaseClient.from("equipment").delete().eq("id", eq.id);
        if (res.error) { showToast("Could not delete - try again."); deleteBtn.disabled = false; return; }
        showToast(eq.name + " deleted.");
        renderAssets();
      });

      var row = el("tr", {}, [
        thumbCell,
        el("td", { text: eq.name }),
        el("td", { text: eq.category }),
        el("td", { text: (eq.vendors && eq.vendors.name) || "—" }),
        el("td", { class: "mono", text: eq.plate_or_asset_id || "—" }),
        el("td", {}, [availSelect]),
        el("td", {}, [statusChip]),
        el("td", { style: "white-space:nowrap;" }, [toggleBtn, deleteBtn])
      ]);
      tbody.appendChild(row);
    });
  }

  async function populateVendorSelect(selectEl) {
    selectEl.innerHTML = "";
    var result = await supabaseClient.from("vendors").select("id, name").order("name");
    if (result.error || result.data.length === 0) {
      selectEl.appendChild(el("option", { value: "", text: "No vendors yet - onboard one first" }));
      return;
    }
    result.data.forEach(function (v) {
      selectEl.appendChild(el("option", { value: v.id, text: v.name }));
    });
  }

  function bindAssetModal() {
    var overlay = document.getElementById("asset-modal-overlay");
    var openBtn = document.getElementById("add-asset-btn");
    if (!overlay || !openBtn) return;
    bindModalFocusTrap(overlay);
    var closeBtn = document.getElementById("asset-modal-close");
    var cancelBtn = document.getElementById("asset-modal-cancel");
    var form = document.getElementById("asset-form");
    var errorEl = document.getElementById("asset-form-error");
    var submitBtn = document.getElementById("asset-form-submit");
    var vendorSelect = document.getElementById("af-vendor");

    function openModal() {
      overlay.hidden = false;
      errorEl.hidden = true;
      form.reset();
      populateVendorSelect(vendorSelect);
      document.getElementById("af-name").focus();
    }
    function closeModal() { overlay.hidden = true; }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeModal(); });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var name = document.getElementById("af-name").value.trim();
      var vendorId = vendorSelect.value;
      if (!name) { errorEl.textContent = "Name / description is required."; errorEl.hidden = false; return; }
      if (!vendorId) { errorEl.textContent = "Pick a vendor - onboard one first if the list is empty."; errorEl.hidden = false; return; }

      submitBtn.disabled = true;
      submitBtn.textContent = "Adding...";

      var images = [];
      var file = document.getElementById("af-image").files[0];
      if (file) {
        var path = vendorId + "/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        var upload = await supabaseClient.storage.from("equipment-images").upload(path, file);
        if (upload.error) {
          errorEl.textContent = "Image upload failed: " + upload.error.message;
          errorEl.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = "Add asset";
          return;
        }
        images.push(supabaseClient.storage.from("equipment-images").getPublicUrl(path).data.publicUrl);
      }

      var payload = {
        vendor_id: vendorId,
        category: document.getElementById("af-category").value,
        name: name,
        plate_or_asset_id: document.getElementById("af-plate").value.trim() || null,
        availability_status: document.getElementById("af-availability").value,
        notes: document.getElementById("af-notes").value.trim() || null,
        images: images
      };
      var result = await supabaseClient.from("equipment").insert(payload);
      submitBtn.disabled = false;
      submitBtn.textContent = "Add asset";
      if (result.error) {
        errorEl.textContent = result.error.message || "Could not add asset - try again.";
        errorEl.hidden = false;
        return;
      }
      closeModal();
      showToast(name + " added to Assets.");
      renderAssets();
    });
  }

  /* ---------------- Jobs ---------------- */
  var jobsVerticalFilter = "all";

  function renderJobs() {
    var total = DATA.pipeline.length;
    var tbody = document.getElementById("jobs-tbody");
    tbody.innerHTML = "";
    LIVE_JOBS.forEach(function (j) {
      if (jobsVerticalFilter !== "all" && jobVertical(j) !== jobsVerticalFilter) return;
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
    if (strip.children.length === 0) {
      DATA.pipeline.forEach(function (name, idx) {
        strip.appendChild(el("span", { class: "pipeline-step", "data-active": String(LIVE_JOBS[0] && idx === LIVE_JOBS[0].stage), text: (idx + 1) + " " + name }));
      });
    }

    var filter = document.getElementById("job-status-filter");
    if (filter && filter.children.length === 0) {
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

  /* ---------------- Jobs kanban ---------------- */
  // One column per pipeline stage (see DATA.pipeline) - grouping into
  // fewer columns made sense at 13 stages (unusable as a board otherwise),
  // but the pipeline was simplified to 7 stages 2026-07-22, so each stage
  // fits directly as its own column now. Each card's stage <select> is the
  // editable source of truth (afzl's call: staff move jobs manually, no
  // automatic progression, no drag-and-drop). Changing it writes straight
  // to Supabase (jobs table) and updates LIVE_JOBS in memory.
  function refreshAllJobViews() {
    renderJobs();
    renderJobsKanban();
    renderEnquiries();
    renderReports();
  }

  function renderJobsKanban() {
    var board = document.getElementById("jobs-kanban");
    if (!board) return;
    board.innerHTML = "";
    var visibleJobs = LIVE_JOBS.filter(function (j) {
      return jobsVerticalFilter === "all" || jobVertical(j) === jobsVerticalFilter;
    });
    DATA.pipeline.forEach(function (stageName, stageIdx) {
      var jobsInCol = visibleJobs.filter(function (j) { return j.stage === stageIdx; });
      var column = el("div", { class: "kanban-column" }, [
        el("div", { class: "kanban-column-header" }, [
          el("span", { text: (stageIdx + 1) + " · " + stageName }),
          el("span", { class: "kanban-count", text: String(jobsInCol.length) })
        ])
      ]);
      jobsInCol.forEach(function (j) {
        var card = el("div", { class: "kanban-card", "data-flagged": String(!!j.flagged) }, [
          el("a", { class: "kanban-card-link", href: "job-detail.html?job=" + encodeURIComponent(j.code), text: j.code }),
          el("div", { class: "kanban-client", text: j.client }),
          el("div", { class: "kanban-route", text: j.vendor + " · " + j.route }),
          el("div", { class: "kanban-price", text: j.price })
        ]);
        var select = el("select", { class: "kanban-stage-select", "aria-label": "Stage for " + j.code });
        DATA.pipeline.forEach(function (name, idx) {
          select.appendChild(el("option", { value: String(idx), text: (idx + 1) + " · " + name }));
        });
        select.value = String(j.stage);
        select.addEventListener("change", async function () {
          var newStage = parseInt(select.value, 10);
          var previousStage = j.stage;
          select.disabled = true;
          var res = await supabaseClient.from("jobs").update({ stage: newStage }).eq("id", j.id);
          select.disabled = false;
          if (res.error) {
            showToast("Could not move " + j.code + " - try again.");
            select.value = String(previousStage);
            return;
          }
          j.stage = newStage;
          showToast(j.code + " moved to \"" + DATA.pipeline[j.stage] + "\".");
          refreshAllJobViews();
        });
        card.appendChild(select);
        column.appendChild(card);
      });
      board.appendChild(column);
    });
  }

  function bindJobsViewToggle() {
    var tableBtn = document.getElementById("jobs-view-table");
    var kanbanBtn = document.getElementById("jobs-view-kanban");
    var tableView = document.getElementById("jobs-table-view");
    var kanbanView = document.getElementById("jobs-kanban-view");
    var pipelineStrip = document.getElementById("pipeline-strip");
    var filterLabel = document.getElementById("job-status-filter-label");
    var filterSelect = document.getElementById("job-status-filter");
    if (!tableBtn || !kanbanBtn) return;

    tableBtn.addEventListener("click", function () {
      tableBtn.setAttribute("aria-pressed", "true");
      kanbanBtn.setAttribute("aria-pressed", "false");
      tableView.hidden = false;
      kanbanView.hidden = true;
      pipelineStrip.hidden = false;
      filterLabel.hidden = false;
      filterSelect.hidden = false;
      renderJobs();
    });
    kanbanBtn.addEventListener("click", function () {
      kanbanBtn.setAttribute("aria-pressed", "true");
      tableBtn.setAttribute("aria-pressed", "false");
      kanbanView.hidden = false;
      tableView.hidden = true;
      pipelineStrip.hidden = true;
      filterLabel.hidden = true;
      filterSelect.hidden = true;
      renderJobsKanban();
    });

    bindVerticalFilter("jobs-vertical-filter", function (v) {
      jobsVerticalFilter = v;
      renderJobs();
      renderJobsKanban();
    });
  }

  /* ---------------- RFQs ---------------- */
  // RFQ tab (quote-collection UI) removed 2026-07-22 - not wired to a real
  // backend yet, buttons were disabled and read as broken (afzl's call).
  // Will come back once quote collection is actually built. DATA.rfqs stays
  // in ops/data/ops.js for when that happens.

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

  /* ---------------- Billing ---------------- */
  function renderBilling() {
    var summaryEl = document.getElementById("billing-summary");
    summaryEl.innerHTML = "";
    DATA.billing.summary.forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });

    // Commission earned - Dozr's actual revenue: client price minus vendor
    // cost, per confirmed job (same calc as Reports' Profit card, just
    // scoped to Billing). Replaces a static "MRR" card that assumed vendors
    // pay a recurring subscription - they don't, this is a marketplace, not
    // SaaS (afzl's correction, 2026-07-23: "there are no vendor plans").
    // Reads LIVE_JOBS, so this is a no-op on the first paint (before
    // loadJobsFromSupabase() resolves) and accurate once renderBilling() is
    // called again afterward - see the DOMContentLoaded handler.
    var jobsWithCommission = LIVE_JOBS.filter(function (j) {
      return j.vendorCost !== null && j.vendorCost !== undefined && parseAedPrice(j.price) !== null;
    });
    var commissionTotal = jobsWithCommission.reduce(function (sum, j) { return sum + (parseAedPrice(j.price) - j.vendorCost); }, 0);
    summaryEl.appendChild(el("div", { class: "summary-card" }, [
      el("div", { class: "label", text: "Commission earned" }),
      el("div", { class: "value", text: jobsWithCommission.length > 0 ? formatAed(commissionTotal) : "—" }),
      el("div", { class: "note", text: jobsWithCommission.length > 0
        ? "Client price minus vendor cost, " + jobsWithCommission.length + " job(s) with both known"
        : "Needs vendor cost entered per job (job-detail.html) - none yet" })
    ]));

    // VAT collected/due - summed across every invoice listed below (afzl's
    // ask, 2026-07-23). Not filtered by status: this is "VAT on invoices
    // issued", the figure an accountant would want regardless of whether
    // the client has paid yet.
    var vatTotal = DATA.billing.invoices.reduce(function (sum, inv) {
      var net = parseAedPrice(inv.amount);
      return net ? sum + computeVat(net).vat : sum;
    }, 0);
    summaryEl.appendChild(el("div", { class: "summary-card" }, [
      el("div", { class: "label", text: "VAT (5%) on invoices" }),
      el("div", { class: "value", text: formatAed(vatTotal) }),
      el("div", { class: "note", text: "Across all " + DATA.billing.invoices.length + " invoice(s) below, any status" })
    ]));

    var tbody = document.getElementById("billing-tbody");
    tbody.innerHTML = "";
    DATA.billing.invoices.forEach(function (inv) {
      var tone = inv.status === "Paid" ? "ok" : (inv.status === "Overdue" ? "error" : "warn");
      var net = parseAedPrice(inv.amount);
      var vatFigures = net !== null ? computeVat(net) : null;
      var row = el("tr", {}, [
        el("td", { class: "mono", text: inv.ref }),
        el("td", { text: inv.client }),
        el("td", { class: "mono", text: inv.amount }),
        el("td", { class: "mono", text: vatFigures ? formatAed(vatFigures.vat) : "—" }),
        el("td", { class: "mono", text: vatFigures ? formatAed(vatFigures.total) : "—" }),
        el("td", { text: inv.issued }),
        el("td", { text: inv.due }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": tone, text: inv.status })]),
        el("td", {}, [
          el("button", {
            class: "btn btn-ghost btn-sm", type: "button", disabled: "disabled",
            "aria-describedby": "billing-action-note-" + inv.ref,
            title: "Not wired up on mock data - ships with the real backend",
            text: inv.status === "Paid" ? "Receipt" : "Remind"
          }),
          // A hover title alone isn't discoverable via keyboard/touch (flagged
          // in the 2026-07-22 UI/UX audit) - this small visible label makes
          // the "why is this greyed out" reason visible without hovering.
          el("div", { id: "billing-action-note-" + inv.ref, class: "note", style: "margin-top:3px;white-space:normal;", text: "Not available yet" })
        ])
      ]);
      tbody.appendChild(row);
    });
  }

  /* ---------------- Reports ---------------- */
  // Computed from LIVE_JOBS, not stored separately - stays consistent with
  // Enquiries/Kanban automatically. "Confirmed" = stage >= 2 (Approved
  // onward, in the 7-stage pipeline - the client has committed). Revenue
  // only sums jobs with a real AED price ("Quote pending"/"RFQ open"/"—"
  // are skipped). No profit figure - see the note in the Reports panel.
  function parseAedPrice(priceStr) {
    if (!priceStr) return null;
    var match = String(priceStr).match(/[\d,]+(\.\d+)?/);
    if (!match) return null;
    return parseFloat(match[0].replace(/,/g, ""));
  }

  // UAE VAT is 5% (afzl's ask, 2026-07-23: invoicing needs VAT shown before
  // real invoices go out). Every AED figure stored/displayed elsewhere in
  // this file (job price, invoice amount) is treated as net/excl. VAT -
  // that's the existing convention Reports already uses for job price, so
  // VAT is computed on top for display rather than baked into stored data.
  var VAT_RATE = 0.05;
  function computeVat(netAmount) {
    return { vat: netAmount * VAT_RATE, total: netAmount * (1 + VAT_RATE) };
  }
  function formatAed(num) { return "AED " + Math.round(num).toLocaleString("en-US"); }

  // Stage numbers reference the 7-stage pipeline: 0 Quote Requested,
  // 1 Quote Sent, 2 Approved, 3 Work Completed, 4 Invoiced,
  // 5 Payment Received, 6 Vendor Paid.
  /* ---------------- Trend charts (Reports) ---------------- */
  // Minimal inline-SVG bar chart, no charting library - keeps the "no build
  // step" stack promise (afzl's ask, 2026-07-23: trend charts/analytics).
  // Renders whatever is passed in; callers own bucketing the data.
  function renderMiniBarChart(containerId, buckets, valueKey, formatValue) {
    var container = document.getElementById(containerId);
    if (!container) return;
    if (buckets.length === 0) {
      container.innerHTML = '<p class="note">No data yet.</p>';
      return;
    }
    var width = 320, height = 130, gap = 6;
    var barWidth = (width / buckets.length) - gap;
    var max = Math.max.apply(null, buckets.map(function (b) { return b[valueKey]; }).concat([1]));
    var parts = ['<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" height="130" preserveAspectRatio="xMinYMid meet">'];
    buckets.forEach(function (b, i) {
      var barHeight = max > 0 ? Math.round((b[valueKey] / max) * (height - 28)) : 0;
      var x = i * (barWidth + gap);
      var y = height - 20 - barHeight;
      parts.push('<title>' + b.label + ': ' + formatValue(b[valueKey]) + '</title>');
      parts.push('<rect x="' + x + '" y="' + y + '" width="' + Math.max(barWidth, 1) + '" height="' + Math.max(barHeight, 1) + '" fill="var(--yellow)" rx="2"></rect>');
      parts.push('<text x="' + (x + barWidth / 2) + '" y="' + (height - 6) + '" font-size="8" text-anchor="middle" fill="var(--slate)" font-family="var(--font-mono)">' + b.label + '</text>');
    });
    parts.push("</svg>");
    container.innerHTML = parts.join("");
  }

  // Buckets LIVE_JOBS into the last `weeks` calendar weeks (Monday start),
  // by createdAt. Jobs with no createdAt (shouldn't happen once the
  // Supabase mapping is in place, but defensive) are skipped rather than
  // silently mis-bucketed.
  function bucketJobsByWeek(jobs, weeks) {
    var buckets = [];
    var now = new Date();
    for (var i = weeks - 1; i >= 0; i--) {
      var weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - (i * 7) + 1); // Monday of that week
      weekStart.setHours(0, 0, 0, 0);
      var weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      buckets.push({ label: (weekStart.getMonth() + 1) + "/" + weekStart.getDate(), start: weekStart, end: weekEnd, revenue: 0, count: 0 });
    }
    jobs.forEach(function (j) {
      if (!j.createdAt) return;
      var created = new Date(j.createdAt);
      if (isNaN(created.getTime())) return;
      var bucket = buckets.filter(function (b) { return created >= b.start && created < b.end; })[0];
      if (!bucket) return;
      bucket.count += 1;
      var price = parseAedPrice(j.price);
      if (price) bucket.revenue += price;
    });
    return buckets;
  }

  function renderTrendCharts() {
    var weeklyBuckets = bucketJobsByWeek(LIVE_JOBS, 8);
    renderMiniBarChart("trend-revenue-chart", weeklyBuckets, "revenue", function (v) { return "AED " + Math.round(v).toLocaleString("en-US"); });
    renderMiniBarChart("trend-volume-chart", weeklyBuckets, "count", function (v) { return v + " job(s)"; });

    var vendorBuckets = DATA.vendors
      .filter(function (v) { return HIDDEN_VENDOR_NAMES.indexOf(v.name) === -1; })
      .map(function (v) { return { label: v.name.split(" ")[0], count: v.jobs30d || 0 }; });
    renderMiniBarChart("trend-vendor-chart", vendorBuckets, "count", function (v) { return v + " job(s)"; });
  }

  function renderReports() {
    var summaryEl = document.getElementById("reports-summary");
    if (!summaryEl) return;
    summaryEl.innerHTML = "";

    var totalEnquiries = LIVE_JOBS.length;

    var confirmedJobs = LIVE_JOBS.filter(function (j) { return j.stage >= 2; });
    var confirmedValue = confirmedJobs.reduce(function (sum, j) {
      var price = parseAedPrice(j.price);
      return price ? sum + price : sum;
    }, 0);

    // Receivables: invoiced, client hasn't paid yet.
    var receivableJobs = LIVE_JOBS.filter(function (j) { return j.stage === 4; });
    var receivablesValue = receivableJobs.reduce(function (sum, j) {
      var price = parseAedPrice(j.price);
      return price ? sum + price : sum;
    }, 0);

    // Payables: client has paid Dozr, Dozr hasn't paid the vendor yet.
    // Only sums jobs where vendor_cost has actually been entered - see
    // job-detail.html's Financials panel; jobs missing it are called out
    // in the note rather than silently treated as zero.
    var payableJobs = LIVE_JOBS.filter(function (j) { return j.stage === 5; });
    var payableJobsWithCost = payableJobs.filter(function (j) { return j.vendorCost !== null && j.vendorCost !== undefined; });
    var payablesValue = payableJobsWithCost.reduce(function (sum, j) { return sum + j.vendorCost; }, 0);
    var payablesMissingCost = payableJobs.length - payableJobsWithCost.length;

    // Profit: client price minus vendor cost, only for jobs where both are
    // known. Unlike the old version, this is now real where data exists -
    // previously always "—" since vendor_cost didn't exist at all.
    var jobsWithBothFigures = LIVE_JOBS.filter(function (j) {
      return j.vendorCost !== null && j.vendorCost !== undefined && parseAedPrice(j.price) !== null;
    });
    var profitValue = jobsWithBothFigures.reduce(function (sum, j) { return sum + (parseAedPrice(j.price) - j.vendorCost); }, 0);

    // Payment received: money that has actually landed from the client,
    // regardless of whether Dozr has paid the vendor out yet (stage 5 or 6).
    // Distinct from Payables below, which is the same stage-5 jobs viewed
    // from "what we still owe the vendor" instead of "what came in."
    var paidJobs = LIVE_JOBS.filter(function (j) { return j.stage >= 5; });
    var paidValue = paidJobs.reduce(function (sum, j) {
      var price = parseAedPrice(j.price);
      return price ? sum + price : sum;
    }, 0);

    [
      { label: "Enquiries received", value: String(totalEnquiries), note: "All jobs, any stage" },
      { label: "Confirmed work", value: String(confirmedJobs.length), note: "AED " + confirmedValue.toLocaleString("en-US") + " · Approved or later" },
      { label: "Payment received", value: "AED " + paidValue.toLocaleString("en-US"), note: paidJobs.length + " job(s) paid by client" },
      { label: "Receivables", value: "AED " + receivablesValue.toLocaleString("en-US"), note: receivableJobs.length + " job(s) invoiced, awaiting client payment" },
      { label: "Payables", value: "AED " + payablesValue.toLocaleString("en-US"), note: payablesMissingCost > 0
        ? payableJobs.length + " job(s) pending vendor payout · vendor cost missing on " + payablesMissingCost
        : payableJobs.length + " job(s) pending vendor payout" },
      { label: "Profit", value: jobsWithBothFigures.length > 0 ? "AED " + profitValue.toLocaleString("en-US") : "—", note: jobsWithBothFigures.length > 0
        ? "Based on " + jobsWithBothFigures.length + " job(s) with vendor cost entered"
        : "Needs vendor cost entered per job (job-detail.html) - none yet" },
      { label: "VAT (5%) on invoices", value: formatAed(DATA.billing.invoices.reduce(function (sum, inv) {
          var net = parseAedPrice(inv.amount);
          return net ? sum + computeVat(net).vat : sum;
        }, 0)), note: "From Invoice statement below, any status - see Billing for the same figure" }
    ].forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });

    // By pipeline stage: every stage, not just the ones with their own
    // summary card above - full visibility into where the money/jobs
    // currently sit (afzl's ask, 2026-07-22: "all those reports... with
    // amount"). Amount is the client-facing price, same field used
    // everywhere else in Reports - not vendor cost (that's Payables above).
    var stageTbody = document.getElementById("reports-stage-tbody");
    if (stageTbody) {
      stageTbody.innerHTML = "";
      DATA.pipeline.forEach(function (stageName, stageIdx) {
        var jobsAtStage = LIVE_JOBS.filter(function (j) { return j.stage === stageIdx; });
        var stageAmount = jobsAtStage.reduce(function (sum, j) {
          var price = parseAedPrice(j.price);
          return price ? sum + price : sum;
        }, 0);
        stageTbody.appendChild(el("tr", {}, [
          el("td", { text: (stageIdx + 1) + " · " + stageName }),
          el("td", { text: String(jobsAtStage.length) }),
          el("td", { class: "mono", text: "AED " + stageAmount.toLocaleString("en-US") })
        ]));
      });
    }

    var tbody = document.getElementById("reports-vertical-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    ["logistics", "equipment"].forEach(function (v) {
      var jobsInVertical = LIVE_JOBS.filter(function (j) { return jobVertical(j) === v; });
      var enquiries = jobsInVertical.length;
      var confirmedInVertical = jobsInVertical.filter(function (j) { return j.stage >= 2; }).length;
      var revenue = jobsInVertical.reduce(function (sum, j) {
        var price = parseAedPrice(j.price);
        return price ? sum + price : sum;
      }, 0);
      tbody.appendChild(el("tr", {}, [
        el("td", { text: verticalLabel(v) }),
        el("td", { text: String(enquiries) }),
        el("td", { text: String(confirmedInVertical) }),
        el("td", { class: "mono", text: "AED " + revenue.toLocaleString("en-US") })
      ]));
    });

    renderLedger();
    renderInvoiceStatement();
    renderReconciliation();
    renderTrendCharts();
  }

  /* ---------------- CSV export (generic) ---------------- */
  // Reads whatever is currently rendered in a table's thead/tbody, so it
  // always exports exactly what's on screen - filtered and sorted - rather
  // than recomputing a separate export dataset that could drift from the
  // view. Used by Job ledger, Invoice statement, By pipeline stage, and By
  // vertical (afzl's ask, 2026-07-23: filter/sort/download on all reports).
  function csvEscape(value) {
    var str = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }
  function tableToCsvRows(table) {
    var headRow = table.querySelector("thead tr");
    var rows = [Array.prototype.map.call(headRow.children, function (th) {
      return th.textContent.trim();
    })];
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      rows.push(Array.prototype.map.call(tr.children, function (td) { return td.textContent.trim(); }));
    });
    return rows;
  }
  function downloadCsv(filename, rows) {
    var csv = rows.map(function (row) { return row.map(csvEscape).join(","); }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function bindTableDownload(buttonId, tableId, filename) {
    var btn = document.getElementById(buttonId);
    var table = document.getElementById(tableId);
    if (!btn || !table) return;
    btn.addEventListener("click", function () {
      downloadCsv(filename, tableToCsvRows(table));
    });
  }

  /* ---------------- Job ledger (Reports) ---------------- */
  // Line-item statement of every job - filterable by stage/vertical/date,
  // sortable by clicking a column header, downloadable as CSV. Sits above
  // the aggregate "By pipeline stage"/"By vertical" tables in Reports
  // (afzl's ask, 2026-07-23: "act as a expert... all types of statements
  // and reports"). Date filter uses each job's createdAt (mock jobs carry a
  // matching field; live Supabase jobs use their created_at column, mapped
  // in loadJobsFromSupabase()).
  var ledgerSort = { key: "date", dir: "desc" };

  function populateLedgerStageFilter() {
    var select = document.getElementById("ledger-filter-stage");
    if (!select || select.options.length > 1) return; // already populated
    DATA.pipeline.forEach(function (stageName, stageIdx) {
      var opt = document.createElement("option");
      opt.value = String(stageIdx);
      opt.textContent = (stageIdx + 1) + " · " + stageName;
      select.appendChild(opt);
    });
  }

  function ledgerRowValue(job, key) {
    switch (key) {
      case "code": return job.code || "";
      case "client": return job.client || "";
      case "vertical": return verticalLabel(jobVertical(job));
      case "stage": return job.stage;
      case "date": return job.createdAt || "";
      case "price": return parseAedPrice(job.price) || 0;
      case "vendorCost": return job.vendorCost === null || job.vendorCost === undefined ? -1 : job.vendorCost;
      case "profit": {
        var price = parseAedPrice(job.price);
        if (price === null || job.vendorCost === null || job.vendorCost === undefined) return -Infinity;
        return price - job.vendorCost;
      }
      default: return "";
    }
  }

  function renderLedger() {
    var tbody = document.getElementById("ledger-tbody");
    if (!tbody) return;
    populateLedgerStageFilter();

    var stageFilter = document.getElementById("ledger-filter-stage").value;
    var verticalFilter = document.getElementById("ledger-filter-vertical").value;
    var fromDate = document.getElementById("ledger-filter-from").value;
    var toDate = document.getElementById("ledger-filter-to").value;

    var rows = LIVE_JOBS.filter(function (j) {
      if (stageFilter !== "" && j.stage !== Number(stageFilter)) return false;
      if (verticalFilter !== "" && jobVertical(j) !== verticalFilter) return false;
      if (fromDate && (!j.createdAt || j.createdAt < fromDate)) return false;
      if (toDate && (!j.createdAt || j.createdAt > toDate)) return false;
      return true;
    });

    rows.sort(function (a, b) {
      var av = ledgerRowValue(a, ledgerSort.key);
      var bv = ledgerRowValue(b, ledgerSort.key);
      if (av < bv) return ledgerSort.dir === "asc" ? -1 : 1;
      if (av > bv) return ledgerSort.dir === "asc" ? 1 : -1;
      return 0;
    });

    tbody.innerHTML = "";
    if (rows.length === 0) {
      tbody.appendChild(el("tr", {}, [el("td", { colspan: "8", class: "note", text: "No jobs match these filters." })]));
      return;
    }
    rows.forEach(function (j) {
      var price = parseAedPrice(j.price);
      var hasVendorCost = j.vendorCost !== null && j.vendorCost !== undefined;
      var profit = price !== null && hasVendorCost ? price - j.vendorCost : null;
      tbody.appendChild(el("tr", {}, [
        el("td", {}, [el("a", { href: "job-detail.html?job=" + encodeURIComponent(j.code), text: j.code })]),
        el("td", { text: j.client || "—" }),
        el("td", { text: verticalLabel(jobVertical(j)) }),
        el("td", { text: (j.stage + 1) + " · " + DATA.pipeline[j.stage] }),
        el("td", { class: "mono", text: j.createdAt || "—" }),
        el("td", { class: "mono", text: price !== null ? "AED " + price.toLocaleString("en-US") : "—" }),
        el("td", { class: "mono", text: hasVendorCost ? "AED " + j.vendorCost.toLocaleString("en-US") : "—" }),
        el("td", { class: "mono", text: profit !== null ? "AED " + profit.toLocaleString("en-US") : "—" })
      ]));
    });
  }

  function bindSortableHeaders(tableId, onSortChange, sortState) {
    var table = document.getElementById(tableId);
    if (!table) return;
    var headers = Array.prototype.slice.call(table.querySelectorAll("th.sortable"));
    function refreshIndicators() {
      headers.forEach(function (th) {
        if (th.getAttribute("data-sort-key") === sortState.key) {
          th.setAttribute("data-sort-dir", sortState.dir);
        } else {
          th.removeAttribute("data-sort-dir");
        }
      });
    }
    headers.forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-sort-key");
        if (sortState.key === key) {
          sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
        } else {
          sortState.key = key;
          sortState.dir = "asc";
        }
        refreshIndicators();
        onSortChange();
      });
    });
    refreshIndicators();
  }

  function bindLedgerControls() {
    ["ledger-filter-stage", "ledger-filter-vertical", "ledger-filter-from", "ledger-filter-to"].forEach(function (id) {
      var field = document.getElementById(id);
      if (field) field.addEventListener("change", renderLedger);
    });
    var clearBtn = document.getElementById("ledger-filter-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        document.getElementById("ledger-filter-stage").value = "";
        document.getElementById("ledger-filter-vertical").value = "";
        document.getElementById("ledger-filter-from").value = "";
        document.getElementById("ledger-filter-to").value = "";
        renderLedger();
      });
    }
    bindSortableHeaders("ledger-table", renderLedger, ledgerSort);
    bindTableDownload("ledger-download", "ledger-table", "dozr-job-ledger.csv");
  }

  /* ---------------- Invoice statement (Reports) ---------------- */
  // Read-only, filterable/sortable/downloadable view of DATA.billing.invoices
  // - distinct from Billing's own table, which has action buttons (Receipt/
  // Remind) and isn't meant to be exported. This is the "statement" a client
  // or accountant would actually want (afzl's ask, 2026-07-23).
  var invoiceSort = { key: "issued", dir: "desc" };

  function invoiceRowValue(inv, key) {
    switch (key) {
      case "ref": return inv.ref || "";
      case "client": return inv.client || "";
      case "amount": return parseAedPrice(inv.amount) || 0;
      case "vat": { var n1 = parseAedPrice(inv.amount); return n1 ? computeVat(n1).vat : 0; }
      case "total": { var n2 = parseAedPrice(inv.amount); return n2 ? computeVat(n2).total : 0; }
      case "issued": return inv.issued || "";
      case "due": return inv.due || "";
      case "status": return inv.status || "";
      default: return "";
    }
  }

  function renderInvoiceStatement() {
    var tbody = document.getElementById("invoices-statement-tbody");
    if (!tbody) return;
    var statusFilter = document.getElementById("invoices-filter-status").value;

    var rows = DATA.billing.invoices.filter(function (inv) {
      return statusFilter === "" || inv.status === statusFilter;
    });
    rows.sort(function (a, b) {
      var av = invoiceRowValue(a, invoiceSort.key);
      var bv = invoiceRowValue(b, invoiceSort.key);
      if (av < bv) return invoiceSort.dir === "asc" ? -1 : 1;
      if (av > bv) return invoiceSort.dir === "asc" ? 1 : -1;
      return 0;
    });

    tbody.innerHTML = "";
    if (rows.length === 0) {
      tbody.appendChild(el("tr", {}, [el("td", { colspan: "8", class: "note", text: "No invoices match this filter." })]));
      return;
    }
    rows.forEach(function (inv) {
      var tone = inv.status === "Paid" ? "ok" : (inv.status === "Overdue" ? "error" : "neutral");
      var net = parseAedPrice(inv.amount);
      var vatFigures = net !== null ? computeVat(net) : null;
      tbody.appendChild(el("tr", {}, [
        el("td", { class: "mono", text: inv.ref }),
        el("td", { text: inv.client }),
        el("td", { class: "mono", text: inv.amount }),
        el("td", { class: "mono", text: vatFigures ? formatAed(vatFigures.vat) : "—" }),
        el("td", { class: "mono", text: vatFigures ? formatAed(vatFigures.total) : "—" }),
        el("td", { text: inv.issued }),
        el("td", { text: inv.due }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": tone, text: inv.status })])
      ]));
    });
  }

  function bindInvoiceStatementControls() {
    var statusField = document.getElementById("invoices-filter-status");
    if (statusField) statusField.addEventListener("change", renderInvoiceStatement);
    bindSortableHeaders("invoices-table", renderInvoiceStatement, invoiceSort);
    bindTableDownload("invoices-download", "invoices-table", "dozr-invoice-statement.csv");
  }

  /* ---------------- Reconciliation (Reports) ---------------- */
  // Matches every confirmed job's client invoice against its vendor
  // payment, so nothing sits half-settled without someone noticing (afzl's
  // ask, 2026-07-23: "match every invoice I make with every invoice I
  // paid"). Client invoices (DATA.billing.invoices) aren't linked to a job
  // by id yet - Billing is still mock/sample data, not wired to real
  // invoicing (documented elsewhere in this file) - so matching is done by
  // job code appearing in the invoice ref (e.g. "INV-DZR-J-1020" ->
  // "DZR-J-1020"), same convention the seed data already follows. Once
  // Billing reads real Supabase invoices with a job_id column, swap this
  // for a real join.
  function findInvoiceForJob(jobCode) {
    return DATA.billing.invoices.filter(function (inv) { return inv.ref.indexOf(jobCode) !== -1; })[0] || null;
  }

  function reconciliationStatus(clientInvoice, hasVendorCost, vendorPaid) {
    if (!hasVendorCost) {
      return clientInvoice ? { label: "Vendor cost missing", tone: "warn" } : { label: "Not yet invoiced", tone: "neutral" };
    }
    var clientPaid = !!clientInvoice && clientInvoice.status === "Paid";
    if (clientPaid && vendorPaid) return { label: "Reconciled", tone: "ok" };
    if (clientPaid && !vendorPaid) return { label: "Payable outstanding", tone: "warn" };
    if (!clientPaid && vendorPaid) return { label: "Paid vendor before client", tone: "error" };
    return { label: "Awaiting both", tone: "neutral" };
  }

  function renderReconciliation() {
    var tbody = document.getElementById("reconciliation-tbody");
    if (!tbody) return;
    var statusFilter = document.getElementById("reconciliation-filter-status").value;

    // Only confirmed work (Approved onward) has anything to reconcile -
    // matches "Confirmed work" elsewhere in Reports.
    var rows = LIVE_JOBS.filter(function (j) { return j.stage >= 2; }).map(function (j) {
      var clientInvoice = findInvoiceForJob(j.code);
      var hasVendorCost = j.vendorCost !== null && j.vendorCost !== undefined;
      var vendorPaid = j.vendorPaymentStatus === "paid";
      return {
        job: j,
        clientInvoice: clientInvoice,
        hasVendorCost: hasVendorCost,
        vendorPaid: vendorPaid,
        status: reconciliationStatus(clientInvoice, hasVendorCost, vendorPaid)
      };
    });
    if (statusFilter) rows = rows.filter(function (r) { return r.status.label === statusFilter; });

    tbody.innerHTML = "";
    if (rows.length === 0) {
      tbody.appendChild(el("tr", {}, [el("td", { colspan: "8", class: "note", text: "No confirmed jobs match this filter." })]));
      return;
    }
    rows.forEach(function (r) {
      var j = r.job;
      tbody.appendChild(el("tr", {}, [
        el("td", {}, [el("a", { href: "job-detail.html?job=" + encodeURIComponent(j.code), text: j.code })]),
        el("td", { text: j.client || "—" }),
        el("td", { class: "mono", text: r.clientInvoice ? r.clientInvoice.ref : "—" }),
        el("td", {}, r.clientInvoice ? [el("span", { class: "status-chip", "data-tone": r.clientInvoice.status === "Paid" ? "ok" : (r.clientInvoice.status === "Overdue" ? "error" : "neutral"), text: r.clientInvoice.status })] : [el("span", { text: "—" })]),
        el("td", { class: "mono", text: r.hasVendorCost ? formatAed(j.vendorCost) : "—" }),
        el("td", { class: "mono", text: j.vendorInvoiceRef || "—" }),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": r.vendorPaid ? "ok" : "neutral", text: r.hasVendorCost ? (r.vendorPaid ? "Paid" : "Unpaid") : "—" })]),
        el("td", {}, [el("span", { class: "status-chip", "data-tone": r.status.tone, text: r.status.label })])
      ]));
    });
  }

  function bindReconciliationControls() {
    var statusField = document.getElementById("reconciliation-filter-status");
    if (statusField) statusField.addEventListener("change", renderReconciliation);
    bindTableDownload("reconciliation-download", "reconciliation-table", "dozr-reconciliation.csv");
  }

  // Escalations tab (panel-escalations, renderEscalations) was removed
  // 2026-07-22 - the panel markup had no tab pointing at it since the 7→5
  // nav trim, so it was rendering into unreachable DOM on every page load.
  // DATA.escalations stays in ops/data/ops.js if this comes back later.

  function bindClock() {
    var updated = document.getElementById("last-updated");
    if (updated) updated.textContent = DATA.lastUpdated;
  }

  function qsParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ---------------- Job detail page ---------------- */
  // Prefers the live Supabase row (so stage/vendor/price reflect whatever
  // was last set on the Kanban board) and only falls back to mock DATA.jobs
  // documents/timeline, since those aren't modeled in Supabase yet. Before
  // this fix (2026-07-22) this page read DATA.jobs only, so moving a job's
  // stage on Kanban never showed up here - it displayed frozen mock data.
  // Real file upload/view for the 4 standard doc types, backed by the
  // "job-documents" Supabase Storage bucket (see
  // 0011_job_documents_storage.sql - run manually, same as prior
  // migrations this session). Replaces the old label+ref-only text list
  // (afzl's ask, 2026-07-23: document management). Only functional when the
  // job has a live Supabase row (liveRow) - a job needs a real id to save
  // an updated `documents` array against; mock-only jobs fall back to the
  // old static read-only list with a note explaining why upload is off.
  var DOCUMENT_TYPES = ["Quote", "PO", "Invoice", "ePOD"];

  function renderDocumentsPanel(job, liveRow) {
    var docsPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Documents" })]),
      el("div", { class: "panel-body", id: "job-docs" })
    ]);
    var docsBody = docsPanel.querySelector("#job-docs");

    if (!liveRow || typeof supabaseClient === "undefined") {
      if (!job.documents || job.documents.length === 0) {
        docsBody.appendChild(el("div", { class: "empty-state", text: "No documents generated yet." }));
      } else {
        job.documents.forEach(function (d) {
          docsBody.appendChild(el("div", { class: "row-split" }, [
            el("span", { text: d.label }),
            el("span", { class: "mono", text: d.ref })
          ]));
        });
      }
      docsBody.appendChild(el("p", { class: "note", style: "margin-top:8px;width:100%;", text: "Upload isn't available for this job - it isn't in the live system yet." }));
      return docsPanel;
    }

    var currentDocs = Array.isArray(liveRow.documents) ? liveRow.documents.slice() : [];
    function findDoc(label) { return currentDocs.filter(function (d) { return d.label === label; })[0] || null; }

    function renderRows() {
      docsBody.innerHTML = "";
      DOCUMENT_TYPES.forEach(function (label) {
        var doc = findDoc(label);
        var left = el("div", {}, [
          el("div", { style: "font-weight:600;margin-bottom:2px;", text: label }),
          doc
            ? el("a", { href: doc.url, target: "_blank", rel: "noopener", class: "mono", style: "font-size:12px;", text: doc.ref + (doc.uploadedAt ? " · uploaded " + doc.uploadedAt.slice(0, 10) : "") })
            : el("div", { class: "note", text: "Not uploaded yet" })
        ]);
        var fileInput = el("input", { type: "file", style: "max-width:200px;font-size:12px;" });
        var uploadBtn = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: doc ? "Replace" : "Upload" });
        uploadBtn.addEventListener("click", async function () {
          var file = fileInput.files[0];
          if (!file) { showToast("Choose a file first."); return; }
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Uploading...";
          var path = job.code + "/" + label + "-" + Date.now() + "-" + file.name;
          var upRes = await supabaseClient.storage.from("job-documents").upload(path, file, { upsert: true });
          if (upRes.error) {
            showToast("Upload failed - try again.");
            uploadBtn.disabled = false;
            uploadBtn.textContent = doc ? "Replace" : "Upload";
            return;
          }
          var pub = supabaseClient.storage.from("job-documents").getPublicUrl(path);
          var newDoc = { label: label, ref: file.name, path: path, url: pub.data.publicUrl, uploadedAt: new Date().toISOString() };
          currentDocs = currentDocs.filter(function (d) { return d.label !== label; });
          currentDocs.push(newDoc);
          var saveRes = await supabaseClient.from("jobs").update({ documents: currentDocs }).eq("id", liveRow.id);
          if (saveRes.error) {
            showToast("File uploaded but couldn't save to the job record - try again.");
            uploadBtn.disabled = false;
            uploadBtn.textContent = doc ? "Replace" : "Upload";
            return;
          }
          liveRow.documents = currentDocs;
          showToast(label + " uploaded.");
          renderRows();
        });
        docsBody.appendChild(el("div", { class: "row-split", style: "align-items:center;flex-wrap:wrap;gap:8px;" }, [
          left,
          el("div", { style: "display:flex;gap:6px;align-items:center;" }, [fileInput, uploadBtn])
        ]));
      });
    }
    renderRows();
    return docsPanel;
  }

  async function renderJobDetailPage() {
    var code = qsParam("job");
    var root = document.getElementById("job-detail-root");
    var mockJob = DATA.jobs.filter(function (j) { return j.code === code; })[0];

    var liveRow = null;
    if (code && typeof supabaseClient !== "undefined") {
      var result = await supabaseClient.from("jobs").select("*").eq("code", code).maybeSingle();
      if (!result.error && result.data) liveRow = result.data;
    }

    var job = liveRow ? {
      code: liveRow.code,
      client: liveRow.client_name,
      clientContact: liveRow.client_contact,
      vendor: liveRow.vendor_name || (mockJob && mockJob.vendor) || "— unassigned",
      driver: liveRow.driver || (mockJob && mockJob.driver) || "",
      route: liveRow.route,
      type: liveRow.type,
      stage: liveRow.stage,
      price: liveRow.price,
      documents: mockJob ? mockJob.documents : [],
      timeline: mockJob ? mockJob.timeline : []
    } : mockJob;

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

    // Vendor cost is staff-entered here (not on the enquiry form - it isn't
    // known until a vendor is confirmed) and only editable for jobs that
    // exist in Supabase (liveRow). Feeds Reports' Payables/Profit figures,
    // which were blocked without this (added 2026-07-22).
    var financialsPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Financials" })]),
      el("div", { class: "panel-body", id: "job-financials" })
    ]);
    var finBody = financialsPanel.querySelector("#job-financials");
    finBody.appendChild(el("div", { style: "margin-bottom:10px;font-size:13px;", text: "Client price: " + job.price }));
    if (liveRow) {
      var hasCost = liveRow.vendor_cost !== null && liveRow.vendor_cost !== undefined;
      var clientPriceNum = parseAedPrice(job.price);
      var costNote = el("div", { class: "note", style: "width:100%;margin-top:6px;", text: hasCost
        ? (clientPriceNum !== null ? "Profit on this job: AED " + (clientPriceNum - liveRow.vendor_cost).toLocaleString("en-US") : "Vendor cost saved - add a client price to see profit.")
        : "Not yet entered - what Dozr owes the vendor for this job. Feeds Reports' Payables and Profit figures." });
      var costInput = el("input", {
        type: "number", min: "0", step: "1", id: "job-vendor-cost",
        style: "width:140px;border:1px solid var(--line);border-radius:var(--radius-button);padding:8px 10px;font-size:13px;background:var(--canvas);color:var(--ink);"
      });
      if (hasCost) costInput.value = String(liveRow.vendor_cost);
      var saveCostBtn = el("button", { class: "btn btn-primary btn-sm", type: "button", text: "Save" });
      saveCostBtn.addEventListener("click", async function () {
        var raw = costInput.value.trim();
        var val = raw === "" ? null : parseFloat(raw);
        saveCostBtn.disabled = true;
        saveCostBtn.textContent = "Saving...";
        var res = await supabaseClient.from("jobs").update({ vendor_cost: val }).eq("id", liveRow.id);
        saveCostBtn.disabled = false;
        saveCostBtn.textContent = "Save";
        if (res.error) { showToast("Could not save vendor cost - try again."); return; }
        liveRow.vendor_cost = val;
        showToast("Vendor cost saved.");
        if (val !== null && clientPriceNum !== null) {
          costNote.textContent = "Profit on this job: AED " + (clientPriceNum - val).toLocaleString("en-US");
        } else if (val !== null) {
          costNote.textContent = "Vendor cost saved - add a client price to see profit.";
        } else {
          costNote.textContent = "Not yet entered - what Dozr owes the vendor for this job. Feeds Reports' Payables and Profit figures.";
        }
      });
      var costRow = el("div", { class: "row-inline" }, [
        el("label", { class: "field-label", for: "job-vendor-cost", text: "Vendor cost (AED)" }),
        costInput,
        saveCostBtn
      ]);
      finBody.appendChild(costRow);
      finBody.appendChild(costNote);

      // Vendor invoice/payment tracking - the other half of reconciliation
      // (see Reports > Reconciliation). Independent of vendor_cost: cost is
      // "what we owe", this is "have we actually paid it, and what's their
      // invoice number" (afzl's ask, 2026-07-23).
      finBody.appendChild(el("div", { class: "note", style: "width:100%;margin-top:16px;font-weight:600;color:var(--ink);", text: "Vendor invoice" }));
      var vInvoiceRefInput = el("input", {
        type: "text", id: "job-vendor-invoice-ref", placeholder: "Vendor's invoice #",
        style: "width:160px;border:1px solid var(--line);border-radius:var(--radius-button);padding:8px 10px;font-size:13px;background:var(--canvas);color:var(--ink);"
      });
      if (liveRow.vendor_invoice_ref) vInvoiceRefInput.value = liveRow.vendor_invoice_ref;
      var vStatusSelect = el("select", {
        id: "job-vendor-payment-status",
        style: "border:1px solid var(--line);border-radius:var(--radius-button);padding:8px 10px;font-size:13px;background:var(--canvas);color:var(--ink);"
      }, [
        el("option", { value: "unpaid", text: "Unpaid" }),
        el("option", { value: "paid", text: "Paid" })
      ]);
      vStatusSelect.value = liveRow.vendor_payment_status || "unpaid";
      var vPaidAtInput = el("input", { type: "date", id: "job-vendor-paid-at" });
      if (liveRow.vendor_paid_at) vPaidAtInput.value = liveRow.vendor_paid_at;
      var saveVendorInvoiceBtn = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Save" });
      saveVendorInvoiceBtn.addEventListener("click", async function () {
        saveVendorInvoiceBtn.disabled = true;
        saveVendorInvoiceBtn.textContent = "Saving...";
        var payload = {
          vendor_invoice_ref: vInvoiceRefInput.value.trim() || null,
          vendor_payment_status: vStatusSelect.value,
          vendor_paid_at: vStatusSelect.value === "paid" ? (vPaidAtInput.value || null) : null
        };
        var res = await supabaseClient.from("jobs").update(payload).eq("id", liveRow.id);
        saveVendorInvoiceBtn.disabled = false;
        saveVendorInvoiceBtn.textContent = "Save";
        if (res.error) { showToast("Could not save vendor invoice - try again."); return; }
        liveRow.vendor_invoice_ref = payload.vendor_invoice_ref;
        liveRow.vendor_payment_status = payload.vendor_payment_status;
        liveRow.vendor_paid_at = payload.vendor_paid_at;
        showToast("Vendor invoice saved.");
      });
      finBody.appendChild(el("div", { class: "row-inline", style: "margin-top:6px;" }, [
        el("label", { class: "field-label", for: "job-vendor-invoice-ref", text: "Ref" }),
        vInvoiceRefInput,
        el("label", { class: "field-label", for: "job-vendor-payment-status", text: "Status" }),
        vStatusSelect,
        el("label", { class: "field-label", for: "job-vendor-paid-at", text: "Paid on" }),
        vPaidAtInput,
        saveVendorInvoiceBtn
      ]));
    } else {
      finBody.appendChild(el("div", { class: "empty-state", text: "Vendor cost isn't editable for this job - it isn't in the live system yet." }));
    }

    var docsPanel = renderDocumentsPanel(job, liveRow);

    var timelinePanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Activity timeline" })]),
      el("div", { class: "panel-body", id: "job-timeline" })
    ]);
    var timelineBody = timelinePanel.querySelector("#job-timeline");
    (job.timeline || []).forEach(function (t) {
      timelineBody.appendChild(el("div", { class: "row-flow" }, [
        el("span", { class: "mono row-flow-time", text: t.time }),
        el("span", { text: t.note })
      ]));
    });

    root.appendChild(strip);
    root.appendChild(summary);
    root.appendChild(financialsPanel);
    root.appendChild(docsPanel);
    root.appendChild(timelinePanel);
  }

  /* ---------------- Vendor detail page ---------------- */
  // Two data sources: mock demo vendors (DATA.vendors, ids like "V-014")
  // and real Supabase vendors (uuid ids, added via "+ Onboard vendor" or
  // bridged in from equipment-add on a demo vendor). Mock vendors get the
  // full existing layout (jobs history, docs); live Supabase vendors get a
  // simpler company-details panel since that history isn't modeled for
  // them yet. Both get the equipment panel - resolveVendorSupabaseId()
  // already handles either id shape.
  async function renderVendorDetailPage() {
    var id = qsParam("id");
    var mockVendor = DATA.vendors.filter(function (v) { return v.id === id; })[0];
    var root = document.getElementById("vendor-detail-root");

    if (mockVendor) {
      renderMockVendorDetail(mockVendor, root);
      return;
    }

    if (!id || typeof supabaseClient === "undefined") {
      root.appendChild(el("div", { class: "empty-state", text: id ? "No vendor found for " + id + "." : "No vendor specified." }));
      return;
    }

    var result = await supabaseClient.from("vendors").select("*").eq("id", id).maybeSingle();
    if (result.error || !result.data) {
      root.appendChild(el("div", { class: "empty-state", text: "No vendor found for " + id + "." }));
      return;
    }
    renderLiveVendorDetail(result.data, root);
  }

  function renderLiveVendorDetail(vendor, root) {
    document.getElementById("vendor-detail-title").textContent = vendor.name;
    var tone = vendor.active ? "ok" : "neutral";

    var summary = el("section", { class: "summary-grid" }, [
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Status" }), el("div", {}, [el("span", { class: "status-chip", "data-tone": tone, text: vendor.active ? "Active" : "Deactivated" })])]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Plan" }), el("div", { class: "value", style: "font-size:18px;", text: vendor.plan })]),
      el("div", { class: "summary-card" }, [el("div", { class: "label", text: "Joined" }), el("div", { class: "value", style: "font-size:18px;", text: vendor.joined_at || "—" })])
    ]);

    var infoPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Company details" })]),
      el("div", { class: "panel-body" }, [
        el("div", { style: "margin-bottom:6px;", text: "Contact: " + (vendor.contact_name || "—") }),
        el("div", { style: "margin-bottom:6px;", text: "Phone: " + (vendor.phone || "—") }),
        el("div", { style: "margin-bottom:6px;", text: "Email: " + (vendor.email || "—") }),
        el("div", { style: "margin-bottom:6px;", text: "Trade license: " + (vendor.trade_license_no || "—") + (vendor.trade_license_expiry ? " · expires " + vendor.trade_license_expiry : "") }),
        el("div", { text: "Insurance expiry: " + (vendor.insurance_expiry || "—") })
      ])
    ]);

    var equipmentPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [
        el("h2", { text: "Equipment / vehicles" }),
        el("button", { class: "btn btn-primary btn-sm", type: "button", id: "add-equipment-btn" }, [document.createTextNode("+ Add equipment")])
      ]),
      el("div", { class: "panel-body", id: "vendor-equipment" }, [
        el("div", { class: "empty-state", text: "Loading..." })
      ])
    ]);

    root.appendChild(summary);
    root.appendChild(infoPanel);
    root.appendChild(equipmentPanel);

    loadEquipmentForVendor(vendor);
    bindEquipmentModal(vendor);
  }

  function renderMockVendorDetail(vendor, root) {
    document.getElementById("vendor-detail-title").textContent = vendor.name;

    var tone = !vendor.active ? (vendor.pendingApproval ? "neutral" : "error") : (vendor.docsExpiring ? "warn" : "ok");
    var statusLabel = vendor.pendingApproval ? "Pending approval" : (vendor.active ? "Active" : "Deactivated");

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

    var equipmentPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [
        el("h2", { text: "Equipment / vehicles" }),
        el("button", { class: "btn btn-primary btn-sm", type: "button", id: "add-equipment-btn" }, [document.createTextNode("+ Add equipment")])
      ]),
      el("div", { class: "panel-body", id: "vendor-equipment" }, [
        el("div", { class: "empty-state", text: "Loading..." })
      ])
    ]);

    root.appendChild(summary);
    root.appendChild(infoPanel);
    root.appendChild(docsPanel);
    root.appendChild(jobsPanel);
    root.appendChild(equipmentPanel);

    loadEquipmentForVendor(vendor);
    bindEquipmentModal(vendor);
  }

  /* ---------------- Equipment (Supabase) ---------------- */
  // Vendor rows added via "+ Onboard vendor" already have a real Supabase
  // id (uuid). Legacy demo vendors (V-014 etc.) don't exist in Supabase yet
  // - resolveVendorSupabaseId() finds-or-creates a matching row by name so
  // equipment can still be attached to them without a separate migration.
  var currentVendorSupabaseId = null;

  function isUuid(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || "");
  }

  async function resolveVendorSupabaseId(vendor) {
    if (isUuid(vendor.id)) return vendor.id;
    var found = await supabaseClient.from("vendors").select("id").eq("name", vendor.name).maybeSingle();
    if (found.data) return found.data.id;
    var inserted = await supabaseClient.from("vendors").insert({
      name: vendor.name,
      phone: vendor.phone || null,
      plan: "standard",
      active: !!vendor.active
    }).select("id").single();
    if (inserted.error) { console.error("resolveVendorSupabaseId:", inserted.error); return null; }
    return inserted.data.id;
  }

  function equipmentAvailabilityTone(status) {
    return status; // status values already match CSS data-tone names
  }

  async function loadEquipmentForVendor(vendor) {
    var wrap = document.getElementById("vendor-equipment");
    if (!wrap || typeof supabaseClient === "undefined") return;
    currentVendorSupabaseId = await resolveVendorSupabaseId(vendor);
    if (!currentVendorSupabaseId) {
      wrap.innerHTML = "";
      wrap.appendChild(el("div", { class: "empty-state", text: "Could not load equipment - try refreshing." }));
      return;
    }
    var result = await supabaseClient
      .from("equipment")
      .select("*")
      .eq("vendor_id", currentVendorSupabaseId)
      .order("created_at", { ascending: false });
    wrap.innerHTML = "";
    if (result.error) {
      wrap.appendChild(el("div", { class: "empty-state", text: "Could not load equipment - try refreshing." }));
      return;
    }
    if (result.data.length === 0) {
      wrap.appendChild(el("div", { class: "empty-state", text: "No equipment added yet." }));
      return;
    }
    result.data.forEach(function (eq) {
      var card = el("div", { class: "equipment-card", "data-equipment-id": eq.id });
      var imageUrl = (eq.images && eq.images[0]) || null;
      if (imageUrl) {
        card.appendChild(el("img", { class: "equipment-thumb", src: imageUrl, alt: eq.name }));
      } else {
        card.appendChild(el("div", { class: "equipment-thumb-placeholder", text: "No photo" }));
      }
      var body = el("div", { class: "equipment-body" }, [
        el("div", { class: "equipment-title", text: eq.name }),
        el("div", { class: "equipment-meta", text: eq.category + (eq.plate_or_asset_id ? " · " + eq.plate_or_asset_id : "") })
      ]);
      var select = el("select", { class: "availability-select", "data-tone": eq.availability_status, "data-equipment-id": eq.id }, [
        el("option", { value: "available", text: "Available" }),
        el("option", { value: "on_job", text: "On job" }),
        el("option", { value: "maintenance", text: "Maintenance" })
      ]);
      select.value = eq.availability_status;
      select.addEventListener("change", async function () {
        var newStatus = select.value;
        select.disabled = true;
        var updateResult = await supabaseClient.from("equipment").update({ availability_status: newStatus }).eq("id", eq.id);
        select.disabled = false;
        if (updateResult.error) {
          showToast("Could not update availability - try again.");
          select.value = eq.availability_status;
          return;
        }
        eq.availability_status = newStatus;
        select.setAttribute("data-tone", newStatus);
        showToast(eq.name + " marked " + newStatus.replace("_", " ") + ".");
      });
      var deleteBtn = el("button", { class: "btn btn-ghost btn-sm", type: "button", style: "color:var(--error);margin-top:6px;", text: "Delete" });
      deleteBtn.addEventListener("click", async function () {
        if (!window.confirm("Delete " + eq.name + "? This can't be undone.")) return;
        deleteBtn.disabled = true;
        var res = await supabaseClient.from("equipment").delete().eq("id", eq.id);
        if (res.error) { showToast("Could not delete - try again."); deleteBtn.disabled = false; return; }
        showToast(eq.name + " deleted.");
        loadEquipmentForVendor(vendor);
      });

      body.appendChild(select);
      body.appendChild(deleteBtn);
      card.appendChild(body);
      wrap.appendChild(card);
    });
  }

  function bindEquipmentModal(vendor) {
    var overlay = document.getElementById("equipment-modal-overlay");
    var openBtn = document.getElementById("add-equipment-btn");
    if (!overlay || !openBtn) return;
    bindModalFocusTrap(overlay);
    var closeBtn = document.getElementById("equipment-modal-close");
    var cancelBtn = document.getElementById("equipment-modal-cancel");
    var form = document.getElementById("equipment-form");
    var errorEl = document.getElementById("equipment-form-error");
    var submitBtn = document.getElementById("equipment-form-submit");

    function openModal() {
      overlay.hidden = false;
      errorEl.hidden = true;
      form.reset();
      document.getElementById("ef-name").focus();
    }
    function closeModal() { overlay.hidden = true; }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeModal(); });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var name = document.getElementById("ef-name").value.trim();
      if (!name) {
        errorEl.textContent = "Name / description is required.";
        errorEl.hidden = false;
        return;
      }
      if (!currentVendorSupabaseId) {
        errorEl.textContent = "Vendor not ready yet - try again in a moment.";
        errorEl.hidden = false;
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Adding...";

      var images = [];
      var fileInput = document.getElementById("ef-image");
      var file = fileInput.files[0];
      if (file) {
        var path = currentVendorSupabaseId + "/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        var upload = await supabaseClient.storage.from("equipment-images").upload(path, file);
        if (upload.error) {
          errorEl.textContent = "Image upload failed: " + upload.error.message;
          errorEl.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = "Add equipment";
          return;
        }
        var publicUrl = supabaseClient.storage.from("equipment-images").getPublicUrl(path);
        images.push(publicUrl.data.publicUrl);
      }

      var payload = {
        vendor_id: currentVendorSupabaseId,
        category: document.getElementById("ef-category").value,
        name: name,
        plate_or_asset_id: document.getElementById("ef-plate").value.trim() || null,
        availability_status: document.getElementById("ef-availability").value,
        notes: document.getElementById("ef-notes").value.trim() || null,
        images: images
      };
      var result = await supabaseClient.from("equipment").insert(payload);
      submitBtn.disabled = false;
      submitBtn.textContent = "Add equipment";
      if (result.error) {
        errorEl.textContent = result.error.message || "Could not add equipment - try again.";
        errorEl.hidden = false;
        return;
      }
      closeModal();
      showToast(name + " added.");
      loadEquipmentForVendor(vendor);
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    var page = document.body.getAttribute("data-page");
    bindClock();
    if (page === "job-detail") {
      await renderJobDetailPage();
      return;
    }
    if (page === "vendor-detail") {
      renderVendorDetailPage();
      return;
    }
    bindTabs();
    activateTabFromHash();
    bindVendorModal();
    bindVendorDelete();
    bindAssetModal();
    bindJobModal();
    bindJobsViewToggle();
    renderAssets();
    renderVendors();
    renderBilling();
    bindLedgerControls();
    bindInvoiceStatementControls();
    bindReconciliationControls();
    bindTableDownload("stage-download", "reports-stage-table", "dozr-by-pipeline-stage.csv");
    bindTableDownload("vertical-download", "reports-vertical-table", "dozr-by-vertical.csv");

    // Enquiries summary/Kanban/Reports/Billing's commission card all read
    // LIVE_JOBS - load once, then render everything off the same fetch
    // instead of each firing its own query. Billing is rendered twice (once
    // above for the static invoice table, again here) since its Commission
    // card needs LIVE_JOBS, which isn't ready until this resolves.
    await loadJobsFromSupabase();
    renderEnquiries();
    renderJobs();
    renderJobsKanban();
    renderReports();
    renderBilling();
    renderDashboardTasks();
  });
})();
