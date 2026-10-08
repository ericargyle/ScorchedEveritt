import {
  defaults,
  createMatch,
  startRound,
  move,
  fire,
  step,
  tankY,
} from "./engine.js";
const $ = (id) => document.getElementById(id),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let options = { ...defaults };
try {
  let s = JSON.parse(localStorage.getItem("scorched-options"));
  if (s) {
    options.sound = s.sound === true;
    options.wind = s.wind === true;
    options.rounds = [1, 3, 5, 7, 9].includes(s.rounds) ? s.rounds : 5;
    options.sky = ["night", "dawn", "day"].includes(s.sky) ? s.sky : "night";
  }
} catch {}
let match = null,
  audio,
  blastUntil = 0;
const save = () => {
  try {
    localStorage.setItem("scorched-options", JSON.stringify(options));
  } catch {}
  $("sound").textContent = options.sound ? "Sound on" : "Sound off";
};
save();
function tone(kind) {
  if (!options.sound) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  audio ??= new Audio();
  audio.resume().catch(() => {});
  let notes =
    kind === "level"
      ? [392, 523, 659, 784]
      : kind === "intro"
        ? [392, 392, 392, 523, 659, 587, 523]
        : kind === "fire"
          ? [180, 70]
          : [85, 45, 30];
  notes.forEach((n, i) => {
    let o = audio.createOscillator(),
      g = audio.createGain(),
      t = audio.currentTime + i * 0.11;
    o.type = kind === "impact" ? "sawtooth" : "triangle";
    o.frequency.setValueAtTime(n, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + 0.25);
  });
}
function modal(html) {
  $("dialogContent").innerHTML = html;
  const heading = $("dialogContent").querySelector("h2");
  if (heading) {
    heading.id = "dialogTitle";
    $("dialog").setAttribute("aria-labelledby", "dialogTitle");
  }
  if (!$("dialog").open) $("dialog").showModal();
}
function close() {
  $("dialog").close();
}
function button(id, fn) {
  $(id).onclick = fn;
}
function home() {
  close();
  match = null;
  $("home").hidden = false;
  $("game").hidden = true;
}
button("brand", (e) => {
  e.preventDefault();
  if (match) pause();
  else home();
});
button("sound", () => {
  options.sound = !options.sound;
  save();
  tone("level");
});
button("options", () => {
  modal(
    '<h2>Field conditions</h2><p>Your preferences carry over into the next match.</p><label><input id="optSound" type="checkbox">Sound effects & melodies</label><label><input id="optWind" type="checkbox">Wind physics</label><label>Rounds<select id="optRounds">' +
      [1, 3, 5, 7, 9].map((n) => "<option>" + n + "</option>").join("") +
      '</select></label><label>Sky<select id="optSky"><option value="night">Midnight blue</option><option value="dawn">Desert dawn</option><option value="day">Clear day</option></select></label><button id="saveOptions" class="primary">Save options</button>',
  );
  $("optSound").checked = options.sound;
  $("optWind").checked = options.wind;
  $("optRounds").value = options.rounds;
  $("optSky").value = options.sky;
  button("saveOptions", () => {
    options = {
      sound: $("optSound").checked,
      wind: $("optWind").checked,
      rounds: Number($("optRounds").value),
      sky: $("optSky").value,
    };
    save();
    close();
    tone("level");
  });
});
button("credits", () => {
  modal(
    '<small>UIUC · ECE291 · SPRING 2001</small><h2>The original team</h2><p><strong>Suneil Hosmane</strong><br>Game Engine, Physics, I/O Control</p><p><strong>Terrence Janas</strong><br>Graphics, Multimedia Design, Webmaster</p><p><strong>Yajur Parikh</strong><br>Physics, Intro</p><hr><p>A modern recreation from the surviving design document and pseudocode. The original implementation was not available. Rebuilt with OpenClaw for Eric Argyle.</p><p>Legacy timer/delay acknowledgment: Edwin Daniels. Original inspiration: Scorched Earth by Wendell Hicken. No Scorched Earth code or assets used. Optional intro motif: public-domain Battle Hymn of the Republic, newly synthesized.</p><button id="back">Back to base</button>',
  );
  button("back", close);
});
function exit() {
  modal(
    '<h2>Until the next duel.</h2><p>You can now close this tab or application window. Your options are saved.</p><button id="back">Return to menu</button>',
  );
  button("back", home);
}
button("exit", exit);
let names = [],
  types = [];
