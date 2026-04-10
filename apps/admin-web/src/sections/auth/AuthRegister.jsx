import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - REGISTER ||============================ //

const defaultCountryOptions = [
  {
    isoCode: 'US',
    name: 'United States',
    dialCode: '+1',
    flagAlt: 'United States flag',
    flagSrc: 'https://flagcdn.com/w40/us.png',
    fallbackFlagSrc: 'https://restcountries.com/data/usa.svg'
  }
];

const handleFlagImageError = (event) => {
  const fallbackFlagSrc = event.currentTarget.dataset.fallbackSrc;

  if (fallbackFlagSrc && event.currentTarget.src !== fallbackFlagSrc) {
    event.currentTarget.src = fallbackFlagSrc;
    return;
  }

  event.currentTarget.style.visibility = 'hidden';
};

const countryFilterOptions = (options, state) => {
  const query = state.inputValue.trim().toLowerCase();

  if (!query) {
    return options;
  }

  return options.filter((option) => {
    const searchableText = `${option.name} ${option.isoCode} ${option.dialCode}`.toLowerCase();
    return searchableText.includes(query);
  });
};

const mapCountryOption = (country) => {
  const dialRoot = country.idd?.root;
  const dialSuffixes = country.idd?.suffixes;
  const isoCode = country.cca2;

  if (!dialRoot || !Array.isArray(dialSuffixes) || dialSuffixes.length === 0) {
    return null;
  }

  return {
    isoCode,
    name: country.name?.common ?? isoCode,
    dialCode: `${dialRoot}${dialSuffixes[0]}`,
    flagAlt: `${country.name?.common ?? isoCode} flag`,
    flagSrc: `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`,
    fallbackFlagSrc: country.flags?.png ?? country.flags?.svg ?? ''
  };
};

export default function AuthRegister() {
  const { t } = useTranslation();
  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [countryOptions, setCountryOptions] = useState(defaultCountryOptions);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [countrySearchText, setCountrySearchText] = useState('+1');
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        firstname: Yup.string().max(255).required(t('auth.validation.firstNameRequired')),
        lastname: Yup.string().max(255).required(t('auth.validation.lastNameRequired')),
        email: Yup.string().email(t('auth.validation.mustBeValidEmail')).max(255).required(t('auth.validation.emailRequired')),
        password: Yup.string()
          .required(t('auth.validation.passwordRequired'))
          .test('no-leading-trailing-whitespace', t('auth.validation.passwordNoSpaces'), (value) => value === value?.trim())
          .max(10, t('auth.validation.passwordTooLongRegister'))
      }),
    [t]
  );
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      setIsCountriesLoading(true);

      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=cca2,name,idd,flags');
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (!Array.isArray(payload)) {
          return;
        }

        const options = payload
          .map(mapCountryOption)
          .filter(Boolean)
          .sort((left, right) => left.name.localeCompare(right.name));

        if (isMounted && options.length > 0) {
          setCountryOptions(options);
        }
      } catch {
        // Keep fallback options when external country metadata fails to load.
      } finally {
        if (isMounted) {
          setIsCountriesLoading(false);
        }
      }
    };

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          email: '',
          countryIsoCode: 'US',
          countryCode: '+1',
          phoneNumber: '',
          password: '',
          submit: null
        }}
        validationSchema={validationSchema}
      >
        {({ errors, handleBlur, handleChange, touched, values, setFieldValue }) => (
          (() => {
            const selectedCountry = countryOptions.find((option) => option.isoCode === values.countryIsoCode) ?? null;

            return (
          <form noValidate>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="firstname-signup">{t('auth.register.firstNameLabel')}</InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder={t('auth.register.firstNamePlaceholder')}
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText error id="helper-text-firstname-signup">
                    {errors.firstname}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="lastname-signup">{t('auth.register.lastNameLabel')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder={t('auth.register.lastNamePlaceholder')}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText error id="helper-text-lastname-signup">
                    {errors.lastname}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="phone-number-signup">{t('auth.register.phoneLabel')}</InputLabel>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Autocomplete
                        id="country-code-signup"
                        options={countryOptions}
                        loading={isCountriesLoading}
                        filterOptions={countryFilterOptions}
                        fullWidth
                        autoHighlight
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            padding: '3px'
                          }
                        }}
                        open={isCountrySelectorOpen}
                        onOpen={() => {
                          setIsCountrySelectorOpen(true);
                          setCountrySearchText('');
                        }}
                        onClose={() => {
                          setIsCountrySelectorOpen(false);
                        }}
                        value={selectedCountry}
                        inputValue={isCountrySelectorOpen ? countrySearchText : selectedCountry?.dialCode ?? ''}
                        onInputChange={(_, newInputValue, reason) => {
                          if (reason === 'input') {
                            setCountrySearchText(newInputValue);
                          }

                          if (reason === 'clear') {
                            setCountrySearchText('');
                          }
                        }}
                        isOptionEqualToValue={(option, value) => option.isoCode === value.isoCode}
                        onChange={(_, selectedOption) => {
                          setFieldValue('countryIsoCode', selectedOption?.isoCode ?? '');
                          setFieldValue('countryCode', selectedOption?.dialCode ?? '');
                          setCountrySearchText('');
                          setIsCountrySelectorOpen(false);
                        }}
                        getOptionLabel={(option) => `${option.name} (${option.dialCode})`}
                        slotProps={{
                          popper: {
                            sx: {
                              width: '360px !important'
                            }
                          },
                          paper: {
                            sx: {
                              minWidth: 360
                            }
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box
                              component="img"
                              loading="lazy"
                              width={20}
                              src={option.flagSrc}
                              data-fallback-src={option.fallbackFlagSrc}
                              alt={option.flagAlt}
                              onError={handleFlagImageError}
                              sx={{ mr: 1.5, flexShrink: 0, borderRadius: 0.5 }}
                            />
                            {`${option.name} (${option.dialCode})`}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            placeholder={t('auth.register.countryCodePlaceholder')}
                            onBlur={handleBlur}
                            name="countryCode"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isCountriesLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <OutlinedInput
                        fullWidth
                        id="phone-number-signup"
                        value={values.phoneNumber}
                        name="phoneNumber"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder={t('auth.register.phonePlaceholder')}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-signup">{t('auth.register.emailLabel')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder={t('auth.register.emailPlaceholder')}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-signup">{t('auth.register.passwordLabel')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
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
                    placeholder="******"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2">
                  {t('auth.register.agreeText')}&nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    {t('auth.register.termsOfService')}
                  </Link>
                  &nbsp;{t('common.and')}&nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    {t('auth.register.privacyPolicy')}
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <AnimateButton>
                  <Button fullWidth size="large" variant="contained" color="primary">
                    {t('auth.register.button')}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
            );
          })()
        )}
      </Formik>
    </>
  );
}
