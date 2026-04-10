import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import { apiRequest, getApiBaseUrl } from 'utils/api';

function toLocalDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
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

export default function PublicInvitationPage() {
  const { publicCode = '' } = useParams();
  const { t } = useTranslation();
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const apiUnavailableMessage = useMemo(
    () =>
      t('publicInvitation.errors.backendUnavailable', {
        baseUrl: getApiBaseUrl()
      }),
    [t]
  );

  const loadInvitation = useCallback(async () => {
    if (!publicCode) {
      setLoadError(t('publicInvitation.errors.invalidInvitation'));
      setInvitation(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');

    try {
      const response = await apiRequest(`/api/invitations/${encodeURIComponent(publicCode)}`, {
        auth: false,
        retryOnAuthFailure: false
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t('publicInvitation.errors.invalidInvitation'));
        }

        throw new Error(await getErrorMessageFromResponse(response, t('publicInvitation.errors.loadInvitation')));
      }

      const data = await response.json();
      setInvitation(data);
    } catch (error) {
      setLoadError(toFriendlyRequestError(error, t('publicInvitation.errors.loadInvitation'), apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage, publicCode, t]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  const submitRsvp = async (status) => {
    if (!publicCode) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await apiRequest(`/api/invitations/${encodeURIComponent(publicCode)}/rsvp`, {
        auth: false,
        retryOnAuthFailure: false,
        method: 'POST',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('publicInvitation.errors.submitRsvp')));
      }

      const data = await response.json();
      setInvitation(data);
      setSubmitSuccess(t('publicInvitation.responseSaved'));
    } catch (error) {
      setSubmitError(toFriendlyRequestError(error, t('publicInvitation.errors.submitRsvp'), apiUnavailableMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRsvpChip = getRsvpChipProps(invitation?.rsvpStatus, t);

  return (
    <AuthWrapper>
      <Stack spacing={2}>
        <Typography variant="h3">{t('publicInvitation.title')}</Typography>

        {isLoading ? (
          <Typography color="text.secondary">{t('publicInvitation.loading')}</Typography>
        ) : (
          <>
            {loadError && <Alert severity="error">{loadError}</Alert>}

            {invitation && (
              <Stack spacing={2}>
                <Typography variant="h5">{t('publicInvitation.welcome', { guestName: invitation.guestName })}</Typography>

                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: 'background.paper' }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>{t('publicInvitation.eventTitle')}:</strong> {invitation.eventTitle}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('publicInvitation.occasion')}:</strong> {invitation.occasionType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('publicInvitation.scheduled')}:</strong> {toLocalDateTime(invitation.scheduledAtUtc)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('publicInvitation.venue')}:</strong> {invitation.venue}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('publicInvitation.address')}:</strong> {invitation.address}
                    </Typography>
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.75 }}>
                        <strong>{t('publicInvitation.currentResponse')}:</strong>
                      </Typography>
                      <Chip size="small" label={currentRsvpChip.label} color={currentRsvpChip.color} />
                    </Box>
                  </Stack>
                </Box>

                {submitError && <Alert severity="error">{submitError}</Alert>}
                {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}

                <Typography variant="subtitle1">{t('publicInvitation.answerPrompt')}</Typography>

                <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' } }}>
                  <Button
                    variant={invitation.rsvpStatus === 'Attending' ? 'contained' : 'outlined'}
                    color="success"
                    disabled={isSubmitting}
                    onClick={() => submitRsvp('Attending')}
                  >
                    {t('publicInvitation.actions.agree')}
                  </Button>
                  <Button
                    variant={invitation.rsvpStatus === 'Maybe' ? 'contained' : 'outlined'}
                    color="info"
                    disabled={isSubmitting}
                    onClick={() => submitRsvp('Maybe')}
                  >
                    {t('publicInvitation.actions.dontKnow')}
                  </Button>
                  <Button
                    variant={invitation.rsvpStatus === 'Declined' ? 'contained' : 'outlined'}
                    color="error"
                    disabled={isSubmitting}
                    onClick={() => submitRsvp('Declined')}
                  >
                    {t('publicInvitation.actions.reject')}
                  </Button>
                </Box>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </AuthWrapper>
  );
}