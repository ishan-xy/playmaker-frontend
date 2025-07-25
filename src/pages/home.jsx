import { useNavigate } from '@solidjs/router';
import UserDashboard from '../components/dashboard'; // Adjust path if needed

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <div class="p-8 bg-gray-900 min-h-screen text-white">
      <header class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-green-500">Welcome Home!</h1>
        <button 
          onClick={handleLogout}
          class="bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600"
        >
          Logout
        </button>
      </header>
      
      {/* Render the new dashboard component */}
      <UserDashboard />

    </div>
  );
}

export default HomePage;