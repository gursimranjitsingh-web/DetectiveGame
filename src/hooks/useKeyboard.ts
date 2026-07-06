import { useEffect, useState } from 'react';

export function useKeyboard() {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    sprint: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys((k) => ({ ...k, forward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys((k) => ({ ...k, backward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys((k) => ({ ...k, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys((k) => ({ ...k, right: true }));
          break;
        case 'KeyE':
          setKeys((k) => ({ ...k, interact: true }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys((k) => ({ ...k, sprint: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys((k) => ({ ...k, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys((k) => ({ ...k, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys((k) => ({ ...k, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys((k) => ({ ...k, right: false }));
          break;
        case 'KeyE':
          setKeys((k) => ({ ...k, interact: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys((k) => ({ ...k, sprint: false }));
          break;
      }
    };

    // Clear all held keys when the window loses focus or is hidden — otherwise a
    // keyup can be missed (alt-tab, clicking an overlay button) and a key gets
    // "stuck", making the player drift on its own.
    const releaseAll = () =>
      setKeys({ forward: false, backward: false, left: false, right: false, interact: false, sprint: false });
    const onVisibility = () => {
      if (document.hidden) releaseAll();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return keys;
}
