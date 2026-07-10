window.DOZR_FLEET = {
  fleetName: "Dozr Fleet",
  lastUpdated: "10 Jul 2026 14:30",
  liveStatus: "Live sync",
  alertCount: 2,
  summary: {
    activeAssets: 3,
    engineHoursToday: "18.6h",
    fuelToday: "501L",
    activeAlerts: 2,
    maintenanceDue: 6
  },
  sites: [
    { name: "Al Quoz Industrial Area", assetCount: 2 },
    { name: "Jebel Ali Port", assetCount: 3 },
    { name: "Dubai Creek Harbour", assetCount: 2 },
    { name: "Abu Dhabi KIZAD", assetCount: 1 }
  ],
  assets: [
    {
      id: "DZR-001",
      name: "CAT 320 Excavator",
      type: "Excavator",
      site: "Al Quoz Industrial Area",
      mapPosition: { x: 22, y: 24 },
      status: "Operating",
      health: "Good",
      fuelLevel: 62,
      fuelCapacity: 600,
      fuelRate: 18.2,
      engineHours: 3102,
      rpm: 1380,
      engineLoad: 55,
      maintenanceStatus: "Due soon",
      can: { coolantTemp: 88, oilPressure: 380 },
      alerts: [
        { severity: "warning", code: "P20E0", description: "Diesel particulate filter pressure high" }
      ],
      trips: [
        {
          date: "2026-07-10",
          distance: "14.2 km",
          startTime: "06:30",
          endTime: "14:15",
          route: [
            { x: 18, y: 20 }, { x: 20, y: 21 }, { x: 22, y: 24 }, { x: 24, y: 26 }, { x: 23, y: 22 }
          ]
        }
      ]
    },
    {
      id: "DZR-002",
      name: "JCB 3CX Backhoe",
      type: "Backhoe",
      site: "Jebel Ali Port",
      mapPosition: { x: 38, y: 42 },
      status: "Idle",
      health: "Watch",
      fuelLevel: 17,
      fuelCapacity: 250,
      fuelRate: 8.4,
      engineHours: 2188,
      rpm: 960,
      engineLoad: 24,
      maintenanceStatus: "Overdue",
      can: { coolantTemp: 92, oilPressure: 320 },
      alerts: [
        { severity: "critical", code: "P018C", description: "Fuel pressure low" }
      ],
      trips: [
        {
          date: "2026-07-10",
          distance: "8.5 km",
          startTime: "07:00",
          endTime: "11:30",
          route: [
            { x: 34, y: 38 }, { x: 36, y: 40 }, { x: 38, y: 42 }, { x: 40, y: 44 }, { x: 39, y: 41 }
          ]
        }
      ]
    },
    {
      id: "DZR-003",
      name: "Komatsu WA320 Loader",
      type: "Loader",
      site: "Jebel Ali Port",
      mapPosition: { x: 58, y: 26 },
      status: "Operating",
      health: "Good",
      fuelLevel: 78,
      fuelCapacity: 420,
      fuelRate: 16.7,
      engineHours: 4128,
      rpm: 1640,
      engineLoad: 71,
      maintenanceStatus: "On schedule",
      can: { coolantTemp: 84, oilPressure: 410 },
      alerts: []
    },
    {
      id: "DZR-004",
      name: "MAN TGX 18.500 Truck",
      type: "Truck",
      site: "Jebel Ali Port",
      mapPosition: { x: 74, y: 44 },
      status: "Operating",
      health: "Good",
      fuelLevel: 55,
      fuelCapacity: 500,
      fuelRate: 22.8,
      engineHours: 2644,
      rpm: 1220,
      engineLoad: 48,
      maintenanceStatus: "Due soon",
      can: { coolantTemp: 89, oilPressure: 440 },
      alerts: [],
      trips: [
        {
          date: "2026-07-10",
          distance: "142.3 km",
          startTime: "05:00",
          endTime: "13:45",
          route: [
            { x: 68, y: 38 }, { x: 70, y: 40 }, { x: 74, y: 44 }, { x: 78, y: 48 }, { x: 76, y: 45 }
          ]
        }
      ]
    },
    {
      id: "DZR-005",
      name: "Liebherr LTM 1060 Crane",
      type: "Crane",
      site: "Dubai Creek Harbour",
      mapPosition: { x: 70, y: 70 },
      status: "Offline",
      health: "Watch",
      fuelLevel: 31,
      fuelCapacity: 360,
      fuelRate: 11.6,
      engineHours: 2730,
      rpm: 0,
      engineLoad: 0,
      maintenanceStatus: "Overdue",
      can: { coolantTemp: 60, oilPressure: 0 },
      alerts: [
        { severity: "critical", code: "U0101", description: "Lost communication with transmission control module" }
      ]
    },
    {
      id: "DZR-006",
      name: "Volvo EC220E Excavator",
      type: "Excavator",
      site: "Dubai Creek Harbour",
      mapPosition: { x: 44, y: 70 },
      status: "Operating",
      health: "Good",
      fuelLevel: 70,
      fuelCapacity: 420,
      fuelRate: 17.1,
      engineHours: 3320,
      rpm: 1480,
      engineLoad: 62,
      maintenanceStatus: "On schedule",
      can: { coolantTemp: 86, oilPressure: 390 },
      alerts: []
    },
    {
      id: "DZR-007",
      name: "CAT 950GC Loader",
      type: "Loader",
      site: "Abu Dhabi KIZAD",
      mapPosition: { x: 82, y: 20 },
      status: "Operating",
      health: "Good",
      fuelLevel: 90,
      fuelCapacity: 360,
      fuelRate: 14.4,
      engineHours: 2940,
      rpm: 1320,
      engineLoad: 51,
      maintenanceStatus: "Due soon",
      can: { coolantTemp: 85, oilPressure: 395 },
      alerts: []
    },
    {
      id: "DZR-008",
      name: "XCMG XE215C Excavator",
      type: "Excavator",
      site: "Al Quoz Industrial Area",
      mapPosition: { x: 28, y: 58 },
      status: "Idle",
      health: "Watch",
      fuelLevel: 44,
      fuelCapacity: 420,
      fuelRate: 12.6,
      engineHours: 2470,
      rpm: 980,
      engineLoad: 28,
      maintenanceStatus: "Overdue",
      can: { coolantTemp: 88, oilPressure: 330 },
      alerts: [
        { severity: "warning", code: "P0642", description: "Sensor reference voltage low" }
      ]
    }
  ],
  geofences: [
    { name: "Al Quoz Industrial", shape: "Polygon", area: "0.8 sq km", hours: "07:00-18:00", assets: 3 },
    { name: "Jebel Ali Port", shape: "Polygon", area: "1.2 sq km", hours: "24h", assets: 2 },
    { name: "Dubai Creek Harbour", shape: "Rectangle", area: "0.5 sq km", hours: "06:00-20:00", assets: 2 },
    { name: "Abu Dhabi KIZAD", shape: "Circle", area: "7.1 sq km", hours: "24h", assets: 1 }
  ],
  events: [
    { time: "14:32", assetId: "DZR-001", action: "Entered", zone: "Al Quoz Industrial" },
    { time: "13:55", assetId: "DZR-004", action: "Exited", zone: "Jebel Ali Port" },
    { time: "13:10", assetId: "DZR-003", action: "Entered", zone: "Jebel Ali Port" },
    { time: "11:22", assetId: "DZR-005", action: "Exited", zone: "Dubai Creek Harbour" }
  ],
  alertsFeed: [
    { time: "14:15", assetId: "DZR-002", assetName: "JCB 3CX Backhoe", severity: "critical", code: "P018C", description: "Fuel pressure low" },
    { time: "13:42", assetId: "DZR-005", assetName: "Liebherr LTM 1060 Crane", severity: "critical", code: "U0101", description: "Lost communication with transmission control module" },
    { time: "12:30", assetId: "DZR-001", assetName: "CAT 320 Excavator", severity: "warning", code: "P20E0", description: "Diesel particulate filter pressure high" },
    { time: "11:15", assetId: "DZR-008", assetName: "XCMG XE215C Excavator", severity: "warning", code: "P0642", description: "Sensor reference voltage low" },
    { time: "09:45", assetId: "DZR-004", assetName: "MAN TGX 18.500 Truck", severity: "info", code: "SYS-01", description: "Device reconnected to cellular network" },
    { time: "08:10", assetId: "DZR-003", assetName: "Komatsu WA320 Loader", severity: "ok", code: "SYS-00", description: "Firmware update successfully applied" }
  ],
  fuel: {
    summary: [
      { label: "Total litres", value: "1,842L", note: "Last 7 days" },
      { label: "Avg burn", value: "15.1L/hr", note: "Across active assets" },
      { label: "Refuels", value: "4", note: "This week" },
      { label: "Low tank", value: "2", note: "Needs attention" }
    ],
    assets: [
      { id: "DZR-001", name: "CAT 320 Excavator", level: 62, rate: "18.2L/hr", refuel: "09:30", status: "On track" },
      { id: "DZR-002", name: "JCB 3CX Backhoe", level: 17, rate: "8.4L/hr", refuel: "Overdue", status: "Needs refill" },
      { id: "DZR-003", name: "Komatsu WA320 Loader", level: 78, rate: "16.7L/hr", refuel: "08:10", status: "Healthy" },
      { id: "DZR-004", name: "MAN TGX 18.500 Truck", level: 55, rate: "22.8L/hr", refuel: "06:40", status: "On track" },
      { id: "DZR-005", name: "Liebherr LTM 1060 Crane", level: 31, rate: "11.6L/hr", refuel: "Tomorrow", status: "Watch" },
      { id: "DZR-006", name: "Volvo EC220E Excavator", level: 70, rate: "17.1L/hr", refuel: "Next week", status: "Healthy" },
      { id: "DZR-007", name: "CAT 950GC Loader", level: 90, rate: "14.4L/hr", refuel: "Next week", status: "Healthy" },
      { id: "DZR-008", name: "XCMG XE215C Excavator", level: 44, rate: "12.6L/hr", refuel: "Yesterday", status: "Watch" }
    ]
  },
  maintenance: {
    summary: [
      { label: "Due this week", value: "6", note: "Planned service" },
      { label: "Overdue", value: "2", note: "Critical work" },
      { label: "On schedule", value: "5", note: "Healthy assets" },
      { label: "Fleet readiness", value: "92%", note: "Availability" }
    ],
    items: [
      { asset: "DZR-002", type: "Backhoe", service: "Hydraulic filter change", due: "Today", status: "Overdue", action: "Dispatch" },
      { asset: "DZR-001", type: "Excavator", service: "Coolant check", due: "Tomorrow", status: "Due soon", action: "Book" },
      { asset: "DZR-004", type: "Truck", service: "Brake inspection", due: "03 Jul", status: "Due soon", action: "Book" },
      { asset: "DZR-005", type: "Crane", service: "Battery health test", due: "12 Jul", status: "On schedule", action: "View" },
      { asset: "DZR-008", type: "Excavator", service: "Sensor calibration", due: "14 Jul", status: "On schedule", action: "View" },
      { asset: "DZR-007", type: "Loader", service: "Oil sample", due: "16 Jul", status: "Due soon", action: "Book" }
    ]
  },
  geofences: {
    summary: [
      { label: "Active zones", value: "4", note: "Across all sites" },
      { label: "Assets tracked", value: "8", note: "Inside a zone now" },
      { label: "Entries today", value: "6", note: "Since 00:00" },
      { label: "Exits today", value: "5", note: "Since 00:00" }
    ],
    zones: [
      { name: "Al Quoz Yard", shape: "Polygon", area: "0.8 sq km", hours: "07:00-18:00", assets: 3 },
      { name: "Jebel Ali Port", shape: "Polygon", area: "1.2 sq km", hours: "24h", assets: 3 },
      { name: "Dubai Creek Harbour", shape: "Rectangle", area: "0.5 sq km", hours: "06:00-20:00", assets: 2 },
      { name: "Abu Dhabi KIZAD", shape: "Circle", area: "7.1 sq km", hours: "24h", assets: 1 }
    ],
    events: [
      { time: "14:32", asset: "DZR-001", action: "Entered", zone: "Al Quoz Yard" },
      { time: "13:55", asset: "DZR-004", action: "Exited", zone: "Jebel Ali Port" },
      { time: "13:10", asset: "DZR-003", action: "Entered", zone: "Jebel Ali Port" },
      { time: "11:22", asset: "DZR-005", action: "Exited", zone: "Dubai Creek Harbour" }
    ]
  },
  utilisation: {
    summary: [
      { label: "Active hours", value: "82h", note: "Shift window" },
      { label: "Idle time", value: "14h", note: "Below threshold" },
      { label: "Deadhead", value: "21%", note: "Non-productive" },
      { label: "Fleet utilisation", value: "76%", note: "Rolling 7-day" }
    ],
    assets: [
      { id: "DZR-001", name: "CAT 320 Excavator", value: 83, detail: "Excavation / haul", status: "Operating" },
      { id: "DZR-003", name: "Komatsu WA320 Loader", value: 79, detail: "Loading / transfer", status: "Operating" },
      { id: "DZR-004", name: "MAN TGX 18.500 Truck", value: 71, detail: "Road haul", status: "Operating" },
      { id: "DZR-006", name: "Volvo EC220E Excavator", value: 67, detail: "Site support", status: "Operating" },
      { id: "DZR-007", name: "CAT 950GC Loader", value: 65, detail: "Material handling", status: "Operating" },
      { id: "DZR-008", name: "XCMG XE215C Excavator", value: 38, detail: "Idle, awaiting dispatch", status: "Idle" },
      { id: "DZR-002", name: "JCB 3CX Backhoe", value: 28, detail: "Idle, low fuel", status: "Idle" },
      { id: "DZR-005", name: "Liebherr LTM 1060 Crane", value: 24, detail: "Offline, comms lost", status: "Offline" }
    ],
    trend: [14, 21, 19, 28, 33, 41, 37]
  }
,
  costRoi: {
    summary: [
      { label: "Fuel spend", value: "AED 18.2k", note: "Last 30 days" },
      { label: "Maintenance", value: "AED 4.6k", note: "Service spend" },
      { label: "Savings", value: "AED 9.4k", note: "Vs. baseline" },
      { label: "ROI", value: "2.3x", note: "Annualized" }
    ],
    hero: {
      title: "Avoided idle spend",
      value: "AED 9.4k",
      note: "Automated alerts cut unplanned downtime by 22% this month."
    },
    assets: [
      { id: "DZR-001", name: "CAT 320 Excavator", value: "AED 2.2k", detail: "Fuel + service", status: "On track" },
      { id: "DZR-003", name: "Komatsu WA320 Loader", value: "AED 1.8k", detail: "Fuel + service", status: "Healthy" },
      { id: "DZR-004", name: "MAN TGX 18.500 Truck", value: "AED 2.6k", detail: "Road haul", status: "On track" },
      { id: "DZR-006", name: "Volvo EC220E Excavator", value: "AED 1.4k", detail: "Site support", status: "Healthy" }
    ],
    trend: [9, 11, 12, 13, 15, 18]
  },
  reports: {
    summary: [
      { label: "Weekly reports", value: "6", note: "Scheduled" },
      { label: "Auto-deliveries", value: "4", note: "Via email" },
      { label: "Last export", value: "08:40", note: "Today" }
    ],
    available: [
      { title: "Fuel consumption", type: "Operations", cadence: "Daily" },
      { title: "Maintenance outlook", type: "Service", cadence: "Weekly" },
      { title: "Utilisation trend", type: "Operations", cadence: "Weekly" },
      { title: "Cost and ROI", type: "Finance", cadence: "Monthly" }
    ],
    recent: [
      { name: "Fuel consumption", period: "Today", assets: "8", generated: "08:40", delivery: "Email + WhatsApp" },
      { name: "Maintenance outlook", period: "This week", assets: "6", generated: "06:10", delivery: "Email" },
      { name: "Utilisation trend", period: "Last 7 days", assets: "8", generated: "Yesterday", delivery: "Email" }
    ]
  },
  timesheet: {
    summary: [
      { label: "Shift hours", value: "25.0h", note: "Today, 3 drivers" },
      { label: "Moving", value: "16.6h", note: "66%" },
      { label: "Idle", value: "6.5h", note: "26%" },
      { label: "Stopped", value: "1.9h", note: "8%" }
    ],
    entries: [
      { driver: "M. Rahman", vehicle: "DZR-001", shift: "06:00-14:00", total: "8.0h", moving: "5.4h", idle: "2.0h", stopped: "0.6h" },
      { driver: "S. Khan", vehicle: "DZR-004", shift: "05:30-14:30", total: "9.0h", moving: "6.2h", idle: "2.1h", stopped: "0.7h" },
      { driver: "A. Nabil", vehicle: "DZR-006", shift: "07:00-15:00", total: "8.0h", moving: "5.0h", idle: "2.4h", stopped: "0.6h" }
    ]
  },
  alerts: {
    summary: [
      { label: "Critical", value: "2", note: "Immediate action" },
      { label: "Warnings", value: "2", note: "Monitor" },
      { label: "System", value: "2", note: "Connected" }
    ],
    items: [
      { time: "14:15", asset: "DZR-002", severity: "critical", rule: "Fuel pressure low", note: "Dispatch refuel crew" },
      { time: "13:42", asset: "DZR-005", severity: "critical", rule: "Lost communication", note: "Escalate to site lead" },
      { time: "12:30", asset: "DZR-001", severity: "warning", rule: "DPF pressure high", note: "Schedule service" },
      { time: "11:15", asset: "DZR-008", severity: "warning", rule: "Sensor reference voltage low", note: "Inspect wiring" },
      { time: "09:45", asset: "DZR-004", severity: "info", rule: "Reconnected to network", note: "No action needed" },
      { time: "08:10", asset: "DZR-003", severity: "ok", rule: "Firmware updated", note: "No action needed" }
    ],
    rules: [
      { title: "Geofence exit at night", detail: "Critical alert for any site departure between 18:00 and 06:00." },
      { title: "Fuel pressure threshold", detail: "Routes low pressure events to the nearest maintenance lead." },
      { title: "WhatsApp escalation", detail: "Critical alerts send to the active site manager immediately." }
    ]
  }
};
