const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

const canvas = document.querySelector(".sky-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const stars = [];
  const bands = [];
  const rootStyle = getComputedStyle(document.body);
  const accent = (rootStyle.getPropertyValue("--accent") || "#00e5ff").trim();

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildScene();
  }

  function buildScene() {
    stars.length = 0;
    bands.length = 0;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const count = Math.min(150, Math.floor(width / 9));

    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.35,
        alpha: Math.random() * 0.45 + 0.08,
        drift: Math.random() * 0.14 + 0.02
      });
    }

    for (let i = 0; i < 5; i += 1) {
      bands.push({
        x: Math.random() * width,
        width: Math.random() * 180 + 90,
        speed: Math.random() * 0.16 + 0.04,
        opacity: Math.random() * 0.08 + 0.03
      });
    }
  }

  function hexToRgb(value) {
    const hex = value.replace("#", "");
    if (hex.length !== 6) {
      return { r: 0, g: 229, b: 255 };
    }

    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  const rgb = hexToRgb(accent);

  function render(time) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    bands.forEach((band) => {
      band.x += band.speed;
      if (band.x - band.width > width) {
        band.x = -band.width;
      }

      const grad = ctx.createLinearGradient(band.x, 0, band.x + band.width, 0);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${band.opacity})`);
      grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(band.x, 0, band.width, height);
    });

    stars.forEach((star) => {
      const flicker = Math.sin(time * 0.001 + star.x * 0.01 + star.y * 0.02) * 0.16;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0.08, star.alpha + flicker)})`;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      star.y += star.drift;
      if (star.y > height) {
        star.y = -3;
      }
    });

    for (let y = 0; y < height; y += 88) {
      const offset = Math.sin(time * 0.0008 + y * 0.03) * 18;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.09)`;
      ctx.lineWidth = 1;
      ctx.moveTo(0, y + offset);
      ctx.quadraticCurveTo(width * 0.45, y - offset, width, y + offset * 0.5);
      ctx.stroke();
    }

    const scanY = (time * 0.05) % (height + 140) - 140;
    const scan = ctx.createLinearGradient(0, scanY, 0, scanY + 140);
    scan.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    scan.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.13)`);
    scan.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = scan;
    ctx.fillRect(0, scanY, width, 140);

    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(render);
}
