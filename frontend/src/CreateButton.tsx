import React from 'react';
import './styles/main.css'; // Import the CSS

interface CreateButtonProps {
    onClick: () => void; // Click handler
    children: React.ReactNode; // Button label (text)
    type?: 'button' | 'submit' | 'reset'; // Button type
    className?: string; // Optional className for additional styling
}

const CreateButton: React.FC<CreateButtonProps> = ({
    onClick,
    children,
    type = 'button', // Default type is 'button'
    className = '',
}) => {
    return (
        <button onClick={onClick} type={type} className={`create-button ${className}`}>
            {children}
        </button>
    );
};

export default CreateButton;
