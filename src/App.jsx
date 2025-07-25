import { Router, Route } from '@solidjs/router';

// Import your page components
import LoginPage from './pages/login';
import HomePage from './pages/home';
import CallbackPage from './pages/callback';

function App() {
  return (
    <Router>
      {/* The <Routes> component is no longer needed.
        Define your <Route> components directly inside <Router>.
      */}
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/callback" component={CallbackPage} />
      <Route path="/home" component={HomePage} />
    </Router>
  );
}

export default App;