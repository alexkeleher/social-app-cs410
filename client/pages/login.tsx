import React from 'react';
import './LoginPage.css'; 

const LoginPage: React.FC = () => {
  return (
    <div className="login-container">
      <div className="background-image"></div>
      <div className="login-form-container">
        <div className="login-content">
          <h1>Sign into GroupEats</h1>
          <form>
            <div className="input-container">
              <input type="text" placeholder="Email " />
            </div>
            <div className="input-container">
              <input type="password" placeholder="Password" />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
          <p className="forgot-password">Did you Forget Your password?</p>
          <p className="signup-text">
            Don't have an account? <a href="/signup">Sign up, it's free</a>
          </p>   <h></h>
          
            
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
