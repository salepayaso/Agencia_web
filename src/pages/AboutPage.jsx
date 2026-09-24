import PageShell, { PageHead, CtaBand } from '../components/PageShell';

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
    { title: 'Tu sitio es tuyo', desc: 'Sin arriendos eternos ni plataformas que te amarran. Lo que construimos te pertenece.' },
    { title: 'Rápido y siempre en línea', desc: 'Carga en segundos desde el celular y lo vigilamos las 24 horas para que no se caiga.' },
    { title: 'Hablas con quien lo construye', desc: 'Sin ejecutivos de por medio ni tickets que se pierden. Trato directo, de principio a fin.' },
    { title: 'Respuesta en 24 horas', desc: 'Si nos escribes, te contestamos dentro de un día hábil. Y el asesor del chat responde al instante.' },
];

const AboutPage = () => (
    <PageShell
        title="Nosotros"
        description="Conoce Interfaz 360: primero entendemos tu negocio y después lo construimos. Trato directo, propuesta con precio cerrado y acompañamiento después de la entrega."
    >
        <PageHead eyebrow="Nosotros" title={<>Primero entendemos<br />tu negocio. <span>Después</span><br />lo construimos.</>} />

        <section className="s gutter">
            <div className="max two-col">
                <p>
                    Somos un equipo chileno que diseña, construye y cuida la presencia digital de pymes y emprendedores:
                    sitios web, Google, sistemas de gestión y asistentes con inteligencia artificial.
                </p>
                <p>
                    Una web o un sistema solo vale la pena si resuelve algo de tu día a día. No vendemos tecnología:
                    vendemos más clientes, menos trabajo repetido y un negocio más ordenado.
                </p>
            </div>
        </section>

        <section className="s gutter" style={{ paddingTop: 0 }}>
            <div className="max">
                <div className="s-head">
                    <h2 className="display">Cómo<br />trabajamos</h2>
                    <p>Cuatro pasos, siempre en el mismo orden. Nada se paga antes de ver la propuesta.</p>
                </div>
                <ol className="steps">
                    {PASOS.map((p, i) => (
                        <li key={p.title}>
                            <span className="n">PASO {i + 1}</span>
                            <h3>{p.title}</h3>
                            <p>{p.desc}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>

        <section className="s gutter" style={{ paddingTop: 0 }}>
            <div className="max">
                <div className="s-head">
                    <h2 className="display">Lo que te<br />aseguramos</h2>
                </div>
                <div className="promises">
                    {COMPROMISOS.map((c) => (
                        <div key={c.title}>
                            <h3>{c.title}</h3>
                            <p>{c.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <CtaBand message="Hola, quiero conversar sobre un proyecto para mi negocio." />
    </PageShell>
);

export default AboutPage;
