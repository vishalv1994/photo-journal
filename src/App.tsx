import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import TripsList from './components/TripsList';
import TripDetail from './components/TripDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<TripsList />} />
          <Route path="/trips/:id" element={<TripDetail />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}
