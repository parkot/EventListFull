import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { confirmEmail } from 'api/auth';

export default function AuthConfirmEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const hasToken = Boolean(token);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasToken || isConfirmed) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await confirmEmail({ token });
      if (!response.ok) {
        setSubmitError(t('auth.confirmEmail.error'));
        return;
      }

      setIsConfirmed(true);
    } catch {
      setSubmitError(t('auth.confirmEmail.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            {!hasToken && (
              <Alert severity="info">
                <Typography variant="body2">{t('auth.confirmEmail.checkInboxTitle')}</Typography>
                <Typography variant="body2">{t('auth.confirmEmail.checkInboxMessage')}</Typography>
                {email && <Typography variant="body2">{t('auth.confirmEmail.checkInboxEmail', { email })}</Typography>}
              </Alert>
            )}

            {hasToken && !isConfirmed && !submitError && <Typography variant="body1">{t('auth.confirmEmail.instructions')}</Typography>}

            {isConfirmed && (
              <Alert severity="success">
                <Typography variant="body2">{t('auth.confirmEmail.successTitle')}</Typography>
                <Typography variant="body2">{t('auth.confirmEmail.successMessage')}</Typography>
              </Alert>
            )}

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </Grid>

        {hasToken && !isConfirmed && (
          <Grid size={12}>
            <AnimateButton>
              <Button fullWidth size="large" type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {t('auth.confirmEmail.button')}
              </Button>
            </AnimateButton>
          </Grid>
        )}

        <Grid size={12}>
          <AnimateButton>
            <Button component={Link} to="/login" fullWidth size="large" variant={isConfirmed || !hasToken ? 'contained' : 'outlined'} color="primary">
              {t('auth.confirmEmail.backToLogin')}
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </form>
  );
}
