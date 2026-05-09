const dateStr = '2026-04-30';
const d = new Date(dateStr + 'T00:00:00Z');
console.log('Original UTC:', d.toISOString());
d.setUTCDate(d.getUTCDate() + 1);
console.log('Plus 1 UTC:', d.toISOString());
console.log('Result:', d.toISOString().split('T')[0]);
