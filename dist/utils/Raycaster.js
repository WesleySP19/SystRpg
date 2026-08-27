export class Raycaster {
static computePolygon(origin, radius, segments) {
const bounds = [
{ p1: { x: origin.x - radius, y: origin.y - radius }, p2: { x: origin.x + radius, y: origin.y - radius } },
{ p1: { x: origin.x + radius, y: origin.y - radius }, p2: { x: origin.x + radius, y: origin.y + radius } },
{ p1: { x: origin.x + radius, y: origin.y + radius }, p2: { x: origin.x - radius, y: origin.y + radius } },
{ p1: { x: origin.x - radius, y: origin.y + radius }, p2: { x: origin.x - radius, y: origin.y - radius } }
];
const allSegments = [...segments, ...bounds];
const points = [];
for (let seg of allSegments) {
points.push(seg.p1, seg.p2);
}
const uniquePoints = [];
const pointSet = new Set();
for (let p of points) {
const key = `${Math.round(p.x)},${Math.round(p.y)}`;
if (!pointSet.has(key)) {
pointSet.add(key);
uniquePoints.push(p);
}
}
const angles = [];
for (let p of uniquePoints) {
const angle = Math.atan2(p.y - origin.y, p.x - origin.x);
angles.push(angle - 0.00001, angle, angle + 0.00001);
}
const intersects = [];
for (let angle of angles) {
const dx = Math.cos(angle);
const dy = Math.sin(angle);
const ray = {
p1: origin,
p2: { x: origin.x + dx * radius * 1.5, y: origin.y + dy * radius * 1.5 }
};
let closestIntersect = null;
let minT1 = Infinity;
for (let seg of allSegments) {
const intersect = this.getIntersection(ray, seg);
if (intersect && intersect.param < minT1) {
minT1 = intersect.param;
closestIntersect = intersect;
}
}
if (closestIntersect) {
closestIntersect.angle = angle;
intersects.push(closestIntersect);
}
}
intersects.sort((a, b) => a.angle - b.angle);
const flatPoints = [];
for (let intersect of intersects) {
const dist = Math.hypot(intersect.x - origin.x, intersect.y - origin.y);
if (dist > radius) {
const nx = origin.x + Math.cos(intersect.angle) * radius;
const ny = origin.y + Math.sin(intersect.angle) * radius;
flatPoints.push(nx, ny);
} else {
flatPoints.push(intersect.x, intersect.y);
}
}
return flatPoints;
}
static getIntersection(ray, segment) {
const r_px = ray.p1.x;
const r_py = ray.p1.y;
const r_dx = ray.p2.x - ray.p1.x;
const r_dy = ray.p2.y - ray.p1.y;
const s_px = segment.p1.x;
const s_py = segment.p1.y;
const s_dx = segment.p2.x - segment.p1.x;
const s_dy = segment.p2.y - segment.p1.y;
const r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
if (r_mag === 0) return null;
const s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
if (s_mag === 0) return null;
const T2 = r_dx * s_dy - r_dy * s_dx;
if (T2 === 0) return null; // Paralelos
const T1 = (s_px - r_px) * s_dy - (s_py - r_py) * s_dx;
const U1 = (s_px - r_px) * r_dy - (s_py - r_py) * r_dx;
const t1 = T1 / T2;
const t2 = U1 / T2;
if (t1 > 0 && t2 >= 0 && t2 <= 1) {
return {
x: r_px + r_dx * t1,
y: r_py + r_dy * t1,
param: t1
};
}
return null;
}
}