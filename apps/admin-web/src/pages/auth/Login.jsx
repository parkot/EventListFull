import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';
import { APP_DEFAULT_PATH } from 'config';
import { isAuthenticated } from 'utils/auth';

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(APP_DEFAULT_PATH, { replace: true });
    }
  }, [navigate]);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">{t('auth.login.title')}</Typography>
            <Typography component={Link} to={'/register'} variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              {t('auth.login.noAccount')}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
