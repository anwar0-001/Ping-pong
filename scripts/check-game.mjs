import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const marker = '<script>';
const start = html.indexOf(marker);
const end = html.indexOf('</script>', start + marker.length);
assert.notEqual(start, -1, 'page should contain an inline game script');
assert.notEqual(end, -1, 'inline game script should close');
const script = html.slice(start + marker.length, end);
new vm.Script(script, { filename: 'index.html inline game' });
assert.match(script, /function updateBest\\(\\)[\\s\\S]*?localStorage\\.setItem\\('neon-rally-best'/, 'best score should persist');
assert.match(script, /if\\(point==='player'\\)\\{game\\.player\\+\\+;updateBest\\(\\)\\}/, 'best score should update on every point');
assert.match(script, /window\\.addEventListener\\('blur',\\(\\)=>\\{keys\\.up=false;keys\\.down=false;game\\.mouseY=null\\}\\)/, 'lost focus should release held controls');
assert.match(script, /pointercancel/, 'cancelled touch input should release the paddle');
assert.match(html, /aria-live="polite"/, 'score announcements should remain available to assistive technology');
console.log('Ping-pong inline script syntax and game-state invariants passed.');
