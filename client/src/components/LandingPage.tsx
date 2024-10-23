import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <h1>GroupEats</h1>
                <style>{`
                .landing-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                }
                .landing-header, .landing-main, .landing-footer {
                    width: 100%;
                }
                .cta-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    margin-right: 10px;
                    margin-left: 5px;
                }
            `}</style>
            </header>

            <main className="landing-main">
                <h2>Decide where to eat, together</h2>
                <p>
                    GroupEats helps your group easily find the best places to
                    eat, taking into account everyone’s preferences.
                </p>
                <Link to="/create-group" className="cta-button">
                    <button className="cta-button">Create Group</button>
                </Link>
                <Link to="/all-preferences" className="cta-button">
                    <button className="cta-button">My Preferences</button>
                </Link>
                <Link to="/my-groups" className="cta-button">
                    <button className="cta-button">My Groups</button>
                </Link>
                <Link to="/login" className="cta-button">
                    <button className="cta-button">Login</button>
                </Link>
            </main>

            <footer className="landing-footer">
                <p>© 2024 GroupEats. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
