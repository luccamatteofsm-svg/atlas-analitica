// ===== THEME (escuro/claro) =====
// aplica tema salvo antes do paint (fallback caso a página não tenha inline no <head>)
(function () {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  // ==== injeta link "Carteira" no menu (funciona em qualquer página) ====
  const menu =
    document.querySelector('header .menu') ||
    document.querySelector('nav .menu') ||
    document.querySelector('.nav-list');

  if (menu && !menu.querySelector('a[data-id="carteira"]')) {
    const li = document.createElement('li');
    li.innerHTML = `<a data-id="carteira" href="/carteira.html">Carteira</a>`;
    // tenta colocar antes de "Outros"
    const outros = [...menu.querySelectorAll('a')].find(a => /Outros/i.test(a.textContent));
    if (outros && outros.parentElement && outros.parentElement.parentElement === menu) {
      menu.insertBefore(li, outros.parentElement);
    } else {
      menu.appendChild(li);
    }
  }

  // ==== botão de alternância de tema (coloca no canto do header se não existir) ====
  if (!document.querySelector('#themeToggle')) {
    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.style.cssText = 'margin-left:12px;border:1px solid var(--border,#2a2f3a);border-radius:999px;padding:6px 10px;background:transparent;cursor:pointer;';
    const setLabel = () => btn.textContent = document.documentElement.classList.contains('dark') ? '🌙' : '☀️';
    setLabel();
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      setLabel();
    });

    // tenta localizar área à direita do header; se não tiver, põe no fim do nav
    const right =
      document.querySelector('.header-actions') ||
      document.querySelector('header nav') ||
      document.querySelector('header') ||
      document.body;

    right.appendChild(btn);
  }
});
