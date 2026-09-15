import React, { useEffect, useRef } from 'react';

interface StarfieldCanvasProps {
  isGenerating?: boolean;
  isSpeaking?: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({
  isGenerating = false,
  isSpeaking = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(56, 189, 248, ', // cyan
      'rgba(96, 165, 250, ', // blue
      'rgba(147, 197, 253, ', // soft blue
      'rgba(192, 132, 252, ', // purple
      'rgba(255, 255, 255, ', // white
    ];

    let stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];

    const initStars = () => {
      const starCount = Math.floor((width * height) / 4500);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = Math.random() * 0.7 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 0.6,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initStars();

    const spawnShootingStar = () => {
      if (Math.random() < 0.035 || isGenerating) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 120 + 80,
          speed: Math.random() * 8 + 10,
          angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 30 + 35,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let tick = 0;

    const render = () => {
      tick++;

      // Cosmic deep blue backdrop with radial glows
      ctx.clearRect(0, 0, width, height);

      // Gradient nebula glow in center
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 3,
        50,
        width / 2,
        height / 2,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      gradient.addColorStop(0.3, isGenerating ? 'rgba(30, 58, 138, 0.45)' : 'rgba(15, 30, 65, 0.4)');
      gradient.addColorStop(0.6, isSpeaking ? 'rgba(6, 182, 212, 0.2)' : 'rgba(12, 74, 110, 0.2)');
      gradient.addColorStop(1, 'rgba(3, 7, 18, 0.98)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render ambient nebula clouds
      const ambientNebula = ctx.createRadialGradient(
        width * 0.2,
        height * 0.8,
        20,
        width * 0.2,
        height * 0.8,
        400
      );
      ambientNebula.addColorStop(0, 'rgba(37, 99, 235, 0.12)');
      ambientNebula.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientNebula;
      ctx.fillRect(0, 0, width, height);

      // Draw & update stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        const boost = isGenerating ? 0.3 : isSpeaking ? 0.2 : 0;
        const currentAlpha = Math.min(1, star.alpha + boost);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${currentAlpha})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = star.size > 1.8 ? 8 : 3;
        ctx.fill();

        // Constellation lines near mouse
        const dx = mouseRef.current.x - star.x;
        const dy = mouseRef.current.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const lineAlpha = (1 - dist / 120) * 0.4;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw shooting stars
      spawnShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life++;
        ss.alpha = 1 - ss.life / ss.maxLife;

        if (ss.life >= ss.maxLife || ss.x > width || ss.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const ssGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        ssGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        ssGrad.addColorStop(0.7, `rgba(56, 189, 248, ${ss.alpha * 0.6})`);
        ssGrad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = ssGrad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Sparkle head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGenerating, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      id="senux-starfield-canvas"
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
