import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Root } from './routes/Root';
import { ModeSelectorPage } from './routes/ModeSelectorPage';
import { OfflineLayout } from './routes/offline/OfflineLayout';
import { OfflineSelectPage } from './routes/offline/OfflineSelectPage';
import { OfflineGamePage } from './routes/offline/OfflineGamePage';
import { SalaLayout } from './routes/sala/SalaLayout';
import { RoomEntryPage } from './routes/sala/RoomEntryPage';
import { RoomSelectPage } from './routes/sala/RoomSelectPage';
import { RoomLobbyPage } from './routes/sala/RoomLobbyPage';
import { RoomGamePage } from './routes/sala/RoomGamePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <ModeSelectorPage /> },
      {
        path: 'offline',
        element: <OfflineLayout />,
        children: [
          { index: true, element: <OfflineSelectPage /> },
          { path: 'game', element: <OfflineGamePage /> },
        ],
      },
      {
        path: 'sala',
        element: <SalaLayout />,
        children: [
          { index: true, element: <RoomEntryPage /> },
          { path: ':code/select', element: <RoomSelectPage /> },
          { path: ':code/lobby', element: <RoomLobbyPage /> },
          { path: ':code/game', element: <RoomGamePage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
