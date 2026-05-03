import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthConfirmEmail from 'sections/auth/AuthConfirmEmail';

export default function ConfirmEmail() {
  const { t } = useTranslation();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">{t('auth.confirmEmail.title')}</Typography>
            <Typography component={Link} to="/login" variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              {t('auth.confirmEmail.backToLogin')}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthConfirmEmail />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
