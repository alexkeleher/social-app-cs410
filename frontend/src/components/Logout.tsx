// src/components/Logout.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';

const Logout = () => {
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setAuth({});
        navigate('/login');
    };

    return (
        <button className="cta-button" onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;
