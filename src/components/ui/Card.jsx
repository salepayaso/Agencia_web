import { motion } from 'framer-motion';

const Card = ({ children, className = "", hover = false, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
            className={`glass-card rounded-2xl p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
