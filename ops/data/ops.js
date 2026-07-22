window.DOZR_OPS = {
  orgName: "Dozr Ops",
  lastUpdated: "21 Jul 2026 09:10",

  /* The 13-stage job pipeline, per LOGISTICS/04_Operations/Kasper_Operations_Manual.docx
     Part 1. Every job record's `stage` field is an index into this array. */
  pipeline: [
    "Enquiry Received",
    "RFQ Sent to Vendors",
    "Quote Received",
    "Quote Approved",
    "PO Issued",
    "Driver Assigned",
    "Dispatched",
    "In Transit",
    "Delivered",
    "ePOD Signed",
    "Invoice Generated",
    "Payment Pending",
    "Paid & Closed"
  ],

  /* Trimmed to 5 sample vendors (2026-07-22, afzl's call - keep just enough
     to demo, not a full dataset). Real vendors now live in Supabase - see
     ops/supabase/migrations/ - these mock rows stay only until every ops
     view is migrated off ops/data/ops.js. Kept for status variety:
     Active/docs-expiring, Deactivated, and Pending approval. */
  vendors: [
    { id: "V-021", name: "Emirates Crane Services", plan: "Pro", jobs30d: 26, onTime: "97%", trn: "100987654300003", active: true, docsExpiring: false, joined: "Nov 2025",
      phone: "+971 50 222 3344", fleet: "8 mobile cranes (40t-150t)", documents: [{ label: "Trade License", status: "Valid", expires: "20 Aug 2026" }, { label: "Insurance", status: "Valid", expires: "11 Nov 2026" }] },
    { id: "V-009", name: "Gulf Flatbed Co.", plan: "Starter", jobs30d: 7, onTime: "82%", trn: "100112233400003", active: true, docsExpiring: true, joined: "May 2026",
      phone: "+971 50 333 4455", fleet: "5 flatbeds, 2 low-beds", documents: [{ label: "Trade License", status: "Valid", expires: "30 Sep 2026" }, { label: "Insurance", status: "Expires in 9 days", expires: "30 Jul 2026" }] },
    { id: "V-006", name: "Khor Fakkan Logistics", plan: "Starter", jobs30d: 4, onTime: "75%", trn: "100778899100003", active: false, docsExpiring: true, joined: "Jul 2025",
      phone: "+971 50 555 6677", fleet: "3 box trucks", documents: [{ label: "Trade License", status: "Expired", expires: "12 Jun 2026" }, { label: "Insurance", status: "Expires in 4 days", expires: "25 Jul 2026" }] },
    { id: "V-042", name: "Abu Dhabi Port Movers", plan: "Pending", jobs30d: 0, onTime: "-", trn: "100889900100003", active: false, docsExpiring: false, joined: "Application: 19 Jul 2026",
      phone: "+971 50 888 9900", fleet: "Not yet verified", documents: [{ label: "Trade License", status: "Submitted, unverified", expires: "—" }, { label: "Insurance", status: "Submitted, unverified", expires: "—" }] },
    { id: "V-050", name: "Fujairah Marine Logistics", plan: "Growth", jobs30d: 9, onTime: "85%", trn: "100334455600003", active: true, docsExpiring: false, joined: "Apr 2026",
      phone: "+971 50 999 0011", fleet: "6 flatbeds, port-handling gear", documents: [{ label: "Trade License", status: "Valid", expires: "11 Jan 2027" }, { label: "Insurance", status: "Valid", expires: "23 Jun 2027" }] }
  ],

  /* Trimmed to 5 sample jobs (2026-07-22), one per kanban column where
     possible, spanning both verticals and one flagged example. Same codes
     also seeded into Supabase - see ops/supabase/migrations/0007_seed_jobs.sql -
     so job-detail.html (still mock-only) keeps resolving correctly once
     Enquiries/Kanban/Reports read from Supabase instead of this array. */
  jobs: [
    { code: "DZR-J-1034", client: "Aldar", clientContact: "Mariam Khoury", vendor: "— unassigned", driver: "— unassigned", route: "Abu Dhabi KIZAD", type: "Excavator", stage: 0, price: "—", flagged: false,
      documents: [],
      timeline: [{ time: "Today 09:05", note: "Enquiry received, RFQ not yet sent" }] },
    { code: "DZR-J-1033", client: "RAK Ceramics", clientContact: "Bilal Farooq", vendor: "Ras Al Khaimah Crane Co.", driver: "Anwar Sadiq", route: "RAK Industrial Zone", type: "Crane, 50t", stage: 4, price: "AED 5,600", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1033" }, { label: "PO", ref: "PO-1033" }],
      timeline: [
        { time: "Today 06:50", note: "Quote approved" },
        { time: "Today 07:10", note: "PO issued, awaiting driver assignment" }
      ] },
    { code: "DZR-J-1039", client: "Petrofac", clientContact: "Layla Nasser", vendor: "Gulf Flatbed Co.", driver: "Hassan Ali", route: "Abu Dhabi → Ruwais", type: "Low-bed", stage: 6, price: "AED 6,750", flagged: true,
      documents: [{ label: "Quote", ref: "QTE-1039" }, { label: "PO", ref: "PO-1039" }],
      timeline: [
        { time: "Yesterday", note: "PO issued, driver assigned" },
        { time: "Today 07:15", note: "Escalation L1: driver running 25 min late" }
      ] },
    { code: "DZR-J-1032", client: "Fujairah Port Authority", clientContact: "Salim Al Kaabi", vendor: "Fujairah Marine Logistics", driver: "Imran Sheikh", route: "Fujairah Port site", type: "Flatbed, port cargo", stage: 9, price: "AED 7,100", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1032" }, { label: "PO", ref: "PO-1032" }],
      timeline: [
        { time: "Yesterday", note: "Delivered" },
        { time: "Today 06:00", note: "ePOD signed by client" }
      ] },
    { code: "DZR-J-1020", client: "Meraas", clientContact: "Yousef Al Ali", vendor: "Emirates Crane Services", driver: "Sunil Perera", route: "Bluewaters Island", type: "Crane, 60t", stage: 12, price: "AED 6,200", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1020" }, { label: "PO", ref: "PO-1020" }, { label: "Invoice", ref: "INV-DZR-J-1020" }],
      timeline: [
        { time: "10 days ago", note: "Delivered and ePOD signed" },
        { time: "7 days ago", note: "Invoice sent" },
        { time: "3 days ago", note: "Payment received, job closed" }
      ] }
  ],

  /* Trimmed to 5 sample RFQs (2026-07-22), spanning a quotesIn spread
     (0/1/2) so the notification bell and RFQs tab still demo meaningfully. */
  rfqs: [
    { code: "RFQ-2201", client: "Meraas", clientContact: "Yousef Al Ali", clientEmail: "yousef.alali@meraas.ae", route: "Bluewaters Island", type: "Crane, 80t, 2 days", deadline: "Today 18:00", sentTo: ["Emirates Crane Services", "Sharjah Rigging & Lift", "Dubai Boom Lift Rentals"], quotesIn: 1, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2198", client: "Aldar", clientContact: "Mariam Khoury", clientEmail: "mariam.khoury@aldar.ae", route: "Abu Dhabi KIZAD", type: "Excavator, 1 day", deadline: "22 Jul 14:00", sentTo: ["Gulf Flatbed Co.", "Khor Fakkan Logistics"], quotesIn: 0, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2197", client: "Dubai Investments Park", clientContact: "Salem Al Marzouqi", clientEmail: "salem.almarzouqi@dip.ae", route: "DIP → Al Quoz", type: "Low-bed", deadline: "23 Jul 12:00", sentTo: ["Gulf Flatbed Co.", "Al Maha Heavy Transport", "Northern Emirates Trucking"], quotesIn: 2, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2195", client: "RAK Ceramics", clientContact: "Bilal Farooq", clientEmail: "bilal.farooq@rakceramics.com", route: "RAK Industrial Zone", type: "Crane, 50t", deadline: "24 Jul 10:00", sentTo: ["Ras Al Khaimah Crane Co.", "Sharjah Rigging & Lift"], quotesIn: 1, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2194", client: "Fujairah Port Authority", clientContact: "Salim Al Kaabi", clientEmail: "salim.alkaabi@fpa.gov.ae", route: "Fujairah Port site", type: "Flatbed, port cargo", deadline: "24 Jul 15:00", sentTo: ["Fujairah Marine Logistics"], quotesIn: 0, quotedPrice: null, emailedAt: null }
  ],

  /* Escalations tab/panel is unrendered in v1 (afzl's call) - this data is
     kept only so re-adding the tab later doesn't need new content. Trimmed
     to 4 entries, 2026-07-22. */
  escalations: {
    summary: [
      { label: "Open now", value: "1", note: "L1: 1 · L2: 0 · L3: 0" },
      { label: "Resolved", value: "3", note: "Logged over the last 9 days" },
      { label: "L3 this month", value: "0", note: "No founder escalations" }
    ],
    log: [
      { level: "L1", job: "DZR-J-1039", issue: "Driver running 25 min late", owner: "Ops Agent", time: "Today 07:40", status: "Open" },
      { level: "L1", job: "DZR-J-1033", issue: "Minor cosmetic cargo damage, photographed", owner: "Ops Agent", time: "Today 06:40", status: "Resolved" },
      { level: "L1", job: "DZR-J-1032", issue: "Client requested tracking link resend", owner: "Ops Agent", time: "Yesterday", status: "Resolved" },
      { level: "L1", job: "DZR-J-1020", issue: "Vendor requested route change, approved", owner: "Ops Agent", time: "9 days ago", status: "Resolved" }
    ],
    rules: [
      { level: "L1", title: "Ops Agent handles", items: [
        "Driver running 15-30 min late: contact driver, update client ETA by WhatsApp, log the delay.",
        "Client questions about GPS tracking link: resend link, confirm driver name and vehicle reg.",
        "Minor cargo damage (cosmetic only): document with photos, note in ePOD, inform vendor, flag for review.",
        "Vendor requesting route change: agent may approve if distance diff < 15% and time diff < 30 min."
      ] },
      { level: "L2", title: "Ops Manager approval required", items: [
        "Driver unreachable 20+ min: contact vendor principal, prepare backup driver, call client within 30 min.",
        "Significant delay (> 2 hours behind schedule): manager communicates directly with client.",
        "Client dispute on delivery: do not release vendor payment, review ePOD evidence within 24 hours.",
        "Client requesting price reduction post-quote: manager sign-off only, no agent authority.",
        "Structural or total-loss cargo damage: notify insurer immediately, preserve GPS/ePOD/comms, no admission of liability."
      ] },
      { level: "L3", title: "Founder / Commercial Director", items: [
        "Any client threatening legal action or formal complaint.",
        "Any anchor-client job where SLA is at risk of breach.",
        "Any vendor requesting early termination of the OWN Program agreement.",
        "Any regulatory or customs compliance issue (RTA, Dubai Customs, UAE FTA).",
        "Any cybersecurity or data breach concern on the platform."
      ] }
    ]
  },

  /* Trimmed to 5 sample invoices (2026-07-22), one tied to a kept job
     (DZR-J-1020) plus 4 more for a Paid/Pending/Overdue status spread. */
  billing: {
    summary: [
      { label: "MRR", value: "AED 52.6k", note: "5 active vendor plans" },
      { label: "Outstanding", value: "AED 26.9k", note: "3 unpaid invoices" },
      { label: "Overdue", value: "AED 14.2k", note: "1 invoice, past due date" },
      { label: "Collected 30d", value: "AED 96k", note: "Includes closed jobs not shown below" }
    ],
    invoices: [
      { ref: "INV-DZR-J-1020", client: "Meraas", amount: "AED 6,200", issued: "13 Jul", due: "12 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1037", client: "DP World", amount: "AED 3,600", issued: "18 Jul", due: "17 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1029", client: "Emaar", amount: "AED 9,800", issued: "02 Jul", due: "01 Aug", status: "Pending" },
      { ref: "INV-DZR-J-1017", client: "Meraas", amount: "AED 14,200", issued: "20 Jun", due: "20 Jul", status: "Overdue" },
      { ref: "INV-DZR-J-1028", client: "Dubai South Authority", amount: "AED 2,850", issued: "19 Jul", due: "18 Aug", status: "Pending" }
    ]
  }
};
