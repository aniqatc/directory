// Portfolio: the project in the middle of the screen lights up its dash in the pinned intro,
// turns its number mint and starts its drawing animating (.project.on in drawings.css).
import { onPage } from './page';

onPage(() => {
  const projects = [...document.querySelectorAll<HTMLElement>('.project')];
  const progress = document.querySelector<HTMLElement>('.progress');
  if (!projects.length || !progress) return;

  const dots = [...progress.querySelectorAll<HTMLButtonElement>('.dots button')];
  const nowN = progress.querySelector('.progress-now b')!;
  const nowT = progress.querySelector('.progress-now span')!;
  const total = String(projects.length).padStart(2, '0');

  const setOn = (i: number) => {
    projects.forEach((p, k) => p.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    nowN.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
    nowT.textContent = projects[i].dataset.title ?? '';
  };

  // a thin band just above the middle of the screen; whatever crosses it is "on"
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = projects.indexOf(en.target as HTMLElement);
        setOn(i === -1 ? projects.length - 1 : i); // past the projects (latest, colophon) = last one
      }),
    { rootMargin: '-40% 0px -55% 0px' },
  );
  projects.forEach((p) => io.observe(p));
  document.querySelectorAll('.latest, .colophon').forEach((el) => io.observe(el));

  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  dots.forEach((d, i) =>
    d.addEventListener('click', () =>
      projects[i].scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'start' }),
    ),
  );
  setOn(0);

  // on short screens the intro is taller than the window: pin it by its bottom so the counter stays visible
  const intro = progress.closest<HTMLElement>('.intro')!;
  const fitIntro = () => {
    const ideal = 52 + 44;
    const room = innerHeight - intro.offsetHeight - 24;
    document.documentElement.style.setProperty('--intro-top', `${Math.min(ideal, room)}px`);
  };
  addEventListener('resize', fitIntro);
  const ro = new ResizeObserver(fitIntro);
  ro.observe(intro);
  fitIntro();

  return () => {
    io.disconnect();
    ro.disconnect();
    removeEventListener('resize', fitIntro);
    document.documentElement.style.removeProperty('--intro-top');
  };
});
