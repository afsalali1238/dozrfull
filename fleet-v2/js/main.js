(function () {
  "use strict";

  var FLEET = window.DOZR_FLEET;
  if (!FLEET) return;

  var state = {
    selectedAssetId: null,
    statusFilter: null,
    searchText: "",
    zoom: 1
  };

  function markerCategory(asset) {
    var hasCritical = asset.alerts.some(function (a) { return a.severity === "critical"; });
    if (hasCritical) return "Alert";
    return asset.status;
  }

  function statusDataAttr(category) {
    return category.toLowerCase();
  }

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "class") node.className = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function findAsset(id) {
    return FLEET.assets.find(function (a) { return a.id === id; });
  }

  function tickClock() {
    var clockEl = document.getElementById("clock");
    if (!clockEl) return;
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    clockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  }

  function renderStatsBar() {
    var bar = document.getElementById("stats-bar");
    if (!bar) return;
    var s = FLEET.summary;
    var cards = [
      { label: "Active Assets", value: s.activeAssets, sub: "Operating right now" },
      { label: "Engine Hrs Today", value: s.engineHoursToday, sub: "Across active fleet" },
      { label: "Fuel Today", value: s.fuelToday, sub: "Consumed since 00:00" },
      { label: "Active Alerts", value: s.activeAlerts, sub: "Needs attention" },
      { label: "Maintenance Due", value: s.maintenanceDue, sub: "This week" }
    ];
    bar.innerHTML = cards.map(function (c) {
      return '<div class="stat-card"><div class="eyebrow">' + c.label + '</div><strong>' + c.value + '</strong><span>' + c.sub + '</span></div>';
    }).join("");
  }

  function renderAssetList() {
    var list = document.getElementById("asset-list");
    var count = document.getElementById("asset-count");
    if (!list) return;
    var q = state.searchText.trim().toLowerCase();
    var assets = FLEET.assets.filter(function (a) {
      if (!q) return true;
      return a.name.toLowerCase().indexOf(q) !== -1 || a.id.toLowerCase().indexOf(q) !== -1;
    });
    if (count) count.textContent = FLEET.assets.length;

    list.innerHTML = assets.map(function (a) {
      var cat = markerCategory(a);
      var statusAttr = a.status.toLowerCase();
      var selected = a.id === state.selectedAssetId ? " selected" : "";
      var fillColor = a.fuelLevel < 20 ? "var(--error)" : (a.fuelLevel < 40 ? "var(--yellow-dark)" : "var(--green)");
      return (
        '<div class="asset-item' + selected + '" role="listitem">' +
          '<button type="button" data-asset-id="' + a.id + '">' +
            '<div class="meta">' +
              '<span class="title"><span class="status-dot" data-status="' + statusDataAttr(cat) + '" aria-hidden="true"></span>' + a.name + '</span>' +
              '<span class="status-chip" data-status="' + statusAttr + '">' + a.status + '</span>' +
            '</div>' +
            '<div style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate);margin-top:2px">' + a.id + ' - ' + a.site + '</div>' +
            '<div class="fuel-mini">' +
              '<div class="bar-track"><div class="bar-fill" style="width:' + a.fuelLevel + '%;background:' + fillColor + '"></div></div>' +
              '<span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate)">' + a.fuelLevel + '%</span>' +
            '</div>' +
          '</button>' +
        '</div>'
      );
    }).join("") || '<p style="padding:8px;color:var(--slate);font-size:12px">No assets match your search.</p>';

    list.querySelectorAll("button[data-asset-id]").forEach(function (btn) {
      btn.addEventListener("click", function () { selectAsset(btn.getAttribute("data-asset-id")); });
    });
  }

  function renderSiteList() {
    var list = document.getElementById("site-list");
    if (!list) return;
    list.innerHTML = FLEET.sites.map(function (s) {
      return (
        '<div class="site-item" role="listitem">' +
          '<div class="meta"><span>' + s.name + '</span><span style="font-family:var(--font-mono);font-size:10.5px;color:var(--slate)">' + s.assetCount + '</span></div>' +
        '</div>'
      );
    }).join("");
  }

  function renderMapMarkers() {
    var layer = document.getElementById("map-markers");
    if (!layer) return;
    layer.innerHTML = "";
    FLEET.assets.forEach(function (a) {
      var cat = markerCategory(a);
      var hidden = state.statusFilter && cat !== state.statusFilter;
      var btn = el("button", {
        type: "button",
        class: "map-marker" + (hidden ? " is-hidden" : ""),
        "data-status": statusDataAttr(cat),
        "data-asset-id": a.id,
        "data-selected": a.id === state.selectedAssetId ? "true" : "false",
        style: "left:" + a.mapPosition.x + "%;top:" + a.mapPosition.y + "%",
        "aria-label": a.name + ", " + a.status
      }, '<span class="dot" aria-hidden="true"></span>' + a.id);
      btn.addEventListener("click", function () { selectAsset(a.id); });
      layer.appendChild(btn);
    });
  }

  function selectAsset(id) {
    state.selectedAssetId = id;
    document.querySelectorAll(".asset-item").forEach(function (item) {
      var btn = item.querySelector("button[data-asset-id]");
      item.classList.toggle("selected", !!btn && btn.getAttribute("data-asset-id") === id);
    });
    document.querySelectorAll(".map-marker").forEach(function (marker) {
      marker.setAttribute("data-selected", marker.getAttribute("data-asset-id") === id ? "true" : "false");
    });
    renderDetail(findAsset(id));
  }

  function gaugePercent(kind, value) {
    if (kind === "coolant") return Math.max(0, Math.min(100, ((value - 60) / (110 - 60)) * 100));
    return Math.max(0, Math.min(100, (value / 450) * 100));
  }

  function gaugeColor(kind, value) {
    if (kind === "coolant") return value >= 95 ? "var(--error)" : (value >= 88 ? "var(--yellow-dark)" : "var(--green)");
    return value <= 150 ? "var(--error)" : (value <= 250 ? "var(--yellow-dark)" : "var(--green)");
  }

  function renderDetail(asset) {
    var panel = document.getElementById("detail-panel");
    if (!panel) return;
    if (!asset) {
      panel.innerHTML = '<div class="d-empty"><p>Click an asset to inspect</p></div>';
      return;
    }
    var statusAttr = asset.status.toLowerCase();
    var maintAttr = asset.maintenanceStatus.toLowerCase();
    var coolantPct = gaugePercent("coolant", asset.can.coolantTemp);
    var oilPct = gaugePercent("oil", asset.can.oilPressure);
    var coolantColor = gaugeColor("coolant", asset.can.coolantTemp);
    var oilColor = gaugeColor("oil", asset.can.oilPressure);

    var alertsHtml = asset.alerts.length
      ? asset.alerts.map(function (a) {
          return '<div class="event-item" data-severity="' + a.severity + '"><div><strong style="display:block;font-size:11.5px">' + a.description + '</strong><span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate)">' + a.code + '</span></div></div>';
        }).join("")
      : '<p style="color:var(--slate);font-size:11.5px">No active alerts.</p>';

    var routeNote = asset.trips && asset.trips.length
      ? '<button type="button" class="btn btn-secondary" id="detail-route-replay" style="width:100%;margin-top:4px">View Route Replay</button>'
      : "";

    panel.innerHTML =
      '<div class="detail-card">' +
        '<div>' +
          '<div style="font-family:var(--font-mono);font-size:10px;color:var(--yellow-dark)">' + asset.id + '</div>' +
          '<h3>' + asset.name + '</h3>' +
          '<div style="color:var(--slate);font-size:11px;margin-bottom:8px">' + asset.type + ' - ' + asset.site + '</div>' +
          '<span class="status-chip" data-status="' + statusAttr + '">' + asset.status + '</span>' +
        '</div>' +
        '<div class="detail-grid">' +
          '<div class="mini"><span>Fuel</span><strong>' + asset.fuelLevel + '%</strong></div>' +
          '<div class="mini"><span>RPM</span><strong>' + asset.rpm + '</strong></div>' +
          '<div class="mini"><span>Engine Load</span><strong>' + asset.engineLoad + '%</strong></div>' +
          '<div class="mini"><span>Engine Hours</span><strong>' + asset.engineHours + 'h</strong></div>' +
        '</div>' +
        '<div class="can-gauges">' +
          '<div class="gauge"><div class="gauge-circle" style="background:conic-gradient(' + coolantColor + ' 0% ' + coolantPct + '%, var(--line) ' + coolantPct + '% 100%)"><span class="gauge-value">' + asset.can.coolantTemp + 'C</span></div><span class="gauge-label">Coolant</span></div>' +
          '<div class="gauge"><div class="gauge-circle" style="background:conic-gradient(' + oilColor + ' 0% ' + oilPct + '%, var(--line) ' + oilPct + '% 100%)"><span class="gauge-value">' + asset.can.oilPressure + '</span></div><span class="gauge-label">Oil kPa</span></div>' +
        '</div>' +
        '<div>' +
          '<h4 style="margin-bottom:6px">Maintenance</h4>' +
          '<span class="status-chip" data-status="' + maintAttr + '">' + asset.maintenanceStatus + '</span>' +
        '</div>' +
        '<div>' +
          '<h4 style="margin-bottom:6px">Alerts</h4>' +
          alertsHtml +
        '</div>' +
        routeNote +
      '</div>';

    var replayBtn = document.getElementById("detail-route-replay");
    if (replayBtn) {
      replayBtn.addEventListener("click", function () {
        openTripModal(asset.id);
      });
    }
  }

  function applyStatusFilter(next) {
    state.statusFilter = state.statusFilter === next ? null : next;
    document.querySelectorAll(".map-legend button[data-filter]").forEach(function (btn) {
      var f = btn.getAttribute("data-filter");
      btn.setAttribute("aria-pressed", f && f === state.statusFilter ? "true" : "false");
    });
    renderMapMarkers();
  }

  function bindLegend() {
    document.querySelectorAll(".map-legend button[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () { applyStatusFilter(btn.getAttribute("data-filter")); });
    });
    var clear = document.getElementById("filter-clear");
    if (clear) clear.addEventListener("click", function () {
      state.statusFilter = null;
      document.querySelectorAll(".map-legend button[data-filter]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", "false");
      });
      renderMapMarkers();
    });
  }

  function applyZoom() {
    var layer = document.getElementById("map-zoom-layer");
    if (layer) layer.style.transform = "scale(" + state.zoom + ")";
  }

  function bindZoom() {
    var zoomIn = document.getElementById("zoom-in");
    var zoomOut = document.getElementById("zoom-out");
    var zoomReset = document.getElementById("zoom-reset");
    if (zoomIn) zoomIn.addEventListener("click", function () { state.zoom = Math.min(2.2, +(state.zoom + 0.25).toFixed(2)); applyZoom(); });
    if (zoomOut) zoomOut.addEventListener("click", function () { state.zoom = Math.max(0.6, +(state.zoom - 0.25).toFixed(2)); applyZoom(); });
    if (zoomReset) zoomReset.addEventListener("click", function () { state.zoom = 1; applyZoom(); });
  }

  function renderAlertFeed() {
    var feed = document.getElementById("alert-feed");
    if (!feed) return;
    feed.innerHTML = FLEET.alertsFeed.map(function (a) {
      return (
        '<div class="event-item" data-severity="' + a.severity + '">' +
          '<div><strong style="display:block;font-size:12px">' + a.description + '</strong><span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate)">' + a.assetId + ' - ' + a.code + '</span></div>' +
          '<span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate);white-space:nowrap">' + a.time + '</span>' +
        '</div>'
      );
    }).join("");
  }

  function renderEventLog() {
    var log = document.getElementById("event-log");
    if (!log) return;
    log.innerHTML = FLEET.events.map(function (ev) {
      return (
        '<div class="event-item" data-action="' + ev.action + '">' +
          '<div><strong style="display:block;font-size:12px">' + ev.assetId + ' ' + ev.action.toUpperCase() + ' ' + ev.zone + '</strong></div>' +
          '<span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate);white-space:nowrap">' + ev.time + '</span>' +
        '</div>'
      );
    }).join("");
  }

  function bindTabs() {
    var tabAlerts = document.getElementById("tab-alerts");
    var tabEvents = document.getElementById("tab-events");
    var panelAlerts = document.getElementById("tabpanel-alerts");
    var panelEvents = document.getElementById("tabpanel-events");
    if (!tabAlerts || !tabEvents) return;
    function activate(tab) {
      var isAlerts = tab === "alerts";
      tabAlerts.setAttribute("aria-selected", isAlerts ? "true" : "false");
      tabEvents.setAttribute("aria-selected", isAlerts ? "false" : "true");
      panelAlerts.hidden = !isAlerts;
      panelEvents.hidden = isAlerts;
    }
    tabAlerts.addEventListener("click", function () { activate("alerts"); });
    tabEvents.addEventListener("click", function () { activate("events"); });
  }

  function bindSearch() {
    var input = document.getElementById("global-search");
    if (!input) return;
    input.addEventListener("input", function () {
      state.searchText = input.value;
      renderAssetList();
    });
  }

  function bindAlertBadge() {
    var btn = document.getElementById("alert-badge-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var tabAlerts = document.getElementById("tab-alerts");
      if (tabAlerts) tabAlerts.click();
      var panel = document.getElementById("alerts-panel");
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function bindNavToggle() {
    var toggle = document.getElementById("nav-toggle");
    var sidebar = document.getElementById("app-sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", function () {
      var open = sidebar.getAttribute("data-open") === "true";
      sidebar.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  var tripAssets = FLEET.assets.filter(function (a) { return a.trips && a.trips.length; });
  var tripState = { assetId: null, trip: null, pct: 0, playing: false, timer: null };

  function timeToMinutes(t) {
    var parts = t.split(":");
    return (+parts[0]) * 60 + (+parts[1]);
  }

  function minutesToTime(m) {
    m = Math.round(m);
    var h = Math.floor(m / 60) % 24;
    var mi = m % 60;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return pad(h) + ":" + pad(mi);
  }

  function pointAtPercent(route, pct) {
    var idx = (pct / 100) * (route.length - 1);
    var base = Math.floor(idx);
    var frac = idx - base;
    var p0 = route[base];
    var p1 = route[Math.min(base + 1, route.length - 1)];
    return { x: p0.x + (p1.x - p0.x) * frac, y: p0.y + (p1.y - p0.y) * frac };
  }

  function populateTripVehicleSelect() {
    var select = document.getElementById("trip-vehicle-select");
    if (!select) return;
    select.innerHTML = tripAssets.map(function (a) {
      return '<option value="' + a.id + '">' + a.id + ' - ' + a.name + '</option>';
    }).join("");
  }

  function renderTripRoute(trip) {
    var g = document.getElementById("trip-route-group");
    if (!g) return;
    if (!trip) { g.innerHTML = ""; return; }
    var pathD = trip.route.map(function (p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y; }).join(" ");
    var pointsHtml = trip.route.map(function (p, i) {
      var color = i === 0 ? "var(--green)" : (i === trip.route.length - 1 ? "var(--error)" : "var(--surface)");
      return '<circle class="route-point" cx="' + p.x + '" cy="' + p.y + '" r="1.4" fill="' + color + '"></circle>';
    }).join("");
    g.innerHTML = '<path class="route-path" d="' + pathD + '"></path>' + pointsHtml +
      '<circle id="trip-marker" cx="' + trip.route[0].x + '" cy="' + trip.route[0].y + '" r="1.8" fill="var(--ink)"></circle>';
  }

  function loadTrip(assetId) {
    var asset = findAsset(assetId);
    var panel = document.getElementById("trip-details-panel");
    if (!asset || !asset.trips || !asset.trips.length) {
      tripState.assetId = null;
      tripState.trip = null;
      if (panel) panel.innerHTML = "<p>No trip data for this vehicle yet.</p>";
      renderTripRoute(null);
      return;
    }
    var trip = asset.trips[0];
    tripState.assetId = assetId;
    tripState.trip = trip;
    stopTripPlayback();

    var dateInput = document.getElementById("trip-date-select");
    if (dateInput) dateInput.value = trip.date;
    if (panel) {
      panel.innerHTML =
        '<div style="margin-bottom:6px"><strong style="font-family:var(--font-heading);font-size:14px">' + trip.distance + '</strong></div>' +
        '<div>Start ' + trip.startTime + ' - End ' + trip.endTime + '</div>';
    }
    var startEl = document.getElementById("trip-start-time");
    var endEl = document.getElementById("trip-end-time");
    if (startEl) startEl.textContent = trip.startTime;
    if (endEl) endEl.textContent = trip.endTime;
    renderTripRoute(trip);
    setScrubberPercent(0);
  }

  function setScrubberPercent(pct) {
    pct = Math.max(0, Math.min(100, pct));
    tripState.pct = pct;
    var fill = document.getElementById("trip-scrubber-fill");
    var handle = document.getElementById("trip-scrubber-handle");
    if (fill) fill.style.width = pct + "%";
    if (handle) handle.style.left = pct + "%";
    var trip = tripState.trip;
    if (!trip) return;
    var startMin = timeToMinutes(trip.startTime);
    var endMin = timeToMinutes(trip.endTime);
    var currentEl = document.getElementById("trip-current-time");
    if (currentEl) currentEl.textContent = minutesToTime(startMin + (endMin - startMin) * (pct / 100));
    var marker = document.getElementById("trip-marker");
    if (marker) {
      var pos = pointAtPercent(trip.route, pct);
      marker.setAttribute("cx", pos.x);
      marker.setAttribute("cy", pos.y);
    }
    if (pct >= 100) stopTripPlayback();
  }

  function stopTripPlayback() {
    tripState.playing = false;
    if (tripState.timer) { clearInterval(tripState.timer); tripState.timer = null; }
    var btn = document.getElementById("trip-play-btn");
    if (btn) btn.textContent = "Play";
  }

  function toggleTripPlayback() {
    if (!tripState.trip) return;
    if (tripState.playing) { stopTripPlayback(); return; }
    if (tripState.pct >= 100) tripState.pct = 0;
    tripState.playing = true;
    var btn = document.getElementById("trip-play-btn");
    if (btn) btn.textContent = "Pause";
    tripState.timer = setInterval(function () {
      setScrubberPercent(tripState.pct + 1);
    }, 80);
  }

  function openTripModal(assetId) {
    var modal = document.getElementById("trip-history-modal");
    var select = document.getElementById("trip-vehicle-select");
    if (!modal) return;
    var target = assetId && findAsset(assetId) && findAsset(assetId).trips && findAsset(assetId).trips.length
      ? assetId
      : (tripAssets[0] && tripAssets[0].id);
    if (target) {
      if (select) select.value = target;
      loadTrip(target);
    }
    modal.showModal();
  }

  function bindTripModal() {
    var modal = document.getElementById("trip-history-modal");
    if (!modal) return;
    var openBtn = document.getElementById("route-replay-btn");
    var closeBtn = document.getElementById("trip-modal-close");
    var select = document.getElementById("trip-vehicle-select");
    var playBtn = document.getElementById("trip-play-btn");
    var track = document.getElementById("trip-scrubber-track");

    populateTripVehicleSelect();

    if (openBtn) openBtn.addEventListener("click", function () { openTripModal(state.selectedAssetId); });
    if (closeBtn) closeBtn.addEventListener("click", function () { stopTripPlayback(); modal.close(); });
    if (select) select.addEventListener("change", function () { loadTrip(select.value); });
    if (playBtn) playBtn.addEventListener("click", toggleTripPlayback);
    if (track) track.addEventListener("click", function (e) {
      var rect = track.getBoundingClientRect();
      var pct = ((e.clientX - rect.left) / rect.width) * 100;
      stopTripPlayback();
      setScrubberPercent(pct);
    });
  }

  function renderFuelPage() {
    var summary = document.getElementById("fuel-summary");
    if (summary && FLEET.fuel) {
      summary.innerHTML = FLEET.fuel.summary.map(function (card) {
        return '<div class="summary-card"><div class="eyebrow">' + card.label + '</div><strong>' + card.value + '</strong><span>' + card.note + '</span></div>';
      }).join("");
    }
    var cards = document.getElementById("fuel-cards");
    if (cards && FLEET.fuel) {
      cards.innerHTML = FLEET.fuel.assets.map(function (asset) {
        var color = asset.level < 25 ? "var(--error)" : (asset.level < 45 ? "var(--yellow-dark)" : "var(--green)");
        var statusAttr = asset.status.toLowerCase();
        return (
          '<div class="panel metric-card">' +
            '<div class="panel-header"><h3>' + asset.name + '</h3><span class="status-chip" data-status="' + statusAttr + '">' + asset.status + '</span></div>' +
            '<div class="panel-body">' +
              '<div class="metric-line"><span>' + asset.id + '</span><span>' + asset.level + '%</span></div>' +
              '<div class="bar-track"><div class="bar-fill" style="width:' + asset.level + '%;background:' + color + '"></div></div>' +
              '<div class="metric-line"><span>Burn rate</span><span>' + asset.rate + '</span></div>' +
              '<div class="metric-line"><span>Last refill</span><span>' + asset.refuel + '</span></div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
  }

  function renderMaintenancePage() {
    var summary = document.getElementById("maintenance-summary");
    if (summary && FLEET.maintenance) {
      summary.innerHTML = FLEET.maintenance.summary.map(function (card) {
        return '<div class="summary-card"><div class="eyebrow">' + card.label + '</div><strong>' + card.value + '</strong><span>' + card.note + '</span></div>';
      }).join("");
    }
    var body = document.getElementById("maintenance-table-body");
    if (body && FLEET.maintenance) {
      body.innerHTML = FLEET.maintenance.items.map(function (item) {
        var statusAttr = item.status.toLowerCase();
        return '<tr><td>' + item.asset + '</td><td>' + item.type + '</td><td>' + item.service + '</td><td>' + item.due + '</td><td><span class="status-chip" data-status="' + statusAttr + '">' + item.status + '</span></td><td><button class="btn btn-secondary" type="button">' + item.action + '</button></td></tr>';
      }).join("");
    }
  }

  function renderGeofencesPage() {
    var summary = document.getElementById("geofences-summary");
    if (summary && FLEET.geofences) {
      summary.innerHTML = FLEET.geofences.summary.map(function (card) {
        return '<div class="summary-card"><div class="eyebrow">' + card.label + '</div><strong>' + card.value + '</strong><span>' + card.note + '</span></div>';
      }).join("");
    }
    var zoneList = document.getElementById("zone-list");
    if (zoneList && FLEET.geofences) {
      zoneList.innerHTML = FLEET.geofences.zones.map(function (zone) {
        return '<div class="zone-item"><div class="meta"><strong>' + zone.name + '</strong><span class="status-chip" data-status="ok">' + zone.shape + '</span></div><div class="metric-line" style="margin-top:6px"><span>' + zone.area + '</span><span>' + zone.hours + '</span></div><div class="metric-line"><span>Assets</span><span>' + zone.assets + '</span></div></div>';
      }).join("");
    }
    var feed = document.getElementById("event-feed");
    if (feed && FLEET.geofences) {
      feed.innerHTML = FLEET.geofences.events.map(function (ev) {
        return '<div class="event-item" data-action="' + ev.action + '"><div><strong style="display:block;font-size:12px">' + ev.asset + ' ' + ev.action + ' ' + ev.zone + '</strong></div><span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate);white-space:nowrap">' + ev.time + '</span></div>';
      }).join("");
    }
    var map = document.getElementById("geofence-map");
    if (map) {
      map.innerHTML = '<svg viewBox="0 0 100 100" role="img" aria-label="Geofence zones"><rect width="100" height="100" fill="var(--canvas)"/><rect x="12" y="18" width="24" height="24" rx="4" fill="rgba(255,196,0,.18)" stroke="var(--yellow-dark)" stroke-width="1.4"/><rect x="44" y="24" width="28" height="18" rx="4" fill="rgba(20,100,71,.12)" stroke="var(--green)" stroke-width="1.4"/><circle cx="76" cy="34" r="12" fill="rgba(20,21,24,.06)" stroke="var(--slate)" stroke-width="1.4"/><rect x="24" y="58" width="46" height="22" rx="4" fill="rgba(162,36,36,.08)" stroke="var(--error)" stroke-width="1.4"/></svg>';
    }
  }

  function renderUtilisationPage() {
    var summary = document.getElementById("utilisation-summary");
    if (summary && FLEET.utilisation) {
      summary.innerHTML = FLEET.utilisation.summary.map(function (card) {
        return '<div class="summary-card"><div class="eyebrow">' + card.label + '</div><strong>' + card.value + '</strong><span>' + card.note + '</span></div>';
      }).join("");
    }
    var cards = document.getElementById("utilisation-cards");
    if (cards && FLEET.utilisation) {
      cards.innerHTML = FLEET.utilisation.assets.map(function (asset) {
        var color = asset.value < 35 ? "var(--error)" : (asset.value < 55 ? "var(--yellow-dark)" : "var(--green)");
        var statusAttr = asset.status.toLowerCase();
        return (
          '<div class="panel metric-card">' +
            '<div class="panel-header"><h3>' + asset.name + '</h3><span class="status-chip" data-status="' + statusAttr + '">' + asset.status + '</span></div>' +
            '<div class="panel-body">' +
              '<div class="metric-line"><span>' + asset.id + '</span><span>' + asset.value + '%</span></div>' +
              '<div class="bar-track"><div class="bar-fill" style="width:' + asset.value + '%;background:' + color + '"></div></div>' +
              '<div class="metric-line"><span>' + asset.detail + '</span></div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
    var chart = document.getElementById("utilisation-trend-chart");
    if (chart && FLEET.utilisation) {
      var points = FLEET.utilisation.trend.map(function (value, index) {
        return (index * 18) + 8 + "," + (90 - value * 0.9);
      }).join(" ");
      chart.innerHTML = '<svg viewBox="0 0 120 100" role="img" aria-label="7 day utilisation trend, illustrative only"><path d="M 8 90 L ' + points + '" fill="none" stroke="var(--yellow-dark)" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="90" x2="112" y2="90" stroke="var(--line)" stroke-width="1"/><line x1="8" y1="10" x2="8" y2="90" stroke="var(--line)" stroke-width="1"/></svg>';
    }
  }

  function renderPageContent() {
    var page = document.body.getAttribute("data-page");
    if (page === "fuel") renderFuelPage();
    if (page === "maintenance") renderMaintenancePage();
    if (page === "geofences") renderGeofencesPage();
    if (page === "utilisation") renderUtilisationPage();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPageContent();
    renderStatsBar();
    renderAssetList();
    renderSiteList();
    renderMapMarkers();
    renderAlertFeed();
    renderEventLog();
    bindLegend();
    bindZoom();
    bindTabs();
    bindSearch();
    bindAlertBadge();
    bindNavToggle();
    bindTripModal();
    tickClock();
    setInterval(tickClock, 1000);
  });
})();
