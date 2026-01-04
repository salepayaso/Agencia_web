const Section = ({ children, className = "", id = "" }) => {
    return (
        <section id={id} className={`py-20 px-4 md:px-8 relative ${className}`}>
            <div className="max-w-7xl mx-auto w-full relative z-10">
                {children}
            </div>
        </section>
    );
};

export default Section;
