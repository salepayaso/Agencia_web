import { motion } from 'framer-motion';

const variants = {
    primary: "bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 border border-transparent",
    glass: "glass text-white hover:bg-white/20 border-white/20",
    outline: "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
};

const Button = ({ children, variant = "primary", className = "", icon: Icon, href, trackingLabel, onClick, ...props }) => {
    const Component = href ? motion.a : motion.button;

    const handleClick = (e) => {
        if (trackingLabel && window.dataLayer) {
            window.dataLayer.push({
                event: 'interest_click',
                service_name: trackingLabel,
                click_url: href || 'button'
            });
        }
        if (onClick) onClick(e);
    };

    return (
        <Component
            href={href}
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`cursor-pointer relative px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </Component>
    );
};

export default Button;
