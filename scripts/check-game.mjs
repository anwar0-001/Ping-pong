import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];
assert.equal(scripts.length, 1, 'page should contain one inline game script');
new vm.Script(scripts[0][1], { filename: 'index.html inline game' });
assert.match(scripts[0][1], /function updateBest\\(\\)[\\s\\S]*?localStorage\\.setItem\\('neon-rally-best'/, 'best score should persist');
assert.match(scripts[0][1], /if\\(point==='player'\\)\\{game\\.player\\+\\+;updateBest\\(\\)\\}/, 'best score should update on every point');
assert.match(scripts[0][1], /window\\.addEventListener\\('blur',\\(\\)=>\\{keys\\.up=false;keys\\.down=false;game\\.mouseY=null\\}\\)/, 'lost focus should release held controls');
assert.match(scripts[0][1], /pointercancel/, 'cancelled touch input should release the paddle');
assert.match(html, /aria-live="polite"/, 'score announcements should remain available to assistive technology');
console.log('Ping-pong inline script syntax and game-state invariants passed.');
