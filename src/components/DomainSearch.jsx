import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, CheckCircle2, XCircle, AlertTriangle, Loader2, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import Button from './ui/Button';

const PLANS = [
    { id: '1', label: '1 año', price: '$25.000', note: 'Registro + gestión anual' },
    { id: '2', label: '2 años', price: '$45.000', note: 'Registro + gestión por 2 años', badge: 'Ahorra $5.000' },
];

const DomainSearch = () => {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | available | taken | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [planId, setPlanId] = useState('1');

    const cleanName = value.toLowerCase().trim().replace(/\.cl$/, '');
    const isValid = cleanName.length >= 2 && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(cleanName);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!isValid || status === 'loading') return;

        setStatus('loading');
        setResult(null);

        try {
            const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(cleanName)}`);
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'No pudimos realizar la consulta. Intenta de nuevo.');
                setStatus('error');
                return;
            }

            setResult(data);
            setStatus(data.available ? 'available' : 'taken');

            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'domain_search',
                    domain_name: data.domain,
                    domain_available: data.available
                });
            }
        } catch {
            setErrorMsg('No pudimos realizar la consulta. Intenta de nuevo.');
            setStatus('error');
        }
    };

    const selectedPlan = PLANS.find((p) => p.id === planId) || PLANS[0];
    const whatsappMsg = result
        ? `Hola Interfaz 360, busqué en su web y el dominio ${result.domain} está disponible. Quiero reservarlo por ${selectedPlan.label} (${selectedPlan.price}).`
        : '';

    return (
        <section id="buscador-dominio" className="py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 mb-5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span className="font-semibold uppercase tracking-wider">Dominios .cl — Consulta en tiempo real</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight leading-tight"
                    >
                        ¿Tu dominio <span className="text-gradient font-black">.cl está disponible?</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 max-w-2xl mx-auto text-lg"
                    >
                        Busca el nombre de tu marca o negocio y descúbrelo al instante. Si está libre, nos encargamos de todo el registro y configuración.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-[32px] p-[1px] bg-gradient-to-r from-red-500/40 via-rose-500/35 to-red-800/40 shadow-[0_0_60px_-10px_rgba(220,38,38,0.6),_0_0_30px_-5px_rgba(239,68,68,0.3)] overflow-hidden"
                >
                    <div className="bg-[#0b0f19]/90 backdrop-blur-2xl rounded-[31px] p-6 md:p-10">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-400 transition-colors pointer-events-none z-10">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => { setValue(e.target.value); setStatus('idle'); }}
                                    placeholder="minegocio"
                                    maxLength={70}
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-20 py-5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/80 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary-500/10 transition-all text-xl font-medium tracking-wide shadow-inner"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center z-10 pointer-events-none select-none">
                                    <span className="text-primary-400 font-bold bg-primary-500/10 border border-primary-500/20 rounded-xl px-3.5 py-1.5 text-sm tracking-wider shadow-sm">
                                        .cl
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                type="submit"
                                className="!py-5 !px-10 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base shadow-[0_4px_25px_rgba(2,132,199,0.35)] bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 border-0 text-white rounded-2xl flex items-center justify-center gap-2"
                                disabled={!isValid || status === 'loading'}
                                trackingLabel="Dominio: Buscar disponibilidad"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Consultando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-5 h-5" />
                                        <span>Buscar Disponibilidad</span>
                                    </>
                                )}
                            </Button>
                        </form>

                        {value && !isValid && (
                            <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-amber-400/80 text-xs mt-3 flex items-center gap-1.5 pl-1"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>Usa solo letras, números y guiones (mínimo 2 caracteres, sin espacios ni símbolos).</span>
                            </motion.p>
                        )}

                        <AnimatePresence mode="wait">
                            {status === 'available' && result && (
                                <motion.div
                                    key="available"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="mt-8 rounded-2xl border border-green-500/30 bg-green-950/20 p-6 md:p-8 shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-xl flex items-center gap-2 flex-wrap">
                                                ¡El dominio <span className="bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/30 text-green-400 font-mono tracking-tight text-lg shadow-sm">{result.domain}</span> está libre!
                                            </p>
                                            <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                                                Felicidades, puedes asegurar esta dirección hoy mismo. Nosotros gestionamos todo por ti y te lo entregamos listo para tu sitio web y correos corporativos.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                        {PLANS.map((plan) => (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => setPlanId(plan.id)}
                                                className={`relative text-left rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                                                    planId === plan.id
                                                        ? 'border-green-400 bg-green-950/30 shadow-lg shadow-green-500/5 ring-1 ring-green-400'
                                                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                                                }`}
                                            >
                                                {plan.badge && (
                                                    <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-gray-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                                                        {plan.badge}
                                                    </span>
                                                )}
                                                <div className="flex items-center justify-between mb-2 w-full">
                                                    <span className="text-white font-bold text-sm tracking-wide uppercase text-gray-400">{plan.label}</span>
                                                    <span
                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                            planId === plan.id ? 'border-green-400' : 'border-gray-600'
                                                        }`}
                                                    >
                                                        {planId === plan.id && <span className="w-2.5 h-2.5 rounded-full bg-green-400" />}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-green-400 font-black text-2xl tracking-tight">{plan.price}</p>
                                                    <p className="text-gray-400 text-xs mt-1.5 leading-tight">{plan.note}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        href={`https://wa.me/56954146176?text=${encodeURIComponent(whatsappMsg)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="primary"
                                        className="w-full !py-4.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-0 shadow-[0_4px_25px_rgba(16,185,129,0.3)] text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2.5"
                                        trackingLabel="Dominio: Reservar por WhatsApp"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span>Resérvalo por WhatsApp ({selectedPlan.label} — {selectedPlan.price})</span>
                                    </Button>
                                </motion.div>
                            )}

                            {status === 'taken' && result && (
                                <motion.div
                                    key="taken"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="mt-8 rounded-2xl border border-red-500/30 bg-red-950/20 p-6 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                                            <XCircle className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg flex items-center gap-2 flex-wrap">
                                                El dominio <span className="bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20 text-red-400 font-mono tracking-tight text-base">{result.domain}</span> ya está ocupado
                                            </p>
                                            <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                                                No te preocupes, puedes intentar con variaciones como:
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="bg-white/5 border border-white/10 text-gray-300 font-mono text-xs px-2.5 py-1 rounded-lg">{cleanName}chile.cl</span>
                                                <span className="bg-white/5 border border-white/10 text-gray-300 font-mono text-xs px-2.5 py-1 rounded-lg">{cleanName}web.cl</span>
                                                <span className="bg-white/5 border border-white/10 text-gray-300 font-mono text-xs px-2.5 py-1 rounded-lg">{cleanName}ventas.cl</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed self-center">{errorMsg}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-xs">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-cyan-500/70" />
                                Consulta en tiempo real sobre los registros oficiales de dominios.
                            </span>
                            <span>La disponibilidad definitiva se confirma al momento del registro.</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default DomainSearch;
