// {{title}}: starter sketch from `npm run new`. A dot loops around the stage; replace it with yours.
// start(stage) draws into the stage and returns stop (plus pause / resume / restart for those buttons).
// Needs p5: npm i p5 && npm i -D @types/p5
import { colours, type StartSketch } from '../../../lib/sketch';
import p5 from 'p5';

const start: StartSketch = (stage) => {
  let c = colours(stage); // the stage's colours; read again when Day / Night flips
  let t = 0;
  let ro: ResizeObserver | undefined;

  const sketch = new p5((p: p5) => {
    p.setup = () => {
      p.createCanvas(stage.clientWidth, stage.clientHeight);
      p.noStroke();
      ro = new ResizeObserver(() => p.resizeCanvas(stage.clientWidth, stage.clientHeight));
      ro.observe(stage);
    };
    p.draw = () => {
      t += 0.02;
      p.background(c.bg);
      p.fill(c.accent);
      p.circle(
        p.width / 2 + (Math.cos(t) * p.width) / 4,
        p.height / 2 + (Math.sin(t * 2) * p.height) / 5,
        24,
      );
    };
  }, stage);

  return {
    pause: () => sketch.noLoop(),
    resume: () => sketch.loop(),
    restart: () => {
      t = 0;
      sketch.redraw();
    },
    recolor: () => {
      c = colours(stage);
      sketch.redraw();
    },
    stop: () => {
      ro?.disconnect();
      sketch.remove();
    },
  };
};

export default start;
