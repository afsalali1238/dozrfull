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
        vendorCost: row.vendor_cost
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

  /* ---------------- Enquiries summary (lives at the top of the Kanban tab) ---------------- */
  // Was its own tab; merged into Kanban since "Quote Requested" is already
  // the first Kanban column - a separate list of the same jobs was
  // redundant (afzl's call, 2026-07-22).
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

  // Stage numbers reference the 7-stage pipeline: 0 Quote Requested,
  // 1 Quote Sent, 2 Approved, 3 Work Completed, 4 Invoiced,
  // 5 Payment Received, 6 Vendor Paid.
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

    [
      { label: "Enquiries received", value: String(totalEnquiries), note: "All jobs, any stage" },
      { label: "Confirmed work", value: String(confirmedJobs.length), note: "AED " + confirmedValue.toLocaleString("en-US") + " · Approved or later" },
      { label: "Receivables", value: "AED " + receivablesValue.toLocaleString("en-US"), note: receivableJobs.length + " job(s) invoiced, awaiting client payment" },
      { label: "Payables", value: "AED " + payablesValue.toLocaleString("en-US"), note: payablesMissingCost > 0
        ? payableJobs.length + " job(s) pending vendor payout · vendor cost missing on " + payablesMissingCost
        : payableJobs.length + " job(s) pending vendor payout" },
      { label: "Profit", value: jobsWithBothFigures.length > 0 ? "AED " + profitValue.toLocaleString("en-US") : "—", note: jobsWithBothFigures.length > 0
        ? "Based on " + jobsWithBothFigures.length + " job(s) with vendor cost entered"
        : "Needs vendor cost entered per job (job-detail.html) - none yet" }
    ].forEach(function (item) {
      summaryEl.appendChild(el("div", { class: "summary-card" }, [
        el("div", { class: "label", text: item.label }),
        el("div", { class: "value", text: item.value }),
        el("div", { class: "note", text: item.note })
      ]));
    });

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
    } else {
      finBody.appendChild(el("div", { class: "empty-state", text: "Vendor cost isn't editable for this job - it isn't in the live system yet." }));
    }

    var docsPanel = el("section", { class: "panel" }, [
      el("div", { class: "panel-header" }, [el("h2", { text: "Documents" })]),
      el("div", { class: "panel-body", id: "job-docs" })
    ]);
    var docsBody = docsPanel.querySelector("#job-docs");
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
    bindVendorModal();
    bindVendorDelete();
    bindAssetModal();
    bindJobModal();
    bindJobsViewToggle();
    renderAssets();
    renderVendors();
    renderBilling();

    // Enquiries summary/Kanban/Reports all read LIVE_JOBS - load once, then
    // render all three off the same fetch instead of each firing its own query.
    await loadJobsFromSupabase();
    renderEnquiries();
    renderJobs();
    renderJobsKanban();
    renderReports();
  });
})();
