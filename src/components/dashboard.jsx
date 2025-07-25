import { createResource, createSignal, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const fetchUserPlaylists = async (navigate) => {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) {
    navigate('/login', { replace: true });
    throw new Error('No access token found');
  }
  const response = await fetch('http://localhost:8080/playlists', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch playlists');
  }
  return response.json();
};

function UserDashboard() {
  const navigate = useNavigate();

  // Inputs and states
  const [artistUrl, setArtistUrl] = createSignal('');
  const [playlistName, setPlaylistName] = createSignal('');
  const [selectedPlaylistId, setSelectedPlaylistId] = createSignal('new'); // 'new' means create new
  const [playlist, { refetch }] = createResource(() => fetchUserPlaylists(navigate));
  const [creating, setCreating] = createSignal(false);
  const [error, setError] = createSignal('');

  // Handler to create or modify playlist
  const handleCreateOrModifyPlaylist = async () => {
    setError('');
    setCreating(true);

    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Payload to backend:
    // If creating new playlist: send name and artist_url
    // If modifying existing: send playlist_id and artist_url only (adjust backend accordingly)
    let url = '';
    let method = '';
    let body = {};

    if (selectedPlaylistId() === 'new') {
      // Create new playlist
      url = 'http://localhost:8080/playlist/create';
      method = 'POST';
      body = {
        name: playlistName(),
        artist_url: artistUrl(),
      };
      if (!playlistName()) {
        setError('Playlist name is required for new playlist');
        setCreating(false);
        return;
      }
    } else {
      // Add songs to existing playlist
      url = 'http://localhost:8080/playlist/modify'; // example endpoint to add songs to existing playlist, adjust your backend accordingly
      method = 'POST';
      body = {
        playlist_id: selectedPlaylistId(),
        artist_url: artistUrl(),
      };
      console.log(selectedPlaylistId());
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error ? String(err.error) : 'Failed to process playlist');
      } else {
        setArtistUrl('');
        setPlaylistName('');
        setSelectedPlaylistId('new');
        await refetch();
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div class="w-full max-w-6xl mx-auto mt-8">
      {/* Playlist creation/modification UI */}
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 space-y-4">
        <h2 class="text-xl font-bold mb-4 text-white">Manage Your Playlists</h2>
        <div>
          <label for="playlist-select" class="block mb-1 text-white">
            Select Playlist:
          </label>
          <select
            id="playlist-select"
            class="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedPlaylistId()}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            disabled={creating()}
          >
            <option value="new">-- Create New Playlist --</option>
            <Show when={!playlist.loading && !playlist.error}>
              <For each={playlist()}>
                {(pl) => (
                  <option value={pl.id}>
                    {pl.name.length > 50 ? pl.name.slice(0, 47) + '...' : pl.name}
                  </option>
                )}
              </For>
            </Show>
          </select>
        </div>

        <Show when={selectedPlaylistId() === 'new'}>
          <div>
            <label for="playlist-name" class="block mt-2 mb-1 text-white">
              Playlist Name:
            </label>
            <input
              id="playlist-name"
              type="text"
              placeholder="Playlist Name"
              class="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={playlistName()}
              onInput={(e) => setPlaylistName(e.target.value)}
              disabled={creating()}
            />
          </div>
        </Show>

        <div>
          <label for="artist-url" class="block mt-2 mb-1 text-white">
            Spotify Artist URL:
          </label>
          <input
            id="artist-url"
            type="text"
            placeholder="Enter Spotify Artist URL"
            class="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={artistUrl()}
            onInput={(e) => setArtistUrl(e.target.value)}
            disabled={creating()}
          />
        </div>

        <button
          onClick={handleCreateOrModifyPlaylist}
          class="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-green-300"
          disabled={creating() || !artistUrl() || (selectedPlaylistId() === 'new' && !playlistName())}
        >
          {creating() ? (selectedPlaylistId() === 'new' ? 'Creating...' : 'Adding...') : selectedPlaylistId() === 'new' ? 'Create Playlist' : 'Add Songs to Playlist'}
        </button>

        <Show when={error()}>
          <div class="mt-2 text-red-400 font-semibold text-sm">{error()}</div>
        </Show>
      </div>

      {/* Show existing playlists */}
      <div>
        <h2 class="text-2xl font-bold mb-4 text-white">Your Playlists</h2>
        <Show when={!playlist.loading} fallback={<p class="text-gray-400">Loading Playlists...</p>}>
          <Show when={!playlist.error} fallback={(err) => <p class="text-red-500">Error: {err.message}</p>}>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <For each={playlist()}>
                {(pl) => (
                  <div class="bg-gray-800 p-3 rounded-lg shadow-md transition-transform hover:scale-105">
                    <img
                      src={pl.images[0]?.url}
                      alt={pl.name}
                      class="w-full aspect-square object-cover rounded-md mb-2"
                    />
                    <p class="font-semibold text-white truncate">{pl.name}</p>
                    <p class="text-sm text-gray-400 truncate">By {pl.owner.display_name}</p>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default UserDashboard;
