import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import MatchListPage from './pages/MatchListPage';
import CreateMatchPage from './pages/CreateMatchPage';
import MatchDetailPage from './pages/MatchDetailPage';
import MatchResultPage from './pages/MatchResultPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MatchListPage,
});

const createMatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/match/new',
  component: CreateMatchPage,
});

const matchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/match/$id',
  component: MatchDetailPage,
});

const matchResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/match/$id/result',
  component: MatchResultPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createMatchRoute,
  matchDetailRoute,
  matchResultRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
