export async function getUserLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      country: data.country_code || "US",
      country_name: data.country_name || "United States",
      city: data.city || "",
      region: data.region || "",
    };
  } catch {
    return { country: "US", country_name: "United States", city: "", region: "" };
  }
}
