import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import RequireAuth from './RequireAuth';
import RequireRole from './RequireRole';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const EventsPage = Loadable(lazy(() => import('pages/events')));
const CreateEventWizardPage = Loadable(lazy(() => import('pages/events/create-wizard')));
const PeoplePage = Loadable(lazy(() => import('pages/people')));
const UsersPage = Loadable(lazy(() => import('pages/users')));
const EmailTemplatesPage = Loadable(lazy(() => import('pages/email-templates')));
const EventTemplatesPage = Loadable(lazy(() => import('pages/event-templates')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'events',
      element: <EventsPage />
    },
    {
      path: 'events/wizard',
      element: <CreateEventWizardPage />
    },
    {
      path: 'people',
      element: <PeoplePage />
    },
    {
      path: 'admin/users',
      element: (
        <RequireRole roles={['Administrator']}>
          <UsersPage />
        </RequireRole>
      )
    },
    {
      path: 'admin/email-templates',
      element: (
        <RequireRole roles={['Administrator']}>
          <EmailTemplatesPage />
        </RequireRole>
      )
    },
    {
      path: 'admin/event-templates',
      element: (
        <RequireRole roles={['Administrator']}>
          <EventTemplatesPage />
        </RequireRole>
      )
    }
  ]
};

export default MainRoutes;
