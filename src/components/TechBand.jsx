import { useEffect, useRef } from 'react';

// Franja con las tecnologías que usamos. Detrás, un canvas con partículas que
// se apartan del mouse. Solo se anima mientras la franja está a la vista.
const TECH = [
    { name: 'React', d: 'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm5.92 8.22c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438z' },
    { name: 'Node.js', d: 'M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.192-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.085.049-.139.145-.139.241v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603L11.075.236c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078c-.28.163-.599.247-.925.247z' },
    { name: 'Tailwind', d: 'M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z' },
    { name: 'Supabase', d: 'M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z' },
    { name: 'Vercel', d: 'M24 22.525H0l12-21.05 12 21.05z' },
    { name: 'GitHub', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
    { name: 'Claude IA', d: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z' },
];

const TechBand = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const cv = canvasRef.current;
        const band = cv?.parentElement;
        const ctx = cv?.getContext('2d');
        if (!ctx) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mouse = { x: -999, y: -999 };
        let P = [], W = 0, H = 0, running = false, raf = 0;

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < P.length; i++) {
                const a = P[i];
                for (let j = i + 1; j < P.length; j++) {
                    const b = P[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
                    if (d < 4900) {
                        ctx.strokeStyle = `rgba(170,179,195,${0.16 * (1 - d / 4900)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
                const mx = a.x - mouse.x, my = a.y - mouse.y, md = mx * mx + my * my;
                if (md < 14400) {
                    ctx.strokeStyle = `rgba(232,71,28,${0.5 * (1 - md / 14400)})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
                ctx.fillStyle = a.o ? '#e8471c' : 'rgba(223,227,234,.55)';
                ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
            }
        };

        const size = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = band.clientWidth; H = band.clientHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.round(Math.min(110, W / 11));
            P = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: 0.15 + Math.random() * 0.35,
                vy: (Math.random() - 0.5) * 0.15,
                r: Math.random() < 0.14 ? 1.9 : 1.2,
                o: Math.random() < 0.14,
            }));
            draw();
        };

        const step = () => {
            for (const a of P) {
                a.x += a.vx; a.y += a.vy;
                const mx = a.x - mouse.x, my = a.y - mouse.y, md = mx * mx + my * my;
                if (md < 3600 && md > 0) {
                    const f = ((3600 - md) / 3600) * 0.9, dm = Math.sqrt(md);
                    a.x += (mx / dm) * f; a.y += (my / dm) * f;
                }
                if (a.x > W + 4) a.x = -4;
                if (a.y < -4) a.y = H + 4;
                if (a.y > H + 4) a.y = -4;
            }
            draw();
            if (running) raf = requestAnimationFrame(step);
        };

        const onMove = (e) => {
            const r = band.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
            if (reduce) draw();
        };
        const onLeave = () => {
            mouse.x = mouse.y = -999;
            if (reduce) draw();
        };

        band.addEventListener('pointermove', onMove);
        band.addEventListener('pointerleave', onLeave);
        window.addEventListener('resize', size);
        size();

        let io;
        if (!reduce && 'IntersectionObserver' in window) {
            io = new IntersectionObserver(([en]) => {
                if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(step); }
                else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf); }
            });
            io.observe(band);
        }

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            io?.disconnect();
            band.removeEventListener('pointermove', onMove);
            band.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('resize', size);
        };
    }, []);

    return (
        <section className="tech gutter" aria-label="Tecnologías que usamos">
            <canvas ref={canvasRef} aria-hidden="true" />
            <div className="max">
                <span className="lead">La tecnología <b>con la que trabajamos</b></span>
                <div className="rail">
                    {[false, true].map((dup) => (
                        <ul key={String(dup)} className={dup ? 'dup' : undefined} aria-hidden={dup || undefined}>
                            {TECH.map((t) => (
                                <li key={t.name}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={t.d} /></svg>
                                    {t.name}
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechBand;
