import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AnimateButton from 'components/@extended/AnimateButton';
import { APP_DEFAULT_PATH } from 'config';

export default function RegisterWelcome() {
  const { t } = useTranslation();
  const location = useLocation();
  const firstName = location.state?.firstName?.trim() || t('auth.register.welcome.defaultName');

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h3">{t('auth.register.welcome.title', { firstName })}</Typography>
            <Typography variant="body1">{t('auth.register.welcome.instructions.line1')}</Typography>
            <Typography variant="body1">{t('auth.register.welcome.instructions.line2')}</Typography>
            <Typography variant="body1">{t('auth.register.welcome.instructions.line3')}</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AnimateButton>
            <Button component={Link} to={APP_DEFAULT_PATH} fullWidth size="large" variant="contained" color="primary" sx={{ color: '#ffffff' }}>
              {t('auth.register.welcome.goToDashboard')}
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
