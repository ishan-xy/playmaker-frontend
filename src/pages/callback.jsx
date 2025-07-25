import { onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';

async function sendCodeToBackend(code) {
  console.log('Sending authorization code to backend:', code);

  try {
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      console.error('Backend server responded with an error:', response.status);
      return { success: false };
    }

    // Parse the JSON response from your Go backend
    const tokens = await response.json();

    // Store the tokens using the keys from your Go struct
    if (tokens.access_token && tokens.refresh_token) {
      localStorage.setItem('spotify_access_token', tokens.access_token);
      localStorage.setItem('spotify_refresh_token', tokens.refresh_token);
      return { success: true };
    } else {
      console.error('Token data is missing in the backend response.');
      return { success: false };
    }
  } catch (error) {
    console.error('Failed to communicate with the backend:', error);
    return { success: false };
  }
}

function CallbackPage() {
  const navigate = useNavigate();

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const receivedState = params.get('state');

    const storedState = localStorage.getItem('spotify_auth_state');
    localStorage.removeItem('spotify_auth_state');

    if (receivedState === null || receivedState !== storedState) {
      console.error('State mismatch error.');
      navigate('/login?error=state_mismatch', { replace: true });
    } else if (code) {
      console.log('State verified. Sending code to backend.');
      const response = await sendCodeToBackend(code);

      if (response.success) {
        console.log('Backend exchange successful. Navigating home.');
        navigate('/home', { replace: true });
      } else {
        console.error('Backend failed to exchange code for token.');
        navigate('/login?error=token_exchange_failed', { replace: true });
      }
    } else {
      const error = params.get('error');
      console.error(`Spotify authentication error: ${error}`);
      navigate(`/login?error=${error}`, { replace: true });
    }
  });

  return (
    <div>
      <h1>Authenticating...</h1>
      <p>Please wait, you will be redirected shortly.</p>
    </div>
  );
}

export default CallbackPage;