document.addEventListener('DOMContentLoaded', () => {
  const views = [...document.querySelectorAll('[data-home-view]')];
  let currentView = null;
  const renderView = () => {
    const requested = location.hash.slice(1) || 'menu';
    const active = views.some(view => view.dataset.homeView === requested) ? requested : 'menu';
    const update = () => {
      views.forEach(view => { view.hidden = view.dataset.homeView !== active; });
      window.dispatchEvent(new Event('portfolio:viewchange'));
    };
    if (currentView !== null && window.ipodTransition) window.ipodTransition(update, active === 'menu' ? -1 : 1);
    else update();
    currentView = active;
  };
  window.portfolioBack = () => { location.hash = ''; };
  window.addEventListener('hashchange', renderView);
  renderView();
  const form = document.getElementById('console-form');
  const input = document.getElementById('console-input');
  const output = document.getElementById('console-output');
  if (!form || !input || !output) return;
  form.hidden = false;
  const commands = {
    help: 'Commands: bio, social, projects, coursework, skills, contact, clear, ls, man, cd, sudo, pacman, apt, quote, riddle, fact.',
    bio: 'I’m Miguel Cruz, a software engineer interested in operating systems, computer architecture, emulation, and native AI on Apple Silicon.',
    skills: 'C, C++, Python, Swift, TypeScript, Java, Go, and Assembly. Systems programming, reverse engineering, MLX, and web development.',
    coursework: 'Programming, operating systems, data structures, programming languages, cognitive science, and machine learning.',
    ls: 'projects.html  blog.html  school.html  gallery.html',
    man: 'Try help for the available commands.',
    cd: 'You’re already home.',
    sudo: 'No root access needed. Just curiosity.',
    pacman: 'I use Arch too, btw.',
    'pacman -syu': 'I use Arch too, btw :)',
    apt: 'An Arch household.',
    'apt-get update': 'An Arch household.',
    'apt-get upgrade': 'An Arch household.',
    quote: '“The only way to do great work is to love what you do.” — Steve Jobs',
    riddle: 'What has keys but can’t open locks? A keyboard.',
    fact: 'In 1947, a moth was found in a relay of the Harvard Mark II computer.'
  };
  const append = (text, className) => {
    const line = document.createElement('p');
    line.textContent = text;
    if (className) line.className = className;
    output.append(line);
    return line;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;
    const command = raw.toLowerCase();
    input.value = '';
    if (command === 'clear') { output.replaceChildren(); return; }
    append('~ $ ' + raw, 'terminal-prompt');
    if (['projects', 'social', 'contact'].includes(command)) {
      const destinations = {
        projects: ['Explore all projects and ports →', '/projects.html'],
        social: ['Find me on GitHub →', 'https://github.com/Acelogic'],
        contact: ['mcruz@mcruz.me', 'mailto:mcruz@mcruz.me']
      };
      const [label, href] = destinations[command];
      const link = document.createElement('a');
      link.textContent = label;
      link.href = href;
      append('').append(link);
    } else {
      append(Object.hasOwn(commands, command) ? commands[command] : 'Command not found. Try help.');
    }
    while (output.children.length > 40) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  });
});
