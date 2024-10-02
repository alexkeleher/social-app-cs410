import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Username:', username);
        console.log('Password:', password);
    };

    return (
        <div className="main">
            <h1>GroupEats</h1>
            <h3>Enter your login credentials</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <div></div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="wrap">
                    <button type="submit">Submit</button>
                </div>
                <div>
                    <span className="psw">
                        Forgot <a href="#">username</a> or{' '}
                        <a href="#">password?</a>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default Login;
