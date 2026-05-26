import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackgroundFX from './components/layout/BackgroundFX';
import MarketingPage from './pages/MarketingPage';

const BookPage = lazy(() => import('./pages/BookPage'));

function App() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="*" element={<MarketingPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
