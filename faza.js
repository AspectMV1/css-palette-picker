var root = {
  FPS: 20,
  PA: 128,
  PS: 1.8,
  PCD: 50,
  PC: "FFFFFF",
};

class Particle {
  constructor({
    ctx,
    width,
    height,
    scale,
    color,
    connectDistance,
    isMouseParticle = false,
    isMiddleParticle = false,
    isinverseMouseParticle = false,
    speed,
  }) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * speed,
      y: (Math.random() - 0.5) * speed,
    };
    this.connectDistance = connectDistance;
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.isMouseParticle = isMouseParticle;
    this.isMiddleParticle = isMiddleParticle;
    this.isinverseMouseParticle = isinverseMouseParticle;
  }

  update() {
    if (this.isMouseParticle) {
      return;
    }
    if (this.isinverseMouseParticle) {
      return;
    }
    if (this.isMiddleParticle) {
      return;
    }

    if (this.x > this.width || this.x < 0) {
      this.velocity.x *= -1;
    }

    if (this.y > this.height || this.y < 0) {
      this.velocity.y *= -1;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw(distance) {
    if (distance > this.connectDistance && this.isMouseParticle == false) {
      return;
    }
    if (
      distance > this.connectDistance &&
      this.isinverseMouseParticle == false
    ) {
      return;
    }
    if (distance > this.connectDistance && this.isMiddleParticle == false) {
      return;
    }

    if (this.isMouseParticle) {
      distance = 0;
    }

    if (this.isinverseMouseParticle) {
      distance = 0;
    }
    if (this.isMiddleParticle) {
      distance = 0;
    }

    this.ctx.beginPath();
    this.ctx.fillStyle = this.hexToRgb(
      this.color,
      1 - distance / this.connectDistance
    );
    this.ctx.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  hexToRgb(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const rgba = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: opacity,
    };

    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }
}

class NetworkParticle {
  constructor({
    ctx,
    width,
    height,
    targetFPS = -1,
    particleAmount,
    particleColor,
    particleScale,
    particleConnectDistance,
  }) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.lastUpdateTime = 0;
    this.updateInterval = targetFPS / 1000;
    this.updateTimer = 0;
    this.animation = null;
    this.particleAmount = particleAmount;
    this.particleColor = particleColor;
    this.particleScale = particleScale;
    this.particleConnectDistance = particleConnectDistance;
    this.createParticles();
    this.mousePosition = { x: 0, y: 0 };
    window.addEventListener("mousemove", (e) => {
      this.mousePosition = {
        x: e.pageX,
        y: e.pageY,
      };
    });
  }

  createParticles() {
    this.particles = [];

    const inversemouseParticle = new Particle({
      ctx: this.ctx,
      width: this.width,
      height: this.height,
      scale: this.particleScale,
      color: this.particleColor,
      connectDistance: this.particleConnectDistance,
      isinverseMouseParticle: true,
      speed: 1,
    });
    const mouseParticle = new Particle({
      ctx: this.ctx,
      width: this.width,
      height: this.height,
      scale: this.particleScale,
      color: this.particleColor,
      connectDistance: this.particleConnectDistance,
      isMouseParticle: true,
      speed: 1,
    });

    const middleParticle = new Particle({
      ctx: this.ctx,
      width: this.width,
      height: this.height,
      scale: this.particleScale,
      color: this.particleColor,
      connectDistance: this.particleConnectDistance,
      isMiddleParticle: true,
      speed: 1,
    });
    this.particles.push(mouseParticle);
    this.particles.push(inversemouseParticle);
    this.particles.push(middleParticle);

    for (let i = 0; i < this.particleAmount; i++) {
      const particle = new Particle({
        ctx: this.ctx,
        width: this.width,
        height: this.height,
        scale: this.particleScale,
        color: this.particleColor,
        connectDistance: this.particleConnectDistance,
        speed: 1,
      });
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    for (let i = 0; i < this.particleAmount; i++) {
      const particle = this.particles[i];
      const gy = window.innerHeight;
      const gx = window.innerWidth;

      const mpDistance =
        (Math.pow(particle.x - this.mousePosition.x, 2) +
          Math.pow(particle.y - this.mousePosition.y, 2)) /
        1000;

      const mpDistance2 =
        (Math.pow(particle.x + this.mousePosition.x - gx, 2) +
          Math.pow(particle.y + this.mousePosition.y - gy, 2)) /
        1000;

      if (particle.isMouseParticle) {
        particle.x = this.mousePosition.x;
        particle.y = this.mousePosition.y;
      }
      if (particle.isinverseMouseParticle) {
        particle.x = gx - this.mousePosition.x;
        particle.y = gy - this.mousePosition.y;
      }
      if (particle.isMiddleParticle) {
        particle.x = gx / 2;
        particle.y = gy / 2;
      }

      particle.update();
      particle.draw(mpDistance);
      particle.draw(mpDistance2);

      for (let j = this.particleAmount - 1; j > i; j--) {
        const dx = this.particles[i].x - this.particles[j].x,
          dy = this.particles[i].y - this.particles[j].y,
          distance = (dx ** 2 + dy ** 2) / 100;

        if (distance > this.particleConnectDistance * 2) {
          continue;
        }

        this.connect(
          {
            x: this.particles[i].x,
            y: this.particles[i].y,
          },
          {
            x: this.particles[j].x,
            y: this.particles[j].y,
          },
          distance
        );
        this.connect2(
          {
            x: this.particles[i].x,
            y: this.particles[i].y,
          },
          {
            x: this.particles[j].x,
            y: this.particles[j].y,
          },
          distance
        );
      }
    }
  }

  connect(a, b, distance) {
    const c = {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
    const gy = window.innerHeight;
    const gx = window.innerWidth;

    const mpDistance =
      (Math.pow(c.x + this.mousePosition.x - gx, 2) +
        Math.pow(c.y + this.mousePosition.y - gy, 2)) /
      1000;

    if (mpDistance > this.particleConnectDistance) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.hexToRgb(
      this.particleColor,
      ((this.particleConnectDistance - distance) /
        this.particleConnectDistance) *
        (1 - mpDistance / this.particleConnectDistance)
    );
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.stroke();
  }
  connect2(a, b, distance) {
    const c = {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
    const gy = window.innerHeight;
    const gx = window.innerWidth;

    const mpDistance =
      (Math.pow(c.x - this.mousePosition.x, 2) +
        Math.pow(c.y - this.mousePosition.y, 2)) /
      1000;

    if (mpDistance > this.particleConnectDistance) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.hexToRgb(
      this.particleColor,
      ((this.particleConnectDistance - distance) /
        this.particleConnectDistance) *
        (1 - mpDistance / this.particleConnectDistance)
    );
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.stroke();
  }

  hexToRgb(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const rgba = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: opacity,
    };

    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }

  animate(timeStamp = 0) {
    const deltaTime = timeStamp - this.lastUpdateTime;
    this.lastUpdateTime = timeStamp;

    if (this.updateTimer > this.updateInterval) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.update(deltaTime);
    } else {
      this.updateTimer += deltaTime;
    }

    this.animation = requestAnimationFrame(this.animate.bind(this));
  }

  cancelAnimation() {
    if (this.animation == null) {
      return;
    }

    cancelAnimationFrame(this.animation);
    this.animation = null;
    this.createParticles();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
const canvas = document.querySelector(".cv");
const networkParticle = new NetworkParticle({
  ctx: canvas.getContext("2d"),
  width: window.innerWidth,
  height: window.innerHeight,
  targetFPS: root.FPS,
  // particleAmount: 256,
  particleAmount: root.PA,
  particleScale: root.PS,
  particleColor: root.PC,
  particleConnectDistance: root.PCD,
});

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ibg").forEach((e) => {
    const img = e.querySelector("img");
    e.style.backgroundImage = `url('${img.src}')`;
  });

  const bgImg = document.querySelector(".bg-img");
  window.addEventListener("mousemove", (e) => {
    const screen = {
      x: window.innerWidth,
      y: window.innerHeight,
    };

    const amplitude = 1.8;

    const deltaX = ((e.clientX - screen.x / 2) / screen.x) * 2 * amplitude,
      deltaY = ((e.clientY - screen.y / 2) / screen.y) * 2 * amplitude;

    bgImg.style.transform = `scale(1.05) translate(${deltaX}px, ${deltaY}px)`;
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  networkParticle.animate();
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  networkParticle.cancelAnimation();
  networkParticle.resize(window.innerWidth, window.innerHeight);
  networkParticle.animate();
});
// function livelyPropertyListener(name, val)
// {
//     switch(name) {
//         case "targetFPS":
//           root.FPS = val;
//           break;
//         case "Particle Amount":
//           root.PA = val;
//           break;
//         case "Particle Scale":
//           root.PS = val;
//           break;
//         case "particleConnectDistance":
//           root.PCD = val;
//           break;
//         case "particleColor":
// 		root.PC = parseInt(val.substring(1),16);
//           break;
//       }
// }
