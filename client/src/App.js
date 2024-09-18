import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    fetch('/')
      .then(response => response.text())
      .then(message => {
        console.log(message);
      });
  }, []);

  return (
    <div className="App">
      <h1>Group Eats App</h1>
    </div>
  );
}

export default App;
