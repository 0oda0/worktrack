import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App() {
  const routing = useRoutes(routes);
  return <BrowserRouter>{routing}</BrowserRouter>;
}

export default App;