// Accessible pressed states and horizontal tab discovery on narrow touch screens.
const tabs=[...document.querySelectorAll('nav button[data-tab]')];
for(const button of tabs){button.setAttribute('aria-pressed',String(button.classList.contains('active')));button.addEventListener('click',()=>{for(const panel of document.querySelectorAll('.panel'))panel.hidden=panel.id!==button.dataset.tab;for(const other of tabs){other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));}if(matchMedia('(max-width:1099px)').matches){button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});const panel=document.getElementById(button.dataset.tab);if(panel)requestAnimationFrame(()=>panel.scrollIntoView({block:'start',behavior:'instant'}));}});}

for(const nav of document.querySelectorAll('nav')){nav.removeAttribute('inert');nav.dataset.ready='true';}