function setup(i = 0) {
  modal(
    "<small>CREW SELECTION · " +
      (i + 1) +
      " / 2</small><h2>Player " +
      (i + 1) +
      ', gear up.</h2><label>Callsign<input id="name" maxlength="24" value="Player ' +
      (i + 1) +
      '" autocomplete="off"></label><label>Tank chassis<select id="type"><option value="rover">Rover · classic tread</option><option value="heavy">Bulwark · heavy silhouette</option><option value="scout">Scout · low profile</option></select></label><p>Chassis are cosmetic. Same firepower. Pure skill.</p><button id="next" class="primary">' +
      (i ? "Deploy to hillside" : "Choose player 2") +
      '</button><button id="cancel">Cancel</button>',
  );
  button("cancel", home);
  button("next", () => {
    names[i] = $("name").value.trim() || "Player " + (i + 1);
    types[i] = $("type").value;
    if (!i) setup(1);
    else begin();
  });
}
button("play", () => {
  tone("intro");
  setup();
});
function begin() {
  close();
  match = createMatch(names, types, options);
  startRound(match);
  $("home").hidden = true;
  $("game").hidden = false;
  sync();
}
function sync() {
  if (!match) return;
  let p = match.players[match.turn];
  $("round").textContent =
    "ROUND " + match.round + " / " + match.options.rounds;
  $("turn").textContent = p.name + "’s turn";
  $("scores").innerHTML = match.players
    .map(
      (p) =>
        "<div><b>" +
        esc(p.name) +
        "</b><small>" +
        p.score +
        " PTS · " +
        p.wins +
        " WINS · LV " +
        p.level +
        "</small></div>",
    )
    .join("");
  $("wind").textContent = match.options.wind
    ? "WIND " + (match.wind < 0 ? "← " : "→ ") + Math.abs(match.wind).toFixed(1)
    : "WIND OFF";
  for (let key of ["angle", "power"]) {
    $(key).value = p[key];
    $(key + "Value").textContent = p[key] + (key === "angle" ? "°" : "%");
    $(key).disabled = match.phase !== "aim";
  }
  for (let id of ["fire", "left", "right"])
    $(id).disabled = match.phase !== "aim";
  $("status").textContent =
    match.phase === "flight"
      ? "Shot away. Watch your trajectory."
      : match.phase === "aim"
        ? "Set your angle. Find your range. Fire when ready."
        : "";
}
for (let key of ["angle", "power"])
  $(key).oninput = () => {
    if (match?.phase === "aim") {
      match.players[match.turn][key] = Number($(key).value);
      sync();
    }
  };
