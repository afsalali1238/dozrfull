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

  overview: {
    summary: [
      { label: "Active jobs", value: "12", note: "Not yet paid & closed" },
      { label: "Open RFQs", value: "10", note: "Awaiting vendor quotes" },
      { label: "Outstanding", value: "AED 52.9k", note: "7 unpaid invoices" },
      { label: "On-time rate", value: "87%", note: "Fleet average, last 30 days" }
    ],
    escalations: [
      { level: "L2", job: "DZR-J-1042", issue: "Driver unreachable 20+ min", owner: "Ops Manager", time: "08:52" },
      { level: "L1", job: "DZR-J-1039", issue: "Driver running 25 min late", owner: "Ops Agent", time: "07:40" },
      { level: "L2", job: "DZR-J-1031", issue: "Client dispute on delivery", owner: "Ops Manager", time: "Yesterday" }
    ],
    dailyChecklist: [
      { task: "Confirm driver + GPS active for today's jobs", done: true },
      { task: "Confirm clients have tracking links for today's deliveries", done: true },
      { task: "Review overnight ePODs, confirm auto-invoiced", done: false },
      { task: "Check Kasper Verified vendor badge expirations", done: false },
      { task: "Check ENOC fuel price, update surcharge if triggered", done: false },
      { task: "Review unacknowledged client messages (>1h old)", done: true }
    ]
  },

  vendors: [
    { id: "V-014", name: "Al Maha Heavy Transport", plan: "Growth", jobs30d: 18, onTime: "94%", trn: "100234567800003", active: true, docsExpiring: false, joined: "Feb 2026",
      phone: "+971 50 111 2233", fleet: "12 flatbeds, 4 low-beds", documents: [{ label: "Trade License", status: "Valid", expires: "14 Mar 2027" }, { label: "Insurance", status: "Valid", expires: "02 Jan 2027" }] },
    { id: "V-021", name: "Emirates Crane Services", plan: "Pro", jobs30d: 26, onTime: "97%", trn: "100987654300003", active: true, docsExpiring: false, joined: "Nov 2025",
      phone: "+971 50 222 3344", fleet: "8 mobile cranes (40t-150t)", documents: [{ label: "Trade License", status: "Valid", expires: "20 Aug 2026" }, { label: "Insurance", status: "Valid", expires: "11 Nov 2026" }, { label: "Crane Operator Certs", status: "Valid", expires: "05 May 2027" }] },
    { id: "V-009", name: "Gulf Flatbed Co.", plan: "Starter", jobs30d: 7, onTime: "82%", trn: "100112233400003", active: true, docsExpiring: true, joined: "May 2026",
      phone: "+971 50 333 4455", fleet: "5 flatbeds, 2 low-beds", documents: [{ label: "Trade License", status: "Valid", expires: "30 Sep 2026" }, { label: "Insurance", status: "Expires in 9 days", expires: "30 Jul 2026" }] },
    { id: "V-031", name: "Sharjah Rigging & Lift", plan: "Growth", jobs30d: 12, onTime: "89%", trn: "100445566700003", active: true, docsExpiring: false, joined: "Jan 2026",
      phone: "+971 50 444 5566", fleet: "6 cranes, 3 boom lifts", documents: [{ label: "Trade License", status: "Valid", expires: "18 Dec 2026" }, { label: "Insurance", status: "Valid", expires: "02 Feb 2027" }] },
    { id: "V-006", name: "Khor Fakkan Logistics", plan: "Starter", jobs30d: 4, onTime: "75%", trn: "100778899100003", active: false, docsExpiring: true, joined: "Jul 2025",
      phone: "+971 50 555 6677", fleet: "3 box trucks", documents: [{ label: "Trade License", status: "Expired", expires: "12 Jun 2026" }, { label: "Insurance", status: "Expires in 4 days", expires: "25 Jul 2026" }] },
    { id: "V-018", name: "Dubai Boom Lift Rentals", plan: "Pro", jobs30d: 21, onTime: "96%", trn: "100223344500003", active: true, docsExpiring: false, joined: "Sep 2025",
      phone: "+971 50 666 7788", fleet: "10 boom lifts, 4 scissor lifts", documents: [{ label: "Trade License", status: "Valid", expires: "08 Apr 2027" }, { label: "Insurance", status: "Valid", expires: "19 Mar 2027" }] },
    { id: "V-027", name: "Northern Emirates Trucking", plan: "Growth", jobs30d: 15, onTime: "88%", trn: "100556677800003", active: true, docsExpiring: false, joined: "Mar 2026",
      phone: "+971 50 777 8899", fleet: "9 box trucks, 5 flatbeds", documents: [{ label: "Trade License", status: "Valid", expires: "27 Oct 2026" }, { label: "Insurance", status: "Valid", expires: "14 Sep 2026" }] },
    { id: "V-042", name: "Abu Dhabi Port Movers", plan: "Pending", jobs30d: 0, onTime: "-", trn: "100889900100003", active: false, docsExpiring: false, joined: "Application: 19 Jul 2026",
      phone: "+971 50 888 9900", fleet: "Not yet verified", documents: [{ label: "Trade License", status: "Submitted, unverified", expires: "—" }, { label: "Insurance", status: "Submitted, unverified", expires: "—" }] },
    { id: "V-050", name: "Fujairah Marine Logistics", plan: "Growth", jobs30d: 9, onTime: "85%", trn: "100334455600003", active: true, docsExpiring: false, joined: "Apr 2026",
      phone: "+971 50 999 0011", fleet: "6 flatbeds, port-handling gear", documents: [{ label: "Trade License", status: "Valid", expires: "11 Jan 2027" }, { label: "Insurance", status: "Valid", expires: "23 Jun 2027" }] },
    { id: "V-055", name: "Al Ain Construction Equipment", plan: "Starter", jobs30d: 3, onTime: "70%", trn: "100667788900003", active: true, docsExpiring: true, joined: "Jun 2026",
      phone: "+971 50 123 4567", fleet: "2 excavators, 1 backhoe", documents: [{ label: "Trade License", status: "Valid", expires: "05 Sep 2026" }, { label: "Insurance", status: "Expires in 6 days", expires: "27 Jul 2026" }] },
    { id: "V-061", name: "Ras Al Khaimah Crane Co.", plan: "Pro", jobs30d: 19, onTime: "93%", trn: "100778811200003", active: true, docsExpiring: false, joined: "Aug 2025",
      phone: "+971 50 234 5678", fleet: "7 mobile cranes (30t-120t)", documents: [{ label: "Trade License", status: "Valid", expires: "16 Feb 2027" }, { label: "Insurance", status: "Valid", expires: "09 Dec 2026" }, { label: "Crane Operator Certs", status: "Valid", expires: "01 Jul 2027" }] },
    { id: "V-066", name: "Dubai South Freight Partners", plan: "Growth", jobs30d: 11, onTime: "90%", trn: "100889922300003", active: true, docsExpiring: false, joined: "Apr 2026",
      phone: "+971 50 345 6789", fleet: "8 box trucks, 3 flatbeds", documents: [{ label: "Trade License", status: "Valid", expires: "22 Nov 2026" }, { label: "Insurance", status: "Valid", expires: "30 Aug 2026" }] }
  ],

  jobs: [
    { code: "DZR-J-1042", client: "Emirates Steel", clientContact: "Rashid Al Marri", vendor: "Al Maha Heavy Transport", driver: "Mohammed Iqbal", route: "Khor Fakkan → Dubai", type: "40ft Flatbed", stage: 7, price: "AED 4,200", flagged: true,
      documents: [{ label: "Quote", ref: "QTE-1042" }, { label: "PO", ref: "PO-1042" }],
      timeline: [
        { time: "Yesterday 09:10", note: "Enquiry received via WhatsApp" },
        { time: "Yesterday 09:40", note: "RFQ sent to 3 vendors" },
        { time: "Yesterday 11:05", note: "Quote accepted, PO issued" },
        { time: "Yesterday 14:20", note: "Driver Mohammed Iqbal assigned" },
        { time: "Today 06:30", note: "Dispatched from Khor Fakkan yard" },
        { time: "Today 08:52", note: "Escalation L2: driver unreachable 20+ min" }
      ] },
    { code: "DZR-J-1041", client: "Arada Developments", clientContact: "Fatima Al Zaabi", vendor: "Sharjah Rigging & Lift", driver: "Rajesh Kumar", route: "Sharjah → Dubai Creek Harbour", type: "Crane, 60t", stage: 5, price: "AED 8,900", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1041" }, { label: "PO", ref: "PO-1041" }],
      timeline: [
        { time: "2 days ago", note: "Enquiry received" },
        { time: "2 days ago", note: "Quote sent and accepted" },
        { time: "Yesterday", note: "PO issued" },
        { time: "Today 07:15", note: "Driver Rajesh Kumar assigned, awaiting dispatch" }
      ] },
    { code: "DZR-J-1040", client: "Al Futtaim Construction", clientContact: "Ahmed Hassan", vendor: "Emirates Crane Services", driver: "Sunil Perera", route: "Jebel Ali → Al Quoz", type: "Crane, 100t", stage: 10, price: "AED 12,400", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1040" }, { label: "PO", ref: "PO-1040" }, { label: "Invoice", ref: "INV-DZR-J-1040" }],
      timeline: [
        { time: "4 days ago", note: "Full delivery cycle completed" },
        { time: "3 days ago", note: "ePOD signed by both parties" },
        { time: "2 days ago", note: "Invoice generated and sent" }
      ] },
    { code: "DZR-J-1039", client: "Petrofac", clientContact: "Layla Nasser", vendor: "Gulf Flatbed Co.", driver: "Hassan Ali", route: "Abu Dhabi → Ruwais", type: "Low-bed", stage: 6, price: "AED 6,750", flagged: true,
      documents: [{ label: "Quote", ref: "QTE-1039" }, { label: "PO", ref: "PO-1039" }],
      timeline: [
        { time: "Yesterday", note: "PO issued, driver assigned" },
        { time: "Today 07:15", note: "Escalation L1: driver running 25 min late" }
      ] },
    { code: "DZR-J-1038", client: "Nakheel", clientContact: "Omar Suleiman", vendor: "Dubai Boom Lift Rentals", driver: "Vikram Singh", route: "Palm Jumeirah site", type: "Boom Lift", stage: 12, price: "AED 2,100", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1038" }, { label: "PO", ref: "PO-1038" }, { label: "Invoice", ref: "INV-DZR-J-1038" }],
      timeline: [
        { time: "5 days ago", note: "Delivered and ePOD signed" },
        { time: "4 days ago", note: "Invoice sent" },
        { time: "Today", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1037", client: "DP World", clientContact: "Khalid Rahman", vendor: "Al Maha Heavy Transport", driver: "Mohammed Iqbal", route: "Jebel Ali Port → Al Quoz", type: "40ft Flatbed", stage: 12, price: "AED 3,600", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1037" }, { label: "PO", ref: "PO-1037" }, { label: "Invoice", ref: "INV-DZR-J-1037" }],
      timeline: [
        { time: "6 days ago", note: "Delivered and ePOD signed" },
        { time: "3 days ago", note: "Invoice sent" },
        { time: "Today", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1036", client: "Emaar", clientContact: "Noura Al Suwaidi", vendor: "Northern Emirates Trucking", driver: "— unassigned", route: "Ras Al Khaimah → Downtown Dubai", type: "Box Truck", stage: 1, price: "Quote pending", flagged: false,
      documents: [],
      timeline: [
        { time: "Today 08:00", note: "Enquiry received" },
        { time: "Today 08:20", note: "RFQ sent, awaiting vendor quote" }
      ] },
    { code: "DZR-J-1035", client: "Meraas", clientContact: "Yousef Al Ali", vendor: "Emirates Crane Services", driver: "— unassigned", route: "Bluewaters Island", type: "Crane, 80t", stage: 1, price: "RFQ open", flagged: false,
      documents: [],
      timeline: [{ time: "Today 07:40", note: "RFQ-2201 sent to 3 vendors" }] },
    { code: "DZR-J-1034", client: "Aldar", clientContact: "Mariam Khoury", vendor: "— unassigned", driver: "— unassigned", route: "Abu Dhabi KIZAD", type: "Excavator", stage: 0, price: "—", flagged: false,
      documents: [],
      timeline: [{ time: "Today 09:05", note: "Enquiry received, RFQ not yet sent" }] },
    { code: "DZR-J-1033", client: "RAK Ceramics", clientContact: "Bilal Farooq", vendor: "Ras Al Khaimah Crane Co.", driver: "Anwar Sadiq", route: "RAK Industrial Zone", type: "Crane, 50t", stage: 4, price: "AED 5,600", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1033" }, { label: "PO", ref: "PO-1033" }],
      timeline: [
        { time: "Today 06:50", note: "Quote approved" },
        { time: "Today 07:10", note: "PO issued, awaiting driver assignment" }
      ] },
    { code: "DZR-J-1032", client: "Fujairah Port Authority", clientContact: "Salim Al Kaabi", vendor: "Fujairah Marine Logistics", driver: "Imran Sheikh", route: "Fujairah Port site", type: "Flatbed, port cargo", stage: 9, price: "AED 7,100", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1032" }, { label: "PO", ref: "PO-1032" }],
      timeline: [
        { time: "Yesterday", note: "Delivered" },
        { time: "Today 06:00", note: "ePOD signed by client" }
      ] },
    { code: "DZR-J-1031", client: "Union Properties", clientContact: "Sara Idris", vendor: "Gulf Flatbed Co.", driver: "Hassan Ali", route: "Motor City → JVC", type: "Low-bed", stage: 8, price: "AED 5,300", flagged: true,
      documents: [{ label: "Quote", ref: "QTE-1031" }, { label: "PO", ref: "PO-1031" }],
      timeline: [
        { time: "3 days ago", note: "Delivered" },
        { time: "Yesterday", note: "Escalation L2: client dispute on delivery condition" },
        { time: "Today", note: "Ops Manager reviewing ePOD evidence" }
      ] },
    { code: "DZR-J-1028", client: "Dubai South Authority", clientContact: "Huda Al Marzooqi", vendor: "Dubai South Freight Partners", driver: "Tariq Mahmood", route: "Dubai South → Al Maktoum Airport", type: "Box Truck", stage: 11, price: "AED 2,850", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1028" }, { label: "PO", ref: "PO-1028" }, { label: "Invoice", ref: "INV-DZR-J-1028" }],
      timeline: [
        { time: "3 days ago", note: "Delivered and ePOD signed" },
        { time: "Yesterday", note: "Invoice sent, awaiting payment" }
      ] },
    { code: "DZR-J-1025", client: "Al Ain Farms", clientContact: "Zayed Al Nuaimi", vendor: "Al Ain Construction Equipment", driver: "— unassigned", route: "Al Ain agricultural site", type: "Excavator", stage: 0, price: "—", flagged: false,
      documents: [],
      timeline: [{ time: "Today 09:20", note: "Enquiry received via WhatsApp" }] },
    { code: "DZR-J-1020", client: "Meraas", clientContact: "Yousef Al Ali", vendor: "Emirates Crane Services", driver: "Sunil Perera", route: "Bluewaters Island", type: "Crane, 60t", stage: 12, price: "AED 6,200", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1020" }, { label: "PO", ref: "PO-1020" }, { label: "Invoice", ref: "INV-DZR-J-1020" }],
      timeline: [
        { time: "10 days ago", note: "Delivered and ePOD signed" },
        { time: "7 days ago", note: "Invoice sent" },
        { time: "3 days ago", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1018", client: "Nakheel", clientContact: "Omar Suleiman", vendor: "Dubai Boom Lift Rentals", driver: "Vikram Singh", route: "Deira Islands", type: "Scissor Lift", stage: 12, price: "AED 1,750", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1018" }, { label: "PO", ref: "PO-1018" }, { label: "Invoice", ref: "INV-DZR-J-1018" }],
      timeline: [
        { time: "12 days ago", note: "Delivered and ePOD signed" },
        { time: "9 days ago", note: "Invoice sent" },
        { time: "5 days ago", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1015", client: "Emaar", clientContact: "Noura Al Suwaidi", vendor: "Northern Emirates Trucking", driver: "Farhan Chaudhry", route: "Downtown Dubai → Business Bay", type: "Flatbed", stage: 12, price: "AED 2,400", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1015" }, { label: "PO", ref: "PO-1015" }, { label: "Invoice", ref: "INV-DZR-J-1015" }],
      timeline: [
        { time: "14 days ago", note: "Delivered and ePOD signed" },
        { time: "11 days ago", note: "Invoice sent" },
        { time: "6 days ago", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1010", client: "DP World", clientContact: "Khalid Rahman", vendor: "Al Maha Heavy Transport", driver: "Mohammed Iqbal", route: "Jebel Ali Port → Al Quoz", type: "40ft Flatbed", stage: 12, price: "AED 3,950", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1010" }, { label: "PO", ref: "PO-1010" }, { label: "Invoice", ref: "INV-DZR-J-1010" }],
      timeline: [
        { time: "16 days ago", note: "Delivered and ePOD signed" },
        { time: "13 days ago", note: "Invoice sent" },
        { time: "8 days ago", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1007", client: "Al Futtaim Construction", clientContact: "Ahmed Hassan", vendor: "Emirates Crane Services", driver: "Sunil Perera", route: "Jebel Ali → Al Quoz", type: "Crane, 100t", stage: 12, price: "AED 11,900", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1007" }, { label: "PO", ref: "PO-1007" }, { label: "Invoice", ref: "INV-DZR-J-1007" }],
      timeline: [
        { time: "20 days ago", note: "Delivered and ePOD signed" },
        { time: "17 days ago", note: "Invoice sent" },
        { time: "10 days ago", note: "Payment received, job closed" }
      ] },
    { code: "DZR-J-1003", client: "Petrofac", clientContact: "Layla Nasser", vendor: "Gulf Flatbed Co.", driver: "Hassan Ali", route: "Abu Dhabi → Ruwais", type: "Low-bed", stage: 12, price: "AED 6,300", flagged: false,
      documents: [{ label: "Quote", ref: "QTE-1003" }, { label: "PO", ref: "PO-1003" }, { label: "Invoice", ref: "INV-DZR-J-1003" }],
      timeline: [
        { time: "24 days ago", note: "Delivered and ePOD signed" },
        { time: "20 days ago", note: "Invoice sent" },
        { time: "12 days ago", note: "Payment received, job closed" }
      ] }
  ],

  rfqs: [
    { code: "RFQ-2201", client: "Meraas", clientContact: "Yousef Al Ali", clientEmail: "yousef.alali@meraas.ae", route: "Bluewaters Island", type: "Crane, 80t, 2 days", deadline: "Today 18:00", sentTo: ["Emirates Crane Services", "Sharjah Rigging & Lift", "Dubai Boom Lift Rentals"], quotesIn: 1, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2200", client: "RAK Properties", clientContact: "Hind Al Zaabi", clientEmail: "hind.alzaabi@rakproperties.ae", route: "Ras Al Khaimah → Dubai", type: "40ft Flatbed", deadline: "Tomorrow 10:00", sentTo: ["Al Maha Heavy Transport", "Northern Emirates Trucking"], quotesIn: 0, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2199", client: "Deyaar", clientContact: "Marwan Saleh", clientEmail: "marwan.saleh@deyaar.ae", route: "Business Bay site", type: "Boom Lift, 5 days", deadline: "22 Jul 09:00", sentTo: ["Dubai Boom Lift Rentals"], quotesIn: 1, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2198", client: "Aldar", clientContact: "Mariam Khoury", clientEmail: "mariam.khoury@aldar.ae", route: "Abu Dhabi KIZAD", type: "Excavator, 1 day", deadline: "22 Jul 14:00", sentTo: ["Gulf Flatbed Co.", "Khor Fakkan Logistics"], quotesIn: 0, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2197", client: "Dubai Investments Park", clientContact: "Salem Al Marzouqi", clientEmail: "salem.almarzouqi@dip.ae", route: "DIP → Al Quoz", type: "Low-bed", deadline: "23 Jul 12:00", sentTo: ["Gulf Flatbed Co.", "Al Maha Heavy Transport", "Northern Emirates Trucking"], quotesIn: 2, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2196", client: "Nakheel", clientContact: "Omar Suleiman", clientEmail: "omar.suleiman@nakheel.com", route: "Deira Islands", type: "Crane, 40t", deadline: "23 Jul 17:00", sentTo: ["Emirates Crane Services"], quotesIn: 0, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2195", client: "RAK Ceramics", clientContact: "Bilal Farooq", clientEmail: "bilal.farooq@rakceramics.com", route: "RAK Industrial Zone", type: "Crane, 50t", deadline: "24 Jul 10:00", sentTo: ["Ras Al Khaimah Crane Co.", "Sharjah Rigging & Lift"], quotesIn: 1, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2194", client: "Fujairah Port Authority", clientContact: "Salim Al Kaabi", clientEmail: "salim.alkaabi@fpa.gov.ae", route: "Fujairah Port site", type: "Flatbed, port cargo", deadline: "24 Jul 15:00", sentTo: ["Fujairah Marine Logistics"], quotesIn: 0, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2193", client: "Dubai South Authority", clientContact: "Huda Al Marzooqi", clientEmail: "huda.almarzooqi@dubaisouth.ae", route: "Dubai South → Al Maktoum Airport", type: "Box Truck, 3 days", deadline: "25 Jul 09:00", sentTo: ["Dubai South Freight Partners", "Northern Emirates Trucking"], quotesIn: 2, quotedPrice: null, emailedAt: null },
    { code: "RFQ-2192", client: "Al Ain Farms", clientContact: "Zayed Al Nuaimi", clientEmail: "zayed.alnuaimi@alainfarms.ae", route: "Al Ain agricultural site", type: "Excavator, 1 week", deadline: "25 Jul 12:00", sentTo: ["Al Ain Construction Equipment"], quotesIn: 0, quotedPrice: null, emailedAt: null }
  ],

  /* Full escalation log + routing rules, from
     LOGISTICS/04_Operations/Kasper_Operations_Manual.docx Part 2. */
  escalations: {
    summary: [
      { label: "Open now", value: "3", note: "L1: 1 · L2: 2 · L3: 0" },
      { label: "Resolved", value: "7", note: "Logged over the last 9 days" },
      { label: "L3 this month", value: "0", note: "No founder escalations" }
    ],
    log: [
      { level: "L2", job: "DZR-J-1042", issue: "Driver unreachable 20+ min", owner: "Ops Manager", time: "Today 08:52", status: "Open" },
      { level: "L1", job: "DZR-J-1039", issue: "Driver running 25 min late", owner: "Ops Agent", time: "Today 07:40", status: "Open" },
      { level: "L2", job: "DZR-J-1031", issue: "Client dispute on delivery condition", owner: "Ops Manager", time: "Yesterday", status: "Open" },
      { level: "L1", job: "DZR-J-1017", issue: "Vendor requested route change", owner: "Ops Agent", time: "Yesterday", status: "Resolved" },
      { level: "L1", job: "DZR-J-1012", issue: "Client asked to resend GPS tracking link", owner: "Ops Agent", time: "2 days ago", status: "Resolved" },
      { level: "L2", job: "DZR-J-1005", issue: "Significant delivery delay, 2h 40m behind", owner: "Ops Manager", time: "3 days ago", status: "Resolved" },
      { level: "L1", job: "DZR-J-1033", issue: "Minor cosmetic cargo damage, photographed", owner: "Ops Agent", time: "Today 06:40", status: "Resolved" },
      { level: "L1", job: "DZR-J-1032", issue: "Client requested tracking link resend", owner: "Ops Agent", time: "Yesterday", status: "Resolved" },
      { level: "L2", job: "DZR-J-1028", issue: "Client requested price reduction post-quote", owner: "Ops Manager", time: "3 days ago", status: "Resolved" },
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

  billing: {
    summary: [
      { label: "MRR", value: "AED 52.6k", note: "10 active vendor plans" },
      { label: "Outstanding", value: "AED 52.9k", note: "7 unpaid invoices" },
      { label: "Overdue", value: "AED 21.0k", note: "2 invoices, past due date" },
      { label: "Collected 30d", value: "AED 96k", note: "Includes closed jobs not shown below" }
    ],
    invoices: [
      { ref: "INV-DZR-J-1037", client: "DP World", amount: "AED 3,600", issued: "18 Jul", due: "17 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1038", client: "Nakheel", amount: "AED 2,100", issued: "17 Jul", due: "16 Aug", status: "Pending" },
      { ref: "INV-DZR-J-1029", client: "Emaar", amount: "AED 9,800", issued: "02 Jul", due: "01 Aug", status: "Pending" },
      { ref: "INV-DZR-J-1022", client: "Union Properties", amount: "AED 5,300", issued: "28 Jun", due: "28 Jul", status: "Pending" },
      { ref: "INV-DZR-J-1017", client: "Meraas", amount: "AED 14,200", issued: "20 Jun", due: "20 Jul", status: "Overdue" },
      { ref: "INV-DZR-J-1009", client: "Petrofac", amount: "AED 6,750", issued: "12 Jun", due: "12 Jul", status: "Overdue" },
      { ref: "INV-DZR-J-1028", client: "Dubai South Authority", amount: "AED 2,850", issued: "19 Jul", due: "18 Aug", status: "Pending" },
      { ref: "INV-DZR-J-1020", client: "Meraas", amount: "AED 6,200", issued: "13 Jul", due: "12 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1018", client: "Nakheel", amount: "AED 1,750", issued: "11 Jul", due: "10 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1015", client: "Emaar", amount: "AED 2,400", issued: "09 Jul", due: "08 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1010", client: "DP World", amount: "AED 3,950", issued: "07 Jul", due: "06 Aug", status: "Paid" },
      { ref: "INV-DZR-J-1007", client: "Al Futtaim Construction", amount: "AED 11,900", issued: "03 Jul", due: "02 Aug", status: "Pending" }
    ]
  }
};
