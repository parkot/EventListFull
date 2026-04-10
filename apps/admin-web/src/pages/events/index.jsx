import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import MainCard from 'components/MainCard';
import { apiRequest, getApiBaseUrl } from 'utils/api';

function toLocalDateTimeInputValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
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

  const defaultTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
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
                  <TableCell>{t('eventsPage.table.edit')}</TableCell>
                  <TableCell>{t('eventsPage.table.title')}</TableCell>
                  <TableCell>{t('eventsPage.table.occasion')}</TableCell>
                  <TableCell>{t('eventsPage.table.scheduledLocal')}</TableCell>
                  <TableCell>{t('eventsPage.table.venue')}</TableCell>
                  <TableCell align="right">{t('eventsPage.table.guests')}</TableCell>
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
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, status, resetForm }) => (
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

                  <TextField
                    fullWidth
                    id="scheduledAtUtc"
                    name="scheduledAtUtc"
                    label={t('eventsPage.form.scheduledDateTime')}
                    type="datetime-local"
                    value={values.scheduledAtUtc}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.scheduledAtUtc && errors.scheduledAtUtc)}
                    helperText={touched.scheduledAtUtc && errors.scheduledAtUtc}
                    InputLabelProps={{ shrink: true }}
                  />

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
                    <TextField
                      fullWidth
                      id="timeZone"
                      name="timeZone"
                      label={t('eventsPage.form.timeZone')}
                      value={values.timeZone}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.timeZone && errors.timeZone)}
                      helperText={touched.timeZone && errors.timeZone}
                    />

                    <TextField
                      fullWidth
                      id="defaultLanguage"
                      name="defaultLanguage"
                      label={t('eventsPage.form.defaultLanguage')}
                      value={values.defaultLanguage}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.defaultLanguage && errors.defaultLanguage)}
                      helperText={touched.defaultLanguage && errors.defaultLanguage}
                    />
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
                    <TableCell>{t('eventsPage.guestsTable.name')}</TableCell>
                    <TableCell align="center">{t('eventsPage.guestsTable.countPerson')}</TableCell>
                    <TableCell>{t('eventsPage.guestsTable.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
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
