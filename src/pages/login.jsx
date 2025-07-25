import { onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// Login-related constants and functions from your previous code
const client_id = "7d7ec8b91b4c46d69036cb61e657d89f";
const redirect_uri = "http://127.0.0.1:3000/callback";

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function onLogin() {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-library-modify user-library-read';
  localStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}


function LoginPage() {
  const navigate = useNavigate();

  // This hook runs when the component first loads
  onMount(() => {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    // If a token exists, the user is already logged in.
    if (accessToken) {
      console.log('User is already logged in. Redirecting to /home.');
      navigate('/home', { replace: true });
    }
  });

  return (
    <div class="flex items-center justify-center h-screen bg-gray-900">
      <button
        onClick={onLogin}
        class="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition"
      >
        Login with Spotify
      </button>
    </div>
  );
}

export default LoginPage;