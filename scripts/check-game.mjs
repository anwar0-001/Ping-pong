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
assert.ok(script.includes("function updateBest()") && script.includes("localStorage.setItem('neon-rally-best',String(best))"), 'best score should persist');
const loaderStart=script.indexOf('function loadBestScore()');
const loaderEnd=script.indexOf('\n',loaderStart);
assert.ok(loaderStart>=0&&loaderEnd>loaderStart,'stored score loader must exist');
const scoreContext={localStorage:{getItem:()=> '17'}};
vm.runInNewContext(script.slice(loaderStart,loaderEnd),scoreContext);
assert.equal(scoreContext.loadBestScore(),17,'valid saved score should load');
for(const stored of ['Infinity','-1','1.5','not-a-score']){
  const context={localStorage:{getItem:()=>stored}};
  vm.runInNewContext(script.slice(loaderStart,loaderEnd),context);
  assert.equal(context.loadBestScore(),0,'invalid stored score should fall back to zero');
}
const unavailableStorage={localStorage:{getItem(){throw new Error('blocked')}}};
vm.runInNewContext(script.slice(loaderStart,loaderEnd),unavailableStorage);
assert.equal(unavailableStorage.loadBestScore(),0,'blocked storage should not break the game');
assert.ok(script.includes("if(point==='player'){game.player++;updateBest()}"), 'best score should update on every point');
assert.ok(script.includes("window.addEventListener('blur',()=>{keys.up=false;keys.down=false;game.mouseY=null})"), 'lost focus should release held controls');
assert.ok(script.includes("canvas.addEventListener('pointercancel'"), 'cancelled touch input should release the paddle');
assert.ok(html.includes('aria-live="polite"'), 'score announcements should remain available to assistive technology');
console.log('Ping-pong inline script syntax and game-state invariants passed.');
