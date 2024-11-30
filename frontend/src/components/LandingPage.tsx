import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <h1>GroupEats</h1>
            </header>

            <main className="landing-main">
                <h2>Decide where to eat, together</h2>
                <p>
                    GroupEats helps your group easily find the best places to
                    eat, taking into account everyone’s preferences.
                </p>
                <Link to="/create-group">
                    <button className="cta-button">Create Group</button>
                </Link>
                <Link to="/all-preferences">
                    <button className="cta-button">My Preferences</button>
                </Link>
                <Link to="/my-groups">
                    <button className="cta-button">My Groups</button>
                </Link>
            </main>

            <footer className="landing-footer">
                <p>© 2024 GroupEats. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
