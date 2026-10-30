// The thank-you for the email sign-ups (portfolio intro, lab archive): a paper plane takes off from the button
// with a little dotted trail, then the thanks slides in and a heart pops. Styles are in global.css; with reduced
// motion only the thanks shows.
const PLANE =
  '<i class="signup-trail"></i><i class="signup-trail"></i><i class="signup-trail"></i>' +
  '<svg class="signup-plane" viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>';

export function sendOff(form: HTMLElement, button: HTMLElement, thanks: HTMLElement, message: string) {
  // the plane starts where the button was
  const from = button.getBoundingClientRect();
  const box = form.getBoundingClientRect();
  if (getComputedStyle(form).position === 'static') form.style.position = 'relative';
  const send = document.createElement('span');
  send.className = 'signup-send';
  send.setAttribute('aria-hidden', 'true');
  send.style.setProperty('--from-x', `${from.left + from.width / 2 - box.left}px`);
  send.style.setProperty('--from-y', `${from.top + from.height / 2 - box.top}px`);
  send.innerHTML = PLANE;
  form.append(send);
  // gone once the last trail dot has landed (the plane takes 1s, the dots trail it by up to 0.18s)
  setTimeout(() => send.remove(), 1300);

  thanks.hidden = false;
  thanks.textContent = message;
  thanks.classList.add('signup-thanks');
  const heart = document.createElement('span');
  heart.className = 'signup-heart';
  heart.setAttribute('aria-hidden', 'true');
  heart.textContent = '♥';
  thanks.append(heart);
}
