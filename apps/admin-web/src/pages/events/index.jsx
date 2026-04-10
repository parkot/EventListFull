import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

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

const createEventSchema = Yup.object().shape({
  title: Yup.string().max(120, 'Title must be 120 characters or less').required('Title is required'),
  occasionType: Yup.string().max(60, 'Occasion type must be 60 characters or less').required('Occasion type is required'),
  scheduledAtUtc: Yup.string().required('Date and time are required'),
  venue: Yup.string().max(160, 'Venue must be 160 characters or less').required('Venue is required'),
  address: Yup.string().max(240, 'Address must be 240 characters or less').required('Address is required'),
  timeZone: Yup.string().max(100, 'Time zone must be 100 characters or less').required('Time zone is required'),
  defaultLanguage: Yup.string().max(10, 'Language must be 10 characters or less').required('Default language is required')
});

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

function toFriendlyRequestError(error, fallback) {
  const message = error?.message || '';

  if (message.toLowerCase().includes('failed to fetch')) {
    return `Cannot reach backend API at ${getApiBaseUrl()}. Start API with: dotnet run --project src/Backend/EventList.Api`;
  }

  return message || fallback;
}

function getRsvpChipProps(status) {
  switch (status) {
    case 'Attending':
      return { label: 'Accepted', color: 'success' };
    case 'Declined':
      return { label: 'Rejected', color: 'error' };
    case 'Maybe':
      return { label: 'Maybe', color: 'info' };
    default:
      return { label: 'Pending', color: 'warning' };
  }
}

export default function EventsPage() {
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
        throw new Error(await getErrorMessageFromResponse(response, 'Unable to load events right now.'));
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(toFriendlyRequestError(error, 'Unable to load events right now.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        throw new Error(await getErrorMessageFromResponse(response, 'Failed to load event details.'));
      }

      const eventData = await response.json();
      setEditingEvent(eventData);
      setIsCreateDialogOpen(true);
    } catch (error) {
      setLoadError(toFriendlyRequestError(error, 'Failed to load event details.'));
    }
  };

  const openGuestsDialog = async (eventId, eventTitle) => {
    setIsGuestsDialogOpen(true);
    setSelectedEventTitle(eventTitle || 'Event');
    setEventGuests([]);
    setGuestsLoadError('');
    setIsGuestsLoading(true);

    try {
      const response = await apiRequest(`/api/events/${eventId}`);

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, 'Failed to load guests.'));
      }

      const eventData = await response.json();
      setSelectedEventTitle(eventData?.title || eventTitle || 'Event');
      setEventGuests(Array.isArray(eventData?.guests) ? eventData.guests : []);
    } catch (error) {
      setGuestsLoadError(toFriendlyRequestError(error, 'Failed to load guests.'));
    } finally {
      setIsGuestsLoading(false);
    }
  };

  return (
    <MainCard
      title="Events"
      secondary={
        <Button variant="contained" onClick={openCreateDialog}>
          Create New Event
        </Button>
      }
    >
      <Stack spacing={2}>
        {loadError && <Alert severity="error">{loadError}</Alert>}

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading events...
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
                  <TableCell>Edit</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Occasion</TableCell>
                  <TableCell>Scheduled (Local)</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell align="right">Guests</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        No events yet. Create your first event.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((eventItem) => (
                    <TableRow hover key={eventItem.id}>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => openEditDialog(eventItem.id)}>
                          Edit
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
              throw new Error(await getErrorMessageFromResponse(response, 'Failed to create event.'));
            }

            setIsCreateDialogOpen(false);
            setEditingEvent(null);
            resetForm();
            await loadEvents();
          } catch (error) {
            setStatus(toFriendlyRequestError(error, 'Failed to create event.'));
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
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  {status && <Alert severity="error">{status}</Alert>}

                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    label="Title"
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
                    label="Occasion Type"
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
                    label="Scheduled Date & Time"
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
                    label="Venue"
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
                    label="Address"
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
                      label="Time Zone"
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
                      label="Default Language"
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
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {editingEvent ? 'Save Changes' : 'Save'}
                </Button>
              </DialogActions>
            </Form>
          </Dialog>
        )}
      </Formik>

      <Dialog fullWidth maxWidth="md" open={isGuestsDialogOpen} onClose={() => setIsGuestsDialogOpen(false)}>
        <DialogTitle>Guests - {selectedEventTitle}</DialogTitle>
        <DialogContent dividers>
          {guestsLoadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {guestsLoadError}
            </Alert>
          )}

          {isGuestsLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading guests...
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
                    <TableCell>Name</TableCell>
                    <TableCell align="center">Count Person</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          No guests found for this event.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventGuests.map((guest) => {
                      const chip = getRsvpChipProps(guest.rsvpStatus);

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
          <Button onClick={() => setIsGuestsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
