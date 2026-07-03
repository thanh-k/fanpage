import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
