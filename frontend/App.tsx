import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { router } from './routes';

const App: React.FC = () => {
  return (
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  );
};

export default App;