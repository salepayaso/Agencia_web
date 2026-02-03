import { useEffect, useRef } from 'react';

const MagneticParticles = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let mouse = { x: null, y: null };

        // Configuration
        const particleCount = 40;
        const colorPalette = ['#06b6d4', '#8b5cf6', '#ffffff']; // cyan, purple, white
        const connectionDistance = 100;
        const mouseRange = 200;

        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 0.5;
                this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
            }

            update() {
                // Mouse interaction (Gravity effect)
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;

                    // Gravity strength based on distance (closer = stronger)
                    const maxDistance = mouseRange;
                    let force = (maxDistance - distance) / maxDistance;

                    // If within range, be attracted to mouse
                    if (distance < mouseRange) {
                        const attractionStrength = 2; // Control how strong the gravity is
                        this.vx += forceDirectionX * force * attractionStrength * 0.05;
                        this.vy += forceDirectionY * force * attractionStrength * 0.05;
                    }
                }

                // Friction/Drag (to stop them from accelerating forever)
                this.vx *= 0.98;
                this.vy *= 0.98;

                // Move
                this.x += this.vx;
                this.y += this.vy;

                // Random natural movement if not moving much
                if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
                    this.x += (Math.random() - 0.5) * 0.2;
                    this.y += (Math.random() - 0.5) * 0.2;
                }

                // Boundary wrap
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections first (optional, makes it look like a web)
            /*
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 - distance/connectionDistance/10})`; 
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
            */

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        init();
        animate();

        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-auto">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default MagneticParticles;
