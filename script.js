(function initTheme(){
  const saved = localStorage.getItem('theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (sysDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle')?.setAttribute('aria-pressed', String(theme==='dark'));
})();
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('themeToggle')?.setAttribute('aria-pressed', String(next==='dark'));
});
// abrir/fechar menu mobile
const hamb = document.getElementById('hamb');
const list = document.querySelector('.nav-list');
hamb?.addEventListener('click', () => list.classList.toggle('open'));

// dropdown no mobile via clique
document.querySelectorAll('.has-dd > a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    if (window.matchMedia('(max-width:960px)').matches){
      e.preventDefault();
      a.parentElement.classList.toggle('open');
    }
  });
});

// fechar se clicar fora (mobile/desktop)
document.addEventListener('click', (e)=>{
  const inside = e.target.closest('.navbar');
  if(!inside){
    list?.classList.remove('open');
    document.querySelectorAll('.has-dd.open').forEach(li=>li.classList.remove('open'));
  }
});
// adiciona link "Carteira" no menu em qualquer página
document.addEventListener('DOMContentLoaded', () => {
  const navList =
    document.querySelector('.nav-list') ||
    document.querySelector('.menu'); // fallback pro menu antigo

  if (navList && !navList.querySelector('a[href="carteira.html"]')) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = 'carteira.html';
    a.textContent = 'Carteira';
    li.appendChild(a);

    // coloca no final; se quiser antes de "Outros", mude o appendChild para insertBefore
    navList.appendChild(li);
  }
});
