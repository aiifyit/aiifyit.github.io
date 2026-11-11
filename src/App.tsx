import { lazy, Suspense, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackgroundFX from './components/layout/BackgroundFX';
import MarketingPage from './pages/MarketingPage';

const InquiryPage = lazy(() => import('./pages/InquiryPage'));
const BookPage = lazy(() => import('./pages/BookPage'));
const SowIntakePage = lazy(() => import('./pages/SowIntakePage'));
const NewOfferPage = lazy(() => import('./pages/NewOfferPage'));

function App() {
  const location = useLocation();
  const isSowWorkspace = location.pathname.startsWith('/sow');
  const onOffer = /^\/new-offer\/?$/.test(location.pathname);

  useLayoutEffect(() => {
    if (!onOffer) return;
    document.documentElement.dataset.page = 'offer';
    return () => {
      delete document.documentElement.dataset.page;
    };
  }, [onOffer]);

  return (
    <>
      {!onOffer && <BackgroundFX />}
      {!isSowWorkspace && <Header solid={onOffer} />}
      <Suspense fallback={onOffer ? <div className="min-h-[70vh]" aria-hidden="true" /> : null}>
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="/inquire" element={<InquiryPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/sow/*" element={<SowIntakePage />} />
          {/* Hidden sales page: no nav, footer, home, sitemap, or robots.txt entry. */}
          <Route path="/new-offer" element={<NewOfferPage />} />
          <Route path="*" element={<MarketingPage />} />
        </Routes>
      </Suspense>
      {!isSowWorkspace && <Footer />}
    </>
  );
}

export default App;
