import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// material-ui
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import GreekTableHeadCell from 'components/GreekTableHeadCell';
import MainCard from 'components/MainCard';
import { apiRequest, getApiBaseUrl } from 'utils/api';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'el', label: 'Greek' }
];

function getAllTimeZones() {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }
  } catch {
    // Fall back to a curated list when runtime does not expose supportedValuesOf.
  }

  return [
    'UTC',
    'Europe/Athens',
    'Europe/London',
    'Europe/Madrid',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
}

function toUtcOffsetLabel(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
    }).formatToParts(new Date());

    const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT';
    if (offsetPart === 'GMT' || offsetPart === 'UTC') {
      return 'UTC+00:00';
    }

    const match = offsetPart.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!match) {
      return offsetPart.replace('GMT', 'UTC');
    }

    const sign = match[1];
    const hours = match[2].padStart(2, '0');
    const minutes = (match[3] || '00').padStart(2, '0');
    return `UTC${sign}${hours}:${minutes}`;
  } catch {
    return 'UTC+00:00';
  }
}

function mapTimeZoneOption(timeZone) {
  return {
    value: timeZone,
    label: `${timeZone} (${toUtcOffsetLabel(timeZone)})`
  };
}

function toLocalDateTimeInputValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toDayjsLocal(isoLikeString) {
  // isoLikeString is in local "YYYY-MM-DDTHH:mm" format
  return dayjs(isoLikeString);
}

function getPublicInvitationUrl(invitationCode) {
  const baseName = import.meta.env.VITE_APP_BASE_NAME || '';
  const normalizedBaseName = baseName.endsWith('/') ? baseName.slice(0, -1) : baseName;

  if (typeof window === 'undefined') {
    return `${normalizedBaseName}/invitations/${encodeURIComponent(invitationCode)}`;
  }

  return `${window.location.origin}${normalizedBaseName}/invitations/${encodeURIComponent(invitationCode)}`;
}

function toEventCreatePayload(values) {
  return {
    title: values.title.trim(),
    occasionType: values.occasionType.trim(),
    scheduledAtUtc: new Date(values.scheduledAtUtc).toISOString(),
    venue: values.venue.trim(),
    address: values.address.trim(),
    timeZone: values.timeZone.trim(),
    defaultLanguage: values.defaultLanguage.trim().toLowerCase()
  };
}

async function getErrorMessageFromResponse(response, fallback) {
  try {
    const json = await response.json();
    const detail = json?.detail || json?.message || json?.title;
    return detail ? `${detail} (HTTP ${response.status})` : `${fallback} (HTTP ${response.status})`;
  } catch {
    try {
      const text = await response.text();
      return text ? `${text} (HTTP ${response.status})` : `${fallback} (HTTP ${response.status})`;
    } catch {
      return `${fallback} (HTTP ${response.status})`;
    }
  }
}

function toFriendlyRequestError(error, fallback, unreachableMessage) {
  const message = error?.message || '';

  if (message.toLowerCase().includes('failed to fetch')) {
    return unreachableMessage;
  }

  return message || fallback;
}

function getRsvpChipProps(status, t) {
  switch (status) {
    case 'Attending':
      return { label: t('eventsPage.rsvp.accepted'), color: 'success' };
    case 'Declined':
      return { label: t('eventsPage.rsvp.rejected'), color: 'error' };
    case 'Maybe':
      return { label: t('eventsPage.rsvp.maybe'), color: 'info' };
    default:
      return { label: t('eventsPage.rsvp.pending'), color: 'warning' };
  }
}

