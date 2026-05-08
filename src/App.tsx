import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackgroundFX from './components/layout/BackgroundFX';
import MarketingPage from './pages/MarketingPage';
import BookPage from './pages/BookPage';

function App() {
  return (
    <>
      <BackgroundFX />
      <Header />
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="*" element={<MarketingPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
