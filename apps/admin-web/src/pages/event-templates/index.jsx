import { useCallback, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
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

import { useTranslation } from 'react-i18next';

import GreekTableHeadCell from 'components/GreekTableHeadCell';
import MainCard from 'components/MainCard';
import { apiRequest, getApiBaseUrl } from 'utils/api';
import { getAuthSession } from 'utils/auth';

function emptyForm() {
  return {
    name: '',
    language: 'en',
    body: ''
  };
}

function getLanguageLabel(code) {
  const normalized = (code || '').trim().toLowerCase();

  if (normalized === 'en') {
    return 'English';
  }

  if (normalized === 'es') {
    return 'Spanish';
  }

  if (normalized === 'el') {
    return 'Greek';
  }

  return code;
}

export default function EventTemplatesPage() {
  const session = getAuthSession();
  const isAdministrator = session?.user?.role === 'Administrator';
  const { t } = useTranslation();

  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm());

  const availableLanguages = useMemo(() => {
    const values = Array.from(new Set(['en', 'es', 'el', ...templates.map((template) => (template.language || '').trim().toLowerCase())]));
    return values.filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [templates]);

  const availableLanguageOptions = useMemo(
    () => availableLanguages.map((languageCode) => ({ value: languageCode, label: getLanguageLabel(languageCode) })),
    [availableLanguages]
  );

  const filteredTemplates = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return templates.filter((template) => {
      if (languageFilter !== 'All' && template.language !== languageFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [template.name, template.language, template.body].join(' ').toLowerCase().includes(query);
    });
  }, [languageFilter, searchText, templates]);

  const preview = useMemo(() => {
    const demoValues = {
      GuestName: 'Alex Johnson',
      EventTitle: 'Spring Gala Dinner',
      EventDateUtc: '2026-06-15 19:30 UTC',
      Venue: 'Central Hall',
      Address: '55 Main Street',
      InvitationLink: 'https://app.eventlist.local/invitations/demo',
      ScanCode: 'SCAN-12345',
      TableNumber: '12'
    };

    return applyTemplateTokens(form.body || '', demoValues);
  }, [form.body]);

  const apiUnavailableMessage = useMemo(
    () => t('eventTemplates.errors.backendUnavailable', { baseUrl: getApiBaseUrl() }),
    [t]
  );

  const loadTemplates = useCallback(async () => {
    if (!isAdministrator) {
      setIsLoading(false);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/admin/event-templates/');
      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('eventTemplates.errors.load')));
      }

      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('eventTemplates.errors.load'), apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage, isAdministrator, t]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const openCreate = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setForm(emptyForm());
    setIsDialogOpen(true);
  };

  const openEdit = (template) => {
    setErrorMessage('');
    setSuccessMessage('');
    setForm({
      name: template.name || '',
      language: template.language || 'en',
      body: template.body || ''
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const saveTemplate = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      name: form.name.trim(),
      language: (form.language || 'en').trim().toLowerCase(),
      body: form.body.trim()
    };

    if (!payload.name || !payload.body) {
      setErrorMessage(t('eventTemplates.errors.nameBodyRequired'));
      return;
    }

    try {
      const response = await apiRequest('/api/admin/event-templates/', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('eventTemplates.errors.save')));
      }

      await loadTemplates();
      setSuccessMessage(t('eventTemplates.success.saved'));
      closeDialog();
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('eventTemplates.errors.save'), apiUnavailableMessage));
    }
  };

  if (!isAdministrator) {
    return (
      <MainCard title={t('eventTemplates.title')}>
        <Alert severity="warning">{t('eventTemplates.adminOnly')}</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={t('eventTemplates.title')}
      secondary={
        <Button variant="contained" onClick={openCreate}>
          {t('eventTemplates.newTemplate')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label={t('eventTemplates.filterByLanguage')}
            select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="All">{t('eventTemplates.all')}</MenuItem>
            {availableLanguageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('eventTemplates.search')}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t('eventTemplates.searchPlaceholder')}
            fullWidth
          />
        </Stack>

        <TableContainer sx={{ width: '100%', overflowX: 'auto', '& td, & th': { whiteSpace: 'nowrap' } }}>
          <Table>
            <TableHead>
              <TableRow>
                <GreekTableHeadCell>{t('eventTemplates.table.action')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('eventTemplates.table.name')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('eventTemplates.table.language')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('eventTemplates.table.created')}</GreekTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      {t('eventTemplates.loading')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      {t('eventTemplates.noTemplates')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => openEdit(template)}>
                        {t('eventTemplates.edit')}
                      </Button>
                    </TableCell>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{getLanguageLabel(template.language)}</TableCell>
                    <TableCell>{formatDateTime(template.createdAtUtc)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{t('eventTemplates.dialog.saveTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('eventTemplates.dialog.nameLabel')}
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
              required
            />

            <TextField
              label={t('eventTemplates.dialog.languageLabel')}
              select
              value={form.language}
              onChange={(event) => setForm((previous) => ({ ...previous, language: event.target.value }))}
            >
              {availableLanguageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('eventTemplates.dialog.bodyLabel')}
              value={form.body}
              onChange={(event) => setForm((previous) => ({ ...previous, body: event.target.value }))}
              required
              multiline
              minRows={10}
              helperText={t('eventTemplates.dialog.bodyHelper')}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('eventTemplates.dialog.livePreview')}
              </Typography>
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
                dangerouslySetInnerHTML={{ __html: preview }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('eventTemplates.dialog.previewCaption')}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{t('eventTemplates.dialog.cancel')}</Button>
          <Button variant="contained" onClick={saveTemplate}>
            {t('eventTemplates.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

function applyTemplateTokens(template, values) {
  return Object.entries(values).reduce((content, [key, value]) => content.replaceAll(`{{${key}}}`, value), template);
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
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
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return unreachableMessage;
  }

  return message || fallback;
}
