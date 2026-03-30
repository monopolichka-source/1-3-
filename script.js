// ===== РЕГИСТРАЦИЯ ПЛАГИНОВ GSAP =====
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ===== СЕКЦИЯ 2: ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ И АНИМАЦИЯ МЫШКИ =====

// ДВИЖЕНИЕ СЦЕНЫ
gsap.to(".scene", {
  x: -1100,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll",
    start: "top top",
    end: "bottom-=200 bottom",
    scrub: true
  }
});

// ДВИЖЕНИЕ МЫШКИ
gsap.to(".bat", {
  motionPath: {
    path: [
      {x: 0, y: 0},
      {x: 200, y: -200},
      {x: 500, y: -120},
      {x: 950, y: 0},
      {x: 1300, y: -140},
      {x: 1600, y: -50},
      {x: 1700, y: 50}
    ],
    curviness: 1.6
  },
  scrollTrigger: {
    trigger: ".scroll",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});

gsap.to(".bat", {
  scale: 0.2,
  opacity: 0,
  rotation: 25,
  transformOrigin: "center center",
  scrollTrigger: {
    trigger: ".scroll",
    start: "top+=1500 top",
    end: "top+=1800 top",
    scrub: true
  }
});

// СБОР КРИСТАЛЛОВ
const crystals = document.querySelectorAll(".crystal");
const bat = document.querySelector(".bat");

function checkCollision() {
  const batRect = bat.getBoundingClientRect();

  crystals.forEach(crystal => {
    const rect = crystal.getBoundingClientRect();
    const offset = 80;

    const isClose =
      batRect.left + offset < rect.right &&
      batRect.right - offset > rect.left &&
      batRect.top + offset < rect.bottom &&
      batRect.bottom - offset > rect.top;

    if (isClose) {
      crystal.classList.add("collected");
    }
  });
}

ScrollTrigger.create({
  trigger: ".scroll",
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: checkCollision
});

// ===== СЕКЦИЯ 3: DRAG & DROP =====

let dragged = null;
let burner = null;
let storedBottle = null;

// SNAP
function snapTo(el, target) {
  const t = target.getBoundingClientRect();
  const parent = document.querySelector('.scene-cooking').getBoundingClientRect();

  el.style.right = 'auto';
  el.style.left = (t.left - parent.left + t.width / 2 - el.offsetWidth / 2) + 'px';
  el.style.top = (t.top - parent.top + t.height / 2 - el.offsetHeight / 2) + 'px';
}

// DRAG AND DROP
document.querySelectorAll('[draggable="true"]').forEach(el => {
  el.addEventListener('dragstart', () => {
    dragged = el;
    setTimeout(() => el.style.opacity = '0.5', 0);
  });

  el.addEventListener('dragend', () => {
    el.style.opacity = '1';
    dragged = null;
  });
});

// DROP ZONES
document.querySelectorAll('.dropzone').forEach(zone => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('active');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('active');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('active');
    handleDrop(zone, dragged);
  });
});

// ЛОГИКА DROP
function handleDrop(zone, el) {
  if (!el) return;

  const type = el.dataset.type;
  const drop = zone.dataset.drop;

  const sand = document.querySelector('.sand');
  const crystals = document.querySelector('.interactiveCrystals');
  const bottleSand = document.querySelector('.bottleSand');
  const bottleCrystals = document.querySelector('.bottleCrystals');
  const result = document.querySelector('.bottleLenses');
  const hot = document.querySelector('.lensesHot-1');
  const cold = document.querySelector('.lensesCold-1');

  // ВОДА НА ГОРЕЛКУ
  if (type === 'water' && drop === 'burner' && !burner) {
    burner = el;
    snapTo(el, zone);
    return;
  }

  // ДОБАВИЛИ ИНГРЕДИЕНТ
  if (drop === 'burner' && burner && type === 'sand') {
    burner.classList.add('hidden');
    burner = null;
    sand.classList.add('hidden');
    bottleSand.classList.remove('hidden');
    snapTo(bottleSand, zone);
    burner = bottleSand;
    return;
  }

  if (drop === 'burner' && burner && type === 'crystals') {
    burner.classList.add('hidden');
    burner = null;
    crystals.classList.add('hidden');
    bottleCrystals.classList.remove('hidden');
    snapTo(bottleCrystals, zone);
    burner = bottleCrystals;
    return;
  }

  // В ЗОНУ БУТЫЛОК
  if (drop === 'bottles') {
    snapTo(el, zone);
    if (burner === el) {
      burner = null;
    }
    storedBottle = el;
    return;
  }

  // СМЕШИВАНИЕ
  if (
    drop === 'burner' &&
    burner &&
    storedBottle &&
    el === storedBottle &&
    (burner.dataset.type === 'sandBottle' || burner.dataset.type === 'crystalBottle')
  ) {
    burner.classList.add('hidden');
    storedBottle.classList.add('hidden');
    burner = null;
    storedBottle = null;
    result.classList.remove('hidden');
    snapTo(result, zone);
    burner = result;
    return;
  }

  // В ФОРМЫ
  if (type === 'result' && drop === 'molds') {
    snapTo(el, zone);
    setTimeout(() => {
      result.classList.add('hidden');
      const hotLenses = document.querySelectorAll('.lensesHot-1, .lensesHot-2');
      hotLenses.forEach(l => l.classList.remove('hidden'));
      setTimeout(() => {
        hotLenses.forEach(l => l.classList.add('hidden'));
        const coldLenses = document.querySelectorAll('.lensesCold-1, .lensesCold-2');
        coldLenses.forEach(l => l.classList.remove('hidden'));
      }, 1500);
    }, 300);
  }
}

// ===== СЕКЦИЯ 4: ГЕНЕРАТОР ОЧКОВ =====

document.addEventListener("DOMContentLoaded", () => {
  const glassesList = [
    "glasses/droplets.svg",
    "glasses/growths.svg",
    "glasses/flowers.svg",
    "glasses/thorns.svg",
    "glasses/metallic.svg",
    "glasses/orange.svg",
  ];

  const img = document.getElementById("glasses");
  const btn = document.getElementById("generateBtn");
  const batGlasses = document.getElementById("batGlasses");

  // при загрузке — надеваем сохранённые очки
  const saved = localStorage.getItem("selectedGlasses");
  if (saved && batGlasses) {
    batGlasses.src = saved;
  }

  // клик по кнопке
  btn.addEventListener("click", () => {
    let counter = 0;
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * glassesList.length);
      img.src = glassesList[random];
      counter++;

      if (counter > 20) {
        clearInterval(interval);
        localStorage.setItem("selectedGlasses", img.src);
        if (batGlasses) {
          batGlasses.src = img.src;
        }
      }
    }, 80);
  });
});