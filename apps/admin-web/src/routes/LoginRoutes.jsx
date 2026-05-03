import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));
const RegisterWelcomePage = Loadable(lazy(() => import('pages/auth/RegisterWelcome')));
const ForgotPasswordPage = Loadable(lazy(() => import('pages/auth/ForgotPassword')));
const ResetPasswordPage = Loadable(lazy(() => import('pages/auth/ResetPassword')));
const ConfirmEmailPage = Loadable(lazy(() => import('pages/auth/ConfirmEmail')));
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
          path: '/register/welcome',
          element: <RegisterWelcomePage />
        },
        {
          path: '/forgot-password',
          element: <ForgotPasswordPage />
        },
        {
          path: '/reset-password',
          element: <ResetPasswordPage />
        },
        {
          path: '/confirm-email',
          element: <ConfirmEmailPage />
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
