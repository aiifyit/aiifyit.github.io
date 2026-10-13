import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackgroundFX from './components/layout/BackgroundFX';
import MarketingPage from './pages/MarketingPage';

const InquiryPage = lazy(() => import('./pages/InquiryPage'));
const BookPage = lazy(() => import('./pages/BookPage'));
const SowIntakePage = lazy(() => import('./pages/SowIntakePage'));

function App() {
  const location = useLocation();
  const isSowWorkspace = location.pathname.startsWith('/sow');

  return (
    <>
      <BackgroundFX />
      {!isSowWorkspace && <Header />}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="/inquire" element={<InquiryPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/sow/*" element={<SowIntakePage />} />
          <Route path="*" element={<MarketingPage />} />
        </Routes>
      </Suspense>
      {!isSowWorkspace && <Footer />}
    </>
  );
}

export default App;
