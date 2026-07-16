import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from './routes';

function AppContent() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;