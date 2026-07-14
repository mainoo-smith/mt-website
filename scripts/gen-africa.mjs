import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("africa_raw.json", "utf8"));

// Africa bounds (lon/lat)
const LON_MIN = -17.6;
const LON_MAX = 51.1;
const LAT_MIN = -34.8;
const LAT_MAX = 37.3;

const cx = (LON_MIN + LON_MAX) / 2;
const cy = (LAT_MIN + LAT_MAX) / 2;
const midLatRad = (cy * Math.PI) / 180;
const lonScale = Math.cos(midLatRad); // reduce east-west distortion

const TARGET_HEIGHT = 3.1;
const scale = TARGET_HEIGHT / (LAT_MAX - LAT_MIN);

function project([lon, lat]) {
  const x = (lon - cx) * lonScale * scale;
  const y = (lat - cy) * scale;
  return [Number(x.toFixed(4)), Number(y.toFixed(4))];
}

const countries = [];
for (const f of data.features) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  const rings = [];
  for (const poly of polys) {
    const outer = poly[0]; // outer ring only
    if (outer.length < 4) continue;
    rings.push(outer.map(project));
  }
  if (rings.length) countries.push({ name: f.properties?.name ?? "", rings });
}

const totalPts = countries.reduce(
  (a, c) => a + c.rings.reduce((b, r) => b + r.length, 0),
  0,
);

const out = `// AUTO-GENERATED from Natural Earth-derived Africa GeoJSON. Do not edit by hand.
// Projected (equirectangular, Africa-centered), normalized to ~${TARGET_HEIGHT} units tall.
// ${countries.length} countries, ${totalPts} points.
export type CountryShape = { name: string; rings: [number, number][][] };

export const AFRICA_COUNTRIES: CountryShape[] = ${JSON.stringify(
  countries.map((c) => ({ name: c.name, rings: c.rings })),
)};
`;

writeFileSync("src/components/experience/africaShapes.ts", out);
console.log(`wrote ${countries.length} countries, ${totalPts} points`);
