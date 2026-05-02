import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { APP_DEFAULT_PATH } from 'config';
import { apiRequest } from 'utils/api';
import { saveAuthSession } from 'utils/auth';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checked, setChecked] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        email: Yup.string().email(t('auth.validation.mustBeValidEmail')).max(255).required(t('auth.validation.emailRequired')),
        password: Yup.string()
          .required(t('auth.validation.passwordRequired'))
          .test('no-leading-trailing-whitespace', t('auth.validation.passwordNoSpaces'), (value) => value === value?.trim())
          .max(100, t('auth.validation.passwordTooLongLogin'))
      }),
    [t]
  );
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={{
          email: 'admin@eventlist.local',
          password: 'Admin123!',
          submit: null
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const response = await apiRequest('/api/auth/login', {
              method: 'POST',
              auth: false,
              body: JSON.stringify({
                email: values.email,
                password: values.password
              })
            });

            if (!response.ok) {
              setStatus({ success: false });
              setErrors({ submit: t('auth.login.invalidCredentials') });
              return;
            }

            const data = await response.json();

            saveAuthSession({
              accessToken: data?.accessToken,
              refreshToken: data?.refreshToken,
              expiresAtUtc: data?.expiresAtUtc,
              refreshTokenExpiresAtUtc: data?.refreshTokenExpiresAtUtc,
              sessionId: data?.sessionId,
              user: data?.user
            });

            setStatus({ success: true });
            navigate(APP_DEFAULT_PATH, { replace: true });
          } catch {
            setStatus({ success: false });
            setErrors({ submit: t('auth.login.unableToLogin') });
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
                  <InputLabel htmlFor="email-login">{t('auth.login.emailLabel')}</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder={t('auth.login.emailPlaceholder')}
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">{t('auth.login.passwordLabel')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder={t('auth.login.passwordPlaceholder')}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
              <Grid sx={{ mt: -1 }} size={12}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">{t('auth.login.keepSignedIn')}</Typography>}
                  />
                  <Link variant="h6" component={RouterLink} to="/forgot-password" color="text.primary">
                    {t('auth.login.forgotPassword')}
                  </Link>
                </Stack>
              </Grid>
              <Grid size={12}>
                <AnimateButton>
                  <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ color: '#ffffff' }}
                  >
                    {t('auth.login.button')}
                  </Button>
                </AnimateButton>
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
