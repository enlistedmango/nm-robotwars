import React from 'react';
import { useState } from 'react';
import { isEnvBrowser } from './utils/misc';
import { useNuiEvent } from './hooks/useNuiEvent';
import { fetchNui } from './utils/fetchNui';

function App() {
  const [visible, setVisible] = useState(isEnvBrowser());
  const [count, setCount] = useState(0);

  useNuiEvent('setVisible', (data: { visible?: boolean }) => {
    setVisible(data.visible || false);
  });

  function handleHideModal() {
    setVisible(false);
    void fetchNui('exit');
  }

  return (
    <>
      {visible && (
        <div className="scoreboard-wrapper">
          <div className="scoreboard-modal-container">
            <h3>Robot Wars Scoreboard</h3>
            <p>Count: {count}</p>

            <div>
              <button onClick={() => setCount((prev) => ++prev)}>Player 1</button>
              <button onClick={() => setCount((prev) => --prev)}>Player 2</button>
              <button onClick={() => handleHideModal()}>Close Menu</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
