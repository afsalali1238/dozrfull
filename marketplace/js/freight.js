/* Freight request form behavior. */
document.addEventListener("DOMContentLoaded", () => {
  const origin = document.getElementById("origin");
  const destination = document.getElementById("destination");
  const cargo = document.getElementById("cargo");
  const freightDate = document.getElementById("freightDate");
  const vehicleType = document.getElementById("vehicleType");
  const preview = document.getElementById("vehiclePreview");
  const link = document.getElementById("freightQuote");

  const form = document.getElementById("freightForm");

  /* Maps each vehicle type option to its preview photo. Drop the real
     photo into assets/vehicles/ with the filename below and it appears
     automatically on selection — no code changes needed. Until then the
     .photo placeholder (labeled gray block) shows, same as elsewhere on
     the site. */
  const VEHICLE_IMAGES = {
    "Lowbed trailer": "assets/vehicles/lowbed-trailer.jpg",
    "Flatbed trailer": "assets/vehicles/flatbed-trailer.jpg",
    "Crane truck": "assets/vehicles/crane-truck.jpg",
    "Box truck": "assets/vehicles/box-truck.jpg",
    "Not sure": "",
  };

  function updateVehiclePreview() {
    if (!preview || !vehicleType) return;
    const selected = vehicleType.value;
    const image = VEHICLE_IMAGES[selected] || "";
    preview.style.backgroundImage = image ? `url('${image}')` : "none";
    const isNotSure = selected === "Not sure";
    const label = isNotSure ? "Any suitable vehicle" : selected;
    preview.setAttribute("aria-label", label);
    if (isNotSure) {
      preview.setAttribute("data-cap", label);
    } else {
      preview.removeAttribute("data-cap");
    }
  }

  if (vehicleType) {
    updateVehiclePreview();
    vehicleType.addEventListener("change", updateVehiclePreview);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const lane = `${origin.value || 'Origin TBD'} to ${destination.value || 'Destination TBD'}`;
    const url = DozrWhatsApp.requestFreight(
      lane,
      cargo.value || "Cargo TBD",
      freightDate.value || "Pickup date TBD",
      vehicleType.value || "Vehicle TBD"
    );
    // New-tab, not same-tab redirect - see equipment-detail.js for why
    // (2026-07-22 audit: WhatsApp handoffs were inconsistent site-wide).
    window.open(url, "_blank", "noopener,noreferrer");
  });
});
