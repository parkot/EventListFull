import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { apiRequest } from 'utils/api';

// ============================|| JWT - RESET PASSWORD ||============================ //

export default function AuthResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const token = searchParams.get('token') || '';

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        password: Yup.string()
          .max(100, t('auth.validation.passwordTooLongLogin'))
          .required(t('auth.validation.passwordRequired'))
          .test('no-leading-trailing-spaces', t('auth.validation.passwordNoSpaces'), (value) => {
            if (!value) return true;
            return value === value.trim();
          }),
        confirmPassword: Yup.string()
          .required(t('auth.resetPassword.confirmPasswordRequired'))
          .oneOf([Yup.ref('password')], t('auth.resetPassword.passwordsMustMatch'))
      }),
    [t]
  );

  return (
    <Formik
      initialValues={{
        password: '',
        confirmPassword: '',
        submit: null
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        setSuccessMessage('');

        if (!token) {
          setErrors({ submit: t('auth.resetPassword.invalidToken') });
          setSubmitting(false);
          return;
        }

        try {
          const response = await apiRequest('/api/auth/reset-password', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ token, newPassword: values.password })
          });

          if (!response.ok) {
            setStatus({ success: false });
            setErrors({ submit: t('auth.resetPassword.error') });
            return;
          }

          setStatus({ success: true });
          setSuccessMessage(t('auth.resetPassword.success'));
        } catch {
          setStatus({ success: false });
          setErrors({ submit: t('auth.resetPassword.error') });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, status }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="reset-password-new">{t('auth.resetPassword.passwordLabel')}</InputLabel>
                <OutlinedInput
                  id="reset-password-new"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={t('auth.resetPassword.passwordPlaceholder')}
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Stack>
              {touched.password && errors.password && (
                <FormHelperText error id="helper-text-reset-password-new">
                  {errors.password}
                </FormHelperText>
              )}
            </Grid>

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="reset-password-confirm">{t('auth.resetPassword.confirmPasswordLabel')}</InputLabel>
                <OutlinedInput
                  id="reset-password-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={values.confirmPassword}
                  name="confirmPassword"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                  fullWidth
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                        size="large"
                      >
                        {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Stack>
              {touched.confirmPassword && errors.confirmPassword && (
                <FormHelperText error id="helper-text-reset-password-confirm">
                  {errors.confirmPassword}
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

            {!token && (
              <Grid size={12}>
                <Alert severity="error">{t('auth.resetPassword.invalidToken')}</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <AnimateButton>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !token || status?.success}
                >
                  {t('auth.resetPassword.button')}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
