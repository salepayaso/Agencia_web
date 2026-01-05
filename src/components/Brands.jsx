import { motion } from 'framer-motion';

const brands = [
    { name: "Vite", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg" },
    { name: "React", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
    { name: "Tailwind CSS", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" },
    { name: "Supabase", logo: "https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png" },
    { name: "PostgreSQL", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" },
    { name: "Python", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" },
    { name: "GitHub", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg" },
    { name: "Reddit", logo: "https://seeklogo.com/images/R/reddit-logo-23F13F6A6A-seeklogo.com.png" }, // Contour version
];

const Brands = () => {
    return (
        <section className="py-6 bg-black/40 border-y border-white/5 overflow-hidden backdrop-blur-sm relative z-20">
            <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] opacity-80">
                    Stack Tecnológico & Herramientas
                </p>
            </div>

            <div className="relative flex w-full overflow-hidden mask-linear-gradient">
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-gray-900 to-transparent"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-gray-900 to-transparent"></div>

                {/* Container with PB-16 to allow space for tooltips inside the overflow-hidden area */}
                <motion.div
                    className="flex items-center gap-16 whitespace-nowrap pb-12 pt-2"
                    animate={{ x: "-50%" }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 35,
                            ease: "linear",
                        },
                    }}
                    style={{ width: "fit-content" }}
                >
                    {[...brands, ...brands].map((brand, index) => (
                        <div
                            key={index}
                            className="group relative flex flex-col items-center justify-center cursor-default min-w-[100px]"
                        >
                            <div className={`relative flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 ${brand.name === 'Reddit' ? 'h-14 w-14' : 'h-10 w-10 md:h-12 md:w-12'}`}>
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                    onMouseOver={(e) => brand.name === 'GitHub' ? e.target.style.filter = 'brightness(0) invert(1)' : e.target.style.filter = 'none'}
                                    onMouseOut={(e) => e.target.style.filter = 'brightness(0) invert(1)'}
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                            </div>

                            {/* Tooltip positioned nicely below */}
                            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-black/80 px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                                    {brand.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Brands;