export default function EventsPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isGuestsDialogOpen, setIsGuestsDialogOpen] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [eventGuests, setEventGuests] = useState([]);
  const [isGuestsLoading, setIsGuestsLoading] = useState(false);
  const [guestsLoadError, setGuestsLoadError] = useState('');
  const [copiedGuestId, setCopiedGuestId] = useState(null);

  const defaultTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
  const timeZoneOptions = useMemo(() => getAllTimeZones().map(mapTimeZoneOption), []);
  const apiUnavailableMessage = useMemo(
    () =>
      t('eventsPage.errors.backendUnavailable', {
        baseUrl: getApiBaseUrl()
      }),
    [t]
  );

  const createEventSchema = useMemo(
    () =>
      Yup.object().shape({
        title: Yup.string().max(120, t('eventsPage.validation.titleMax')).required(t('eventsPage.validation.titleRequired')),
        occasionType: Yup.string().max(60, t('eventsPage.validation.occasionTypeMax')).required(t('eventsPage.validation.occasionTypeRequired')),
        scheduledAtUtc: Yup.string().required(t('eventsPage.validation.scheduledAtRequired')),
        venue: Yup.string().max(160, t('eventsPage.validation.venueMax')).required(t('eventsPage.validation.venueRequired')),
        address: Yup.string().max(240, t('eventsPage.validation.addressMax')).required(t('eventsPage.validation.addressRequired')),
        timeZone: Yup.string().max(100, t('eventsPage.validation.timeZoneMax')).required(t('eventsPage.validation.timeZoneRequired')),
        defaultLanguage: Yup.string()
          .max(10, t('eventsPage.validation.defaultLanguageMax'))
          .required(t('eventsPage.validation.defaultLanguageRequired'))
      }),
    [t]
  );

  const initialFormValues = useMemo(
    () => ({
      title: '',
      occasionType: '',
      scheduledAtUtc: toLocalDateTimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      venue: '',
      address: '',
      timeZone: defaultTimeZone,
      defaultLanguage: 'en'
    }),
    [defaultTimeZone]
  );

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await apiRequest('/api/events/');

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('eventsPage.errors.loadEvents')));
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(toFriendlyRequestError(error, t('eventsPage.errors.loadEvents'), apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage, t]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const dialogInitialValues = useMemo(() => {
    if (!editingEvent) {
      return initialFormValues;
    }

    return {
      title: editingEvent.title || '',
      occasionType: editingEvent.occasionType || '',
      scheduledAtUtc: editingEvent.scheduledAtUtc
        ? toLocalDateTimeInputValue(new Date(editingEvent.scheduledAtUtc))
        : toLocalDateTimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      venue: editingEvent.venue || '',
      address: editingEvent.address || '',
      timeZone: editingEvent.timeZone || defaultTimeZone,
      defaultLanguage: editingEvent.defaultLanguage || 'en'
    };
  }, [defaultTimeZone, editingEvent, initialFormValues]);

  const openCreateDialog = () => {
    setEditingEvent(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = async (eventId) => {
    try {
      const response = await apiRequest(`/api/events/${eventId}`);

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('eventsPage.errors.loadEventDetails')));
      }

      const eventData = await response.json();
      setEditingEvent(eventData);
      setIsCreateDialogOpen(true);
    } catch (error) {
      setLoadError(toFriendlyRequestError(error, t('eventsPage.errors.loadEventDetails'), apiUnavailableMessage));
    }
  };

  const openGuestsDialog = async (eventId, eventTitle) => {
    setIsGuestsDialogOpen(true);
    setSelectedEventTitle(eventTitle || t('eventsPage.eventFallback'));
    setEventGuests([]);
    setGuestsLoadError('');
    setCopiedGuestId(null);
    setIsGuestsLoading(true);

    try {
      const response = await apiRequest(`/api/events/${eventId}`);

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('eventsPage.errors.loadGuests')));
      }

      const eventData = await response.json();
      setSelectedEventTitle(eventData?.title || eventTitle || t('eventsPage.eventFallback'));
      setEventGuests(Array.isArray(eventData?.guests) ? eventData.guests : []);
    } catch (error) {
      setGuestsLoadError(toFriendlyRequestError(error, t('eventsPage.errors.loadGuests'), apiUnavailableMessage));
    } finally {
      setIsGuestsLoading(false);
    }
  };

  const copyGuestInvitationUrl = async (guest) => {
    const invitationCode = guest?.invitationCode;
    if (!invitationCode) {
      return;
    }

    const invitationUrl = getPublicInvitationUrl(invitationCode);
    await navigator.clipboard.writeText(invitationUrl);
    setCopiedGuestId(guest.guestId);
  };

  return (
    <MainCard
      title={t('eventsPage.title')}
      secondary={
        <Button variant="contained" onClick={openCreateDialog}>
          {t('eventsPage.createNewEvent')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {loadError && <Alert severity="error">{loadError}</Alert>}

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            {t('eventsPage.loadingEvents')}
          </Typography>
        ) : (
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'auto',
              '& td, & th': { whiteSpace: 'nowrap' }
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <GreekTableHeadCell>{t('eventsPage.table.edit')}</GreekTableHeadCell>
                  <GreekTableHeadCell>{t('eventsPage.table.title')}</GreekTableHeadCell>
                  <GreekTableHeadCell>{t('eventsPage.table.occasion')}</GreekTableHeadCell>
                  <GreekTableHeadCell>{t('eventsPage.table.scheduledLocal')}</GreekTableHeadCell>
                  <GreekTableHeadCell>{t('eventsPage.table.venue')}</GreekTableHeadCell>
                  <GreekTableHeadCell align="right">{t('eventsPage.table.guests')}</GreekTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('eventsPage.noEvents')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((eventItem) => (
                    <TableRow hover key={eventItem.id}>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => openEditDialog(eventItem.id)}>
                          {t('eventsPage.edit')}
                        </Button>
                      </TableCell>
                      <TableCell>{eventItem.title}</TableCell>
                      <TableCell>{eventItem.occasionType}</TableCell>
                      <TableCell>{new Date(eventItem.scheduledAtUtc).toLocaleString()}</TableCell>
                      <TableCell>{eventItem.venue}</TableCell>
                      <TableCell align="right">
                        <Button variant="text" size="small" onClick={() => openGuestsDialog(eventItem.id, eventItem.title)}>
                          {eventItem.stats?.totalGuests ?? 0}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <Formik
        enableReinitialize
        initialValues={dialogInitialValues}
        validationSchema={createEventSchema}
        onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
          setStatus(undefined);

          try {
            const payload = toEventCreatePayload(values);
            const response = await apiRequest(editingEvent ? `/api/events/${editingEvent.id}` : '/api/events/', {
              method: editingEvent ? 'PUT' : 'POST',
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              throw new Error(
                await getErrorMessageFromResponse(
                  response,
                  editingEvent ? t('eventsPage.errors.updateEvent') : t('eventsPage.errors.createEvent')
                )
              );
            }

            setIsCreateDialogOpen(false);
            setEditingEvent(null);
            resetForm();
            await loadEvents();
          } catch (error) {
            setStatus(
              toFriendlyRequestError(
                error,
                editingEvent ? t('eventsPage.errors.updateEvent') : t('eventsPage.errors.createEvent'),
                apiUnavailableMessage
              )
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, status, resetForm, setFieldValue, setFieldTouched }) => (
          <Dialog
            fullWidth
            maxWidth="sm"
            open={isCreateDialogOpen}
            onClose={() => {
              if (!isSubmitting) {
                setIsCreateDialogOpen(false);
                setEditingEvent(null);
                resetForm();
              }
            }}
          >
            <Form noValidate onSubmit={handleSubmit}>
              <DialogTitle>{editingEvent ? t('eventsPage.editEvent') : t('eventsPage.createEvent')}</DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  {status && <Alert severity="error">{status}</Alert>}

                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    label={t('eventsPage.form.title')}
                    value={values.title}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.title && errors.title)}
                    helperText={touched.title && errors.title}
                  />

                  <TextField
                    fullWidth
                    id="occasionType"
                    name="occasionType"
                    label={t('eventsPage.form.occasionType')}
                    value={values.occasionType}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.occasionType && errors.occasionType)}
                    helperText={touched.occasionType && errors.occasionType}
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label={t('eventsPage.form.scheduledDateTime')}
                      value={values.scheduledAtUtc ? toDayjsLocal(values.scheduledAtUtc) : null}
                      onChange={(newValue) => {
                        if (newValue && newValue.isValid()) {
                          setFieldValue('scheduledAtUtc', newValue.format('YYYY-MM-DDTHH:mm'));
                        } else {
                          setFieldValue('scheduledAtUtc', '');
                        }
                      }}
                      onClose={() => setFieldTouched('scheduledAtUtc', true)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          id: 'scheduledAtUtc',
                          name: 'scheduledAtUtc',
                          onBlur: () => setFieldTouched('scheduledAtUtc', true),
                          error: Boolean(touched.scheduledAtUtc && errors.scheduledAtUtc),
                          helperText: touched.scheduledAtUtc && errors.scheduledAtUtc
                        }
                      }}
                    />
                  </LocalizationProvider>

                  <TextField
                    fullWidth
                    id="venue"
                    name="venue"
                    label={t('eventsPage.form.venue')}
                    value={values.venue}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.venue && errors.venue)}
                    helperText={touched.venue && errors.venue}
                  />

                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label={t('eventsPage.form.address')}
                    value={values.address}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.address && errors.address)}
                    helperText={touched.address && errors.address}
                  />

                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    <Autocomplete
                      options={timeZoneOptions}
                      value={timeZoneOptions.find((option) => option.value === values.timeZone) || null}
                      onChange={(_, newValue) => setFieldValue('timeZone', newValue?.value || defaultTimeZone)}
                      onBlur={() => setFieldTouched('timeZone', true)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          id="timeZone"
                          name="timeZone"
                          label={t('eventsPage.form.timeZone')}
                          error={Boolean(touched.timeZone && errors.timeZone)}
                          helperText={touched.timeZone && errors.timeZone}
                        />
                      )}
                      fullWidth
                      autoHighlight
                    />

                    <TextField
                      fullWidth
                      id="defaultLanguage"
                      name="defaultLanguage"
                      label={t('eventsPage.form.defaultLanguage')}
                      select
                      value={values.defaultLanguage}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.defaultLanguage && errors.defaultLanguage)}
                      helperText={touched.defaultLanguage && errors.defaultLanguage}
                    >
                      {languageOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  color="secondary"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  {t('eventsPage.cancel')}
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {editingEvent ? t('eventsPage.saveChanges') : t('eventsPage.save')}
                </Button>
              </DialogActions>
            </Form>
          </Dialog>
        )}
      </Formik>

      <Dialog fullWidth maxWidth="md" open={isGuestsDialogOpen} onClose={() => setIsGuestsDialogOpen(false)}>
        <DialogTitle>
          {t('eventsPage.guestsTitle')} - {selectedEventTitle}
        </DialogTitle>
        <DialogContent dividers>
          {guestsLoadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {guestsLoadError}
            </Alert>
          )}

          {isGuestsLoading ? (
            <Typography variant="body2" color="text.secondary">
              {t('eventsPage.loadingGuests')}
            </Typography>
          ) : (
            <TableContainer
              sx={{
                width: '100%',
                overflowX: 'auto',
                '& td, & th': { whiteSpace: 'nowrap' }
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <GreekTableHeadCell>{t('eventsPage.guestsTable.name')}</GreekTableHeadCell>
                    <GreekTableHeadCell align="center">{t('eventsPage.guestsTable.countPerson')}</GreekTableHeadCell>
                    <GreekTableHeadCell>{t('eventsPage.guestsTable.status')}</GreekTableHeadCell>
                    <GreekTableHeadCell>{t('eventsPage.guestsTable.url')}</GreekTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                            {t('eventsPage.noGuests')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventGuests.map((guest) => {
                        const chip = getRsvpChipProps(guest.rsvpStatus, t);

                      return (
                        <TableRow key={guest.guestId} hover>
                          <TableCell>{guest.fullName}</TableCell>
                          <TableCell align="center">1</TableCell>
                          <TableCell>
                            <Chip size="small" label={chip.label} color={chip.color} />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => copyGuestInvitationUrl(guest)}
                              disabled={!guest.invitationCode}
                            >
                              {copiedGuestId === guest.guestId
                                ? t('eventsPage.guestsTable.copied')
                                : t('eventsPage.guestsTable.copyUrl')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGuestsDialogOpen(false)}>{t('eventsPage.close')}</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