button("left", () => {
  move(match, -12);
});
button("right", () => {
  move(match, 12);
});
button("fire", () => {
  if (fire(match)) {
    tone("fire");
    sync();
  }
});
function pause() {
  if (!match) return;
  modal(
    '<h2>Hold your fire.</h2><p>Game paused. Shots alternate between players. Adjust angle and power, move to a better position, then fire. A hit wins the round. Avoid your own blast!</p><button id="resume" class="primary">Resume</button><button id="abandon">End match / menu</button>',
  );
  button("resume", close);
  button("abandon", () => {
    modal(
      '<h2>End this match?</h2><p>Current scores will be lost.</p><button id="keep" class="primary">Keep playing</button><button id="end">End match</button>',
    );
    button("keep", close);
    button("end", home);
  });
}
button("menu", pause);
function resolved() {
  sync();
  if (match.phase === "handoff") {
    modal(
      "<small>PASS THE DEVICE</small><h2>" +
        esc(match.players[match.turn].name) +
        ', your shot.</h2><p>No direct hit. Study the last trajectory and adjust your aim.</p><button id="ready" class="primary">Ready to aim</button>',
    );
    button("ready", () => {
      match.phase = "aim";
      close();
      sync();
    });
  } else if (match.phase === "result") {
    let r = match.result,
      p = match.players[r.winner];
    if (r.levelUp) tone("level");
    modal(
      "<small>ROUND " +
        match.round +
        " COMPLETE</small><h2>" +
        esc(p.name) +
        " wins!</h2><p>+" +
        r.points +
        " points · " +
        p.score +
        " total</p>" +
        (r.levelUp
          ? "<p>LEVEL UP → " +
            p.level +
            "<br>Blast radius increased to " +
            (30 + p.level * 7) +
            " units.</p>"
          : "") +
        '<button id="continue" class="primary">' +
        (match.round < match.options.rounds ? "Next round" : "Match results") +
        "</button>",
    );
    button("continue", () => {
      if (match.round < match.options.rounds) {
        startRound(match);
        close();
        sync();
      } else final();
    });
  }
}
function final() {
  let [a, b] = match.players;
  let w =
    a.wins === b.wins ? (a.score >= b.score ? a : b) : a.wins > b.wins ? a : b;
  modal(
    "<small>THE DUST HAS SETTLED</small><h2>" +
      esc(w.name) +
      " takes the match.</h2>" +
      match.players
        .map(
          (p) =>
            "<p><strong>" +
            esc(p.name) +
            "</strong> · " +
            p.wins +
            " rounds won · " +
            p.score +
            " points</p>",
        )
        .join("") +
      '<button id="again" class="primary">Play again</button><button id="base">Main menu</button><button id="quit">Quit</button>',
  );
  button("again", begin);
  button("base", home);
  button("quit", exit);
}
document.addEventListener("keydown", (e) => {
  if (!match || $("dialog").open) return;
  if (e.key === "Escape") {
    pause();
    return;
  }
  if (
    match.phase !== "aim" ||
    ["INPUT", "SELECT", "BUTTON"].includes(document.activeElement.tagName)
  )
    return;
  let p = match.players[match.turn];
  if (
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "+",
      "-",
      "Enter",
    ].includes(e.key)
  )
    e.preventDefault();
  if (e.key === "ArrowLeft") move(match, -12);
  if (e.key === "ArrowRight") move(match, 12);
  if (e.key === "ArrowUp") p.angle = Math.min(175, p.angle + 1);
  if (e.key === "ArrowDown") p.angle = Math.max(5, p.angle - 1);
  if (e.key === "+") p.power = Math.min(100, p.power + 1);
  if (e.key === "-") p.power = Math.max(10, p.power - 1);
  if (e.key === "Enter" && fire(match)) tone("fire");
  sync();
});
$("dialog").addEventListener("cancel", (e) => {
  if (match && ["handoff", "result"].includes(match.phase)) e.preventDefault();
});
const ctx = $("field").getContext("2d");
function draw() {
  let m = match,
    c = ctx;
  if (!m) return;
  let sky = {
    night: ["#13243c", "#355468"],
    dawn: ["#483d59", "#cf8869"],
    day: ["#5286a4", "#b0d6d4"],
  }[m.options.sky];
  let g = c.createLinearGradient(0, 0, 0, 520);
  g.addColorStop(0, sky[0]);
  g.addColorStop(1, sky[1]);
  c.fillStyle = g;
  c.fillRect(0, 0, 1000, 520);
  c.fillStyle = "#efdba7";
  c.beginPath();
  c.arc(790, 90, 27, 0, Math.PI * 2);
  c.fill();
  if (m.options.sky === "night") {
    c.fillStyle = "#bccddd";
    for (let i = 0; i < 45; i++)
      c.fillRect((i * 173) % 1000, (i * 37) % 240, 1.5, 1.5);
  }
  c.fillStyle = "#456574";
  c.beginPath();
  c.moveTo(0, 520);
  for (let x = 0; x <= 1000; x += 10) c.lineTo(x, 310 + Math.sin(x / 150) * 50);
  c.lineTo(1000, 520);
  c.fill();
  c.fillStyle = "#264d47";
  c.beginPath();
  c.moveTo(0, 520);
  m.land.forEach((y, x) => c.lineTo(x, y));
  c.lineTo(1000, 520);
  c.fill();
  c.strokeStyle = "#7ba690";
  c.lineWidth = 3;
  c.beginPath();
  m.land.forEach((y, x) => (x ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
  c.strokeStyle = "#f8dca088";
  c.lineWidth = 2;
  c.setLineDash([3, 7]);
  c.beginPath();
  m.trail.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
  c.setLineDash([]);
  m.players.forEach((p, i) => {
    let y = tankY(m, p),
      a = (p.angle * Math.PI) / 180,
      d = i ? -1 : 1;
    c.save();
    c.translate(p.x, y);
    c.fillStyle = "#0c1a25";
    c.fillRect(-22, 3, 44, 10);
    c.fillStyle = i ? "#8dd5c6" : "#fac36c";
    let w = p.type === "heavy" ? 42 : p.type === "scout" ? 29 : 36;
    c.fillRect(-w / 2, -5, w, 12);
    c.beginPath();
    c.arc(0, -5, p.type === "heavy" ? 12 : 9, Math.PI, 0);
    c.fill();
    c.strokeStyle = c.fillStyle;
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(0, -8);
    c.lineTo(Math.cos(a) * 26 * d, -8 - Math.sin(a) * 26);
    c.stroke();
    c.fillStyle = "#eaf0e8";
    c.font = "bold 15px system-ui";
    c.textAlign = "center";
    c.fillText(String(i + 1), 0, -32);
    if (i === m.turn && m.phase === "aim") {
      c.strokeStyle = "#ffffff66";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, 32, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  });
  if (m.shot) {
    c.fillStyle = "#fff1cb";
    c.shadowColor = "#ffb445";
    c.shadowBlur = 15;
    c.beginPath();
    c.arc(m.shot.x, m.shot.y, 4, 0, 7);
    c.fill();
    c.shadowBlur = 0;
  }
  if (m.blast && performance.now() < blastUntil) {
    c.fillStyle = "#ffbd6588";
    c.beginPath();
    c.arc(m.blast.x, m.blast.y, m.blast.radius, 0, 7);
    c.fill();
  }
}
let last = 0,
  acc = 0;
function frame(now) {
  let elapsed = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (match && !$("dialog").open && !document.hidden) {
    acc += elapsed;
    while (acc >= 1 / 120) {
      acc -= 1 / 120;
      let event = step(match);
      if (event) {
        if (event === "impact") {
          tone("impact");
          blastUntil = now + 700;
        }
        draw();
        resolved();
        break;
      }
    }
  } else acc = 0;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
