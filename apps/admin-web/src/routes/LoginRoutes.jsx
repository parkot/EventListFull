import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));
const ForgotPasswordPage = Loadable(lazy(() => import('pages/auth/ForgotPassword')));
const PublicInvitationPage = Loadable(lazy(() => import('pages/public/Invitation')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      children: [
        {
          path: '/login',
          element: <LoginPage />
        },
        {
          path: '/register',
          element: <RegisterPage />
        },
        {
          path: '/forgot-password',
          element: <ForgotPasswordPage />
        },
        {
          path: '/invitations/:publicCode',
          element: <PublicInvitationPage />
        }
      ]
    }
  ]
};

export default LoginRoutes;
