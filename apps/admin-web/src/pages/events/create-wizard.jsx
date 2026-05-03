import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { apiRequest } from 'utils/api';

function getAllTimeZones() {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }
  } catch {
    // Fall back when supportedValuesOf is unavailable.
  }

  return ['UTC', 'Europe/Athens', 'Europe/London', 'Europe/Madrid', 'America/New_York', 'America/Los_Angeles'];
}

function toLocalDateTimeInputValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toFriendlyError(error, fallback, unreachableMessage) {
  const message = error?.message || '';
  if (message.toLowerCase().includes('failed to fetch')) {
    return unreachableMessage;
  }

  return message || fallback;
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

function toEventPayload(values) {
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

export default function CreateEventWizardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [templates, setTemplates] = useState([]);
  const [people, setPeople] = useState([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedPersonIds, setSelectedPersonIds] = useState([]);
  const [savedEvent, setSavedEvent] = useState(null);

  const [eventForm, setEventForm] = useState(() => ({
    title: '',
    occasionType: '',
    scheduledAtUtc: toLocalDateTimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    venue: '',
    address: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    defaultLanguage: 'en'
  }));

  const steps = useMemo(
    () => [
      t('wizardPage.steps.createEvent'),
      t('wizardPage.steps.selectTemplate'),
      t('wizardPage.steps.selectPeople'),
      t('wizardPage.steps.preview'),
      t('wizardPage.steps.confirmAndSend')
    ],
    [t]
  );

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: t('language.english') },
      { value: 'es', label: t('language.spanish') },
      { value: 'el', label: t('language.greek') }
    ],
    [t]
  );

  const timeZoneOptions = useMemo(() => getAllTimeZones(), []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  const selectedPeople = useMemo(() => {
    const selectedSet = new Set(selectedPersonIds);
    return people.filter((person) => selectedSet.has(person.id));
  }, [people, selectedPersonIds]);

  const loadTemplates = useCallback(async () => {
    const response = await apiRequest('/api/templates/');
    if (!response.ok) {
      throw new Error(await getErrorMessageFromResponse(response, t('wizardPage.errors.loadTemplates')));
    }

    const data = await response.json();
    setTemplates(Array.isArray(data) ? data : []);
  }, [t]);

  const loadPeople = useCallback(async () => {
    const response = await apiRequest('/api/people/');
    if (!response.ok) {
      throw new Error(await getErrorMessageFromResponse(response, t('wizardPage.errors.loadPeople')));
    }

    const data = await response.json();
    setPeople(Array.isArray(data) ? data : []);
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setIsBusy(true);
      setErrorMessage('');

      try {
        await Promise.all([loadTemplates(), loadPeople()]);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(toFriendlyError(error, t('wizardPage.errors.loadWizardData'), t('wizardPage.errors.backendUnavailable')));
        }
      } finally {
        if (isMounted) {
          setIsBusy(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [loadPeople, loadTemplates]);

  const validateCurrentStep = () => {
    if (activeStep === 0) {
      if (!eventForm.title.trim()) {
        return t('wizardPage.validation.titleRequired');
      }

      if (!eventForm.occasionType.trim()) {
        return t('wizardPage.validation.occasionTypeRequired');
      }

      if (!eventForm.scheduledAtUtc) {
        return t('wizardPage.validation.scheduledRequired');
      }

      if (!eventForm.venue.trim()) {
        return t('wizardPage.validation.venueRequired');
      }

      if (!eventForm.address.trim()) {
        return t('wizardPage.validation.addressRequired');
      }

      if (!eventForm.timeZone.trim()) {
        return t('wizardPage.validation.timeZoneRequired');
      }

      return '';
    }

    if (activeStep === 1 && !selectedTemplateId) {
      return t('wizardPage.validation.templateRequired');
    }

    if (activeStep === 2 && selectedPersonIds.length === 0) {
      return t('wizardPage.validation.peopleRequired');
    }

    return '';
  };

  const handleNext = () => {
    setErrorMessage('');
    setSuccessMessage('');

    const validationError = validateCurrentStep();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setActiveStep((previous) => Math.min(previous + 1, steps.length - 1));
  };

  const handleBack = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setActiveStep((previous) => Math.max(previous - 1, 0));
  };

  const togglePerson = (personId) => {
    setSelectedPersonIds((previous) => {
      if (previous.includes(personId)) {
        return previous.filter((id) => id !== personId);
      }

      return [...previous, personId];
    });
  };

  const buildGuestsPayload = () => {
    return {
      guests: selectedPeople.map((person) => ({
        fullName: (person.fullName || '').trim(),
        email: (person.email || '').trim(),
        phoneNumber: (person.phoneNumber || '').trim(),
        preferredLanguage: (person.preferredLanguage || eventForm.defaultLanguage || 'en').trim().toLowerCase()
      }))
    };
  };

  const handleConfirmAndSend = async () => {
    setIsBusy(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const eventPayload = toEventPayload(eventForm);
      const saveEventResponse = await apiRequest(savedEvent ? `/api/events/${savedEvent.id}` : '/api/events/', {
        method: savedEvent ? 'PUT' : 'POST',
        body: JSON.stringify(eventPayload)
      });

      if (!saveEventResponse.ok) {
        throw new Error(
          await getErrorMessageFromResponse(
            saveEventResponse,
            savedEvent ? t('wizardPage.errors.updateEvent') : t('wizardPage.errors.createEvent')
          )
        );
      }

      const eventResult = await saveEventResponse.json();
      const eventId = eventResult?.id || savedEvent?.id;

      if (!eventId) {
        throw new Error(t('wizardPage.errors.eventIdMissing'));
      }

      setSavedEvent(eventResult);

      const addGuestsResponse = await apiRequest(`/api/events/${eventId}/guests`, {
        method: 'POST',
        body: JSON.stringify(buildGuestsPayload())
      });

      if (!addGuestsResponse.ok) {
        throw new Error(await getErrorMessageFromResponse(addGuestsResponse, t('wizardPage.errors.addGuests')));
      }

      const sendResponse = await apiRequest(`/api/events/${eventId}/deliveries/send`, {
        method: 'POST',
        body: JSON.stringify({
          templateId: selectedTemplateId,
          guestIds: null
        })
      });

      if (!sendResponse.ok) {
        throw new Error(await getErrorMessageFromResponse(sendResponse, t('wizardPage.errors.sendInvitations')));
      }

      setSuccessMessage(t('wizardPage.success.sent'));
      setActiveStep(steps.length - 1);
    } catch (error) {
      setErrorMessage(toFriendlyError(error, t('wizardPage.errors.completeWizard'), t('wizardPage.errors.backendUnavailable')));
    } finally {
      setIsBusy(false);
    }
  };

  const renderEventStep = () => {
    return (
      <Stack spacing={2}>
        <TextField
          label={t('wizardPage.form.title')}
          value={eventForm.title}
          onChange={(event) => setEventForm((previous) => ({ ...previous, title: event.target.value }))}
          fullWidth
          required
        />
        <TextField
          label={t('wizardPage.form.occasionType')}
          value={eventForm.occasionType}
          onChange={(event) => setEventForm((previous) => ({ ...previous, occasionType: event.target.value }))}
          fullWidth
          required
        />
        <TextField
          label={t('wizardPage.form.scheduledDateTime')}
          type="datetime-local"
          value={eventForm.scheduledAtUtc}
          onChange={(event) => setEventForm((previous) => ({ ...previous, scheduledAtUtc: event.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />
        <TextField
          label={t('wizardPage.form.venue')}
          value={eventForm.venue}
          onChange={(event) => setEventForm((previous) => ({ ...previous, venue: event.target.value }))}
          fullWidth
          required
        />
        <TextField
          label={t('wizardPage.form.address')}
          value={eventForm.address}
          onChange={(event) => setEventForm((previous) => ({ ...previous, address: event.target.value }))}
          fullWidth
          required
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label={t('wizardPage.form.defaultLanguage')}
            select
            value={eventForm.defaultLanguage}
            onChange={(event) => setEventForm((previous) => ({ ...previous, defaultLanguage: event.target.value }))}
            fullWidth
          >
            {languageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('wizardPage.form.timeZone')}
            select
            value={eventForm.timeZone}
            onChange={(event) => setEventForm((previous) => ({ ...previous, timeZone: event.target.value }))}
            fullWidth
          >
            {timeZoneOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
    );
  };

  const renderTemplateStep = () => {
    if (templates.length === 0) {
      return (
        <Alert severity="warning">
          {t('wizardPage.warnings.noTemplates')}
        </Alert>
      );
    }

    return (
      <Stack spacing={2}>
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <Card
              key={template.id}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1
              }}
              onClick={() => setSelectedTemplateId(template.id)}
            >
              <CardContent sx={{ pb: '12px !important' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => setSelectedTemplateId(template.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Typography variant="subtitle2">
                    {template.name} ({template.channel}, {template.language})
                  </Typography>
                </Stack>
                <Collapse in={Boolean(template.bodyTemplate)}>
                  <Divider sx={{ my: 1 }} />
                  {template.channel === 2 ? (
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1.5,
                        py: 1,
                        bgcolor: 'background.default',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}
                    >
                      {template.bodyTemplate}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1.5,
                        py: 1,
                        minHeight: 80,
                        maxHeight: 200,
                        overflow: 'auto',
                        bgcolor: 'background.paper'
                      }}
                      dangerouslySetInnerHTML={{ __html: template.bodyTemplate }}
                    />
                  )}
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  };

  const renderPeopleStep = () => {
    if (people.length === 0) {
      return <Alert severity="warning">{t('wizardPage.warnings.noPeople')}</Alert>;
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Select</TableCell>
              <TableCell>{t('wizardPage.table.name')}</TableCell>
              <TableCell>{t('wizardPage.table.email')}</TableCell>
              <TableCell>{t('wizardPage.table.phone')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((person) => {
              const isSelected = selectedPersonIds.includes(person.id);

              return (
                <TableRow key={person.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected} onChange={() => togglePerson(person.id)} />
                  </TableCell>
                  <TableCell>{person.fullName}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>{person.phoneNumber || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderPreviewStep = () => {
    return (
      <Stack spacing={1.5}>
        <Typography variant="subtitle1">{t('wizardPage.preview.eventSummary')}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.title')}: {eventForm.title}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.occasion')}: {eventForm.occasionType}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.when')}: {dayjs(eventForm.scheduledAtUtc).format('YYYY-MM-DD HH:mm')}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.venue')}: {eventForm.venue}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.address')}: {eventForm.address}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.timeZone')}: {eventForm.timeZone}</Typography>
        <Typography variant="body2">{t('wizardPage.preview.defaultLanguage')}: {eventForm.defaultLanguage}</Typography>

        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1">{t('wizardPage.preview.selectedTemplate')}</Typography>
          {selectedTemplate ? (
            <Stack spacing={1}>
              <Typography variant="body2">
                {selectedTemplate.name} ({selectedTemplate.channel}, {selectedTemplate.language})
              </Typography>
              {selectedTemplate.bodyTemplate ? (
                selectedTemplate.channel === 2 ? (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 1.5,
                      py: 1,
                      bgcolor: 'background.default',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.75rem',
                      color: 'text.secondary'
                    }}
                  >
                    {selectedTemplate.bodyTemplate}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 2,
                      py: 1.5,
                      minHeight: 140,
                      bgcolor: 'background.paper'
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyTemplate }}
                  />
                )
              ) : null}
            </Stack>
          ) : (
            <Typography variant="body2" color="error.main">
              {t('wizardPage.preview.noTemplateSelected')}
            </Typography>
          )}
        </Box>

        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1">{t('wizardPage.preview.recipients')}</Typography>
          <Typography variant="body2">{t('wizardPage.preview.peopleSelected', { count: selectedPeople.length })}</Typography>
        </Box>
      </Stack>
    );
  };

  const renderConfirmStep = () => {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('wizardPage.confirm.description')}
        </Typography>
        <Button variant="contained" onClick={handleConfirmAndSend} disabled={isBusy}>
          {t('wizardPage.confirm.confirmAndSend')}
        </Button>
        {savedEvent?.id ? (
          <Typography variant="caption" color="text.secondary">
            {t('wizardPage.confirm.eventId')}: {savedEvent.id}
          </Typography>
        ) : null}
      </Stack>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderEventStep();
      case 1:
        return renderTemplateStep();
      case 2:
        return renderPeopleStep();
      case 3:
        return renderPreviewStep();
      case 4:
        return renderConfirmStep();
      default:
        return null;
    }
  };

  return (
    <MainCard
      title={t('wizardPage.title')}
      secondary={
        <Button variant="outlined" onClick={() => navigate('/events')}>
          {t('wizardPage.actions.backToEvents')}
        </Button>
      }
    >
      <Stack spacing={3}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {isBusy && activeStep !== 4 ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              {t('wizardPage.loading')}
            </Typography>
          </Stack>
        ) : (
          renderStepContent()
        )}

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Button variant="text" disabled={activeStep === 0 || isBusy} onClick={handleBack}>
            {t('wizardPage.actions.back')}
          </Button>
          <Button variant="contained" onClick={handleNext} disabled={activeStep === steps.length - 1 || isBusy}>
            {t('wizardPage.actions.next')}
          </Button>
        </Stack>
      </Stack>
    </MainCard>
  );
}
