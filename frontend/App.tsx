import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { router } from './routes';

import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <DataProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </DataProvider>
  );
};

export default App;