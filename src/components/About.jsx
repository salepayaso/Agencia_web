import Section from './ui/Section';
import Card from './ui/Card';
import { CheckCircle2 } from 'lucide-react';

const About = () => {
    const skills = [
        "Arquitectura de Software", "React & Next.js", "Node.js & Bases de Datos",
        "Diseño UI/UX", "Optimización Web (SEO)", "Integración de APIs",
        "Seguridad Web", "Gestión de Servidores"
    ];

    return (
        <Section id="about">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold mb-4 border border-primary-500/20">
                        SOBRE MÍ
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Más que código, <br />construyo soluciones.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                        Soy un Arquitecto Web y Digital Manager apasionado por la tecnología. Mi enfoque no es simplemente escribir líneas de código, sino entender tu negocio y crear un ecosistema digital que lo impulse.
                    </p>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                        Con experiencia full-stack, domino cada etapa del proceso digital: desde el diseño de la interfaz hasta la lógica del servidor y la infraestructura. Trabajo contigo directamente, sin intermediarios, garantizando calidad y comunicación fluida.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {skills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                                <span className="text-sm font-medium">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="rounded-3xl shadow-2xl border border-white/10" alt="Workspace" />

                        <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl max-w-xs animate-float">
                            <p className="font-bold text-white text-lg mb-1">"La calidad nunca es un accidente."</p>
                            <p className="text-gray-400 text-sm">- Filosofía de trabajo</p>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default About;
