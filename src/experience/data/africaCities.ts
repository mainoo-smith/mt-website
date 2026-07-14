/** Projection constants — must match scripts/gen-africa.mjs. */
const PROJ = {
  cx: 16.75,
  cy: 1.25,
  lonScale: Math.cos((1.25 * Math.PI) / 180),
  scale: 3.1 / 72.1,
};

export function projectCity(lon: number, lat: number): [number, number] {
  return [
    (lon - PROJ.cx) * PROJ.lonScale * PROJ.scale,
    (lat - PROJ.cy) * PROJ.scale,
  ];
}

/** Major African cities — glowing nodes on the landmass. */
const CITY_COORDS: [number, number][] = [
  [31.24, 30.05], // Cairo
  [3.39, 6.45], // Lagos
  [15.27, -4.44], // Kinshasa
  [28.05, -26.2], // Johannesburg
  [36.82, -1.29], // Nairobi
  [38.74, 9.03], // Addis Ababa
  [-0.19, 5.6], // Accra
  [-7.59, 33.57], // Casablanca
  [-17.44, 14.69], // Dakar
  [32.53, 15.59], // Khartoum
  [13.23, -8.84], // Luanda
  [39.28, -6.82], // Dar es Salaam
  [-4.02, 5.35], // Abidjan
  [3.06, 36.75], // Algiers
  [18.42, -33.92], // Cape Town
  [32.58, 0.31], // Kampala
  [7.49, 9.06], // Abuja
  [32.58, -25.97], // Maputo
  [10.18, 36.81], // Tunis
  [17.08, -22.56], // Windhoek
];

export const CITY_LIGHTS: [number, number][] = CITY_COORDS.map(([lon, lat]) =>
  projectCity(lon, lat),
);
