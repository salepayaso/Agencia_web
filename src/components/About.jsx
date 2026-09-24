import { Clock, Gauge, Handshake, KeyRound, MessageCircle } from 'lucide-react';
import Section from './ui/Section';
import { openChat } from '../lib/chat';

const PASOS = [
    {
        title: 'Conversamos',
        desc: 'Nos cuentas cómo funciona tu negocio hoy: qué te quita tiempo, dónde se te escapan clientes y qué te gustaría resolver.',
    },
    {
        title: 'Te enviamos una propuesta',
        desc: 'Concreta y con precio cerrado. Sabes qué vas a recibir, cuánto cuesta y cuándo está listo, antes de pagar nada.',
    },
    {
        title: 'Lo construimos',
        desc: 'Te mostramos avances reales durante el proceso, no solo el resultado final. Si algo no calza, se ajusta en el camino.',
    },
    {
        title: 'Te acompañamos',
        desc: 'Después de la entrega seguimos ahí: monitoreamos que todo funcione y te ayudamos cuando lo necesites.',
    },
];

const COMPROMISOS = [
    {
        icon: KeyRound,
        title: 'Tu sitio es tuyo',
        desc: 'Sin arriendos eternos ni plataformas que te amarran. Lo que construimos te pertenece.',
    },
    {
        icon: Gauge,
        title: 'Rápido y siempre en línea',
        desc: 'Carga en segundos desde el celular y lo vigilamos las 24 horas para que no se caiga.',
    },
    {
        icon: Handshake,
        title: 'Hablas con quien lo construye',
        desc: 'Sin ejecutivos de por medio ni tickets que se pierden. Trato directo, de principio a fin.',
    },
    {
        icon: Clock,
        title: 'Respuesta en 24 horas',
        desc: 'Si nos escribes, te contestamos dentro de un día hábil. Y el asesor del chat responde al instante.',
    },
];

const About = () => {
    return (
        <>
            {/* ---- Historia ---- */}
            <Section id="about" className="!pb-12">
                <div className="max-w-4xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400 mb-5">Nosotros</p>
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] mb-8 text-balance">
                        Primero entendemos tu negocio. Después lo construimos.
                    </h1>
                    <div className="grid md:grid-cols-2 gap-6 md:gap-10 text-lg text-gray-300 leading-relaxed">
                        <p>
                            Somos un equipo chileno que diseña, construye y cuida la presencia digital de pymes y emprendedores:
                            sitios web, Google, sistemas de gestión y asistentes con inteligencia artificial.
                        </p>
                        <p>
                            Una web o un sistema solo vale la pena si resuelve algo de tu día a día. No vendemos tecnología:
                            vendemos más clientes, menos trabajo repetido y un negocio más ordenado.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ---- Cómo trabajamos ---- */}
            <Section className="!py-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-10">Cómo trabajamos</h2>
                <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-3xl overflow-hidden border border-white/10">
                    {PASOS.map((paso, i) => (
                        <li key={paso.title} className="bg-dark-bg p-7 flex flex-col gap-3">
                            <span className="text-sm font-semibold text-primary-400 tabular-nums">Paso {i + 1}</span>
                            <h3 className="text-xl font-bold">{paso.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{paso.desc}</p>
                        </li>
                    ))}
                </ol>
            </Section>

            {/* ---- Compromisos ---- */}
            <Section className="!py-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-10">Lo que te aseguramos</h2>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
                    {COMPROMISOS.map((c) => (
                        <div key={c.title} className="flex gap-5">
                            <span className="flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400">
                                <c.icon className="w-6 h-6" />
                            </span>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ---- Cierre ---- */}
            <Section className="!pt-8 pb-24">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-white/10 pt-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">¿Conversamos sobre tu negocio?</h2>
                        <p className="text-gray-400">Cuéntale a nuestro asesor qué necesitas. Te responde al instante.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openChat('Hola, quiero conversar sobre un proyecto para mi negocio.')}
                        className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white text-dark-bg font-semibold hover:bg-primary-400 transition-colors shrink-0"
                    >
                        <MessageCircle className="w-5 h-5" /> Hablar con el asesor
                    </button>
                </div>
            </Section>
        </>
    );
};

export default About;
