import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthPage, PostsPage, UserPage, Profile, Post, Protected } from './components';
import { Toaster } from './components/ui/sonner';
import { useTheme } from './hooks/useTheme';
import { useEffect } from 'react';

function AppContent() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Apply initial theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Protected><PostsPage /></Protected>} />
        <Route path="/user" element={<Protected><UserPage /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/post/:postId" element={<Protected><Post /></Protected>} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}

