import React from 'react';
//import 'styles/main.css';

interface LandingPageProps {
    goToCreateGroup: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ goToCreateGroup }) => {
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
                }
            `}</style>
            </header>

            <main className="landing-main">
                <h2>Decide where to eat, together</h2>
                <p>
                    GroupEats helps your group easily find the best places to
                    eat, taking into account everyone’s preferences.
                </p>
                <button className="cta-button" onClick={goToCreateGroup}>
                    Get Started
                </button>
            </main>

            <footer className="landing-footer">
                <p>© 2024 GroupEats. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
