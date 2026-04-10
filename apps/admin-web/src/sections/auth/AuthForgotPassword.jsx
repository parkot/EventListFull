import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { apiRequest } from 'utils/api';

// ============================|| JWT - FORGOT PASSWORD ||============================ //

export default function AuthForgotPassword() {
  const { t } = useTranslation();
  const [successMessage, setSuccessMessage] = useState('');

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        email: Yup.string().email(t('auth.validation.mustBeValidEmail')).max(255).required(t('auth.validation.emailRequired'))
      }),
    [t]
  );

  return (
    <Formik
      initialValues={{
        email: '',
        submit: null
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
        setSuccessMessage('');

        try {
          const response = await apiRequest('/api/auth/forgot-password', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ email: values.email })
          });

          if (!response.ok) {
            setStatus({ success: false });
            setErrors({ submit: t('auth.forgotPassword.error') });
            return;
          }

          setStatus({ success: true });
          setSuccessMessage(t('auth.forgotPassword.success'));
          resetForm();
        } catch {
          setStatus({ success: false });
          setErrors({ submit: t('auth.forgotPassword.error') });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="forgot-password-email">{t('auth.forgotPassword.emailLabel')}</InputLabel>
                <OutlinedInput
                  id="forgot-password-email"
                  type="email"
                  value={values.email}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  fullWidth
                  error={Boolean(touched.email && errors.email)}
                />
              </Stack>
              {touched.email && errors.email && (
                <FormHelperText error id="helper-text-forgot-password-email">
                  {errors.email}
                </FormHelperText>
              )}
            </Grid>
            {successMessage && (
              <Grid size={12}>
                <Alert severity="success">{successMessage}</Alert>
              </Grid>
            )}
            {errors.submit && (
              <Grid size={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}
            <Grid size={12}>
              <AnimateButton>
                <Button fullWidth size="large" type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {t('auth.forgotPassword.button')}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
