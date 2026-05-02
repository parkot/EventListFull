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

const templateTypes = ['UserRegistrationConfirm', 'PasswordReset', 'WelcomeMessage', 'InvitationReminder', 'EventUpdated'];
const supportedLanguages = ['en', 'es', 'el'];
const languageLabels = {
  en: 'English',
  es: 'Spanish',
  el: 'Greek'
};

function emptyForm() {
  return {
    type: 'UserRegistrationConfirm',
    language: 'en',
    subject: '',
    body: ''
  };
}

export default function EmailTemplatesPage() {
  const session = getAuthSession();
  const isAdministrator = session?.user?.role === 'Administrator';
  const { t } = useTranslation();

  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm());
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    toEmail: session?.user?.email || '',
    type: 'UserRegistrationConfirm',
    language: 'en'
  });

  const availableLanguages = useMemo(() => {
    const values = Array.from(
      new Set([...supportedLanguages, ...templates.map((template) => (template.language || '').trim().toLowerCase()).filter(Boolean)])
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return templates.filter((template) => {
      if (typeFilter !== 'All' && template.type !== typeFilter) {
        return false;
      }

      if (languageFilter !== 'All' && template.language !== languageFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [template.type, template.language, template.subject, template.body].join(' ').toLowerCase().includes(query);
    });
  }, [languageFilter, searchText, templates, typeFilter]);

  const preview = useMemo(() => {
    const demoValues = {
      Email: 'demo@eventlist.local',
      Token: 'TOKEN-123456',
      ConfirmationLink: 'https://app.eventlist.local/confirm-email?token=TOKEN-123456',
      ResetLink: 'https://app.eventlist.local/reset-password?token=TOKEN-123456',
      EventTitle: 'Spring Gala Dinner',
      EventDate: '2026-06-15 19:30 UTC',
      EventLink: 'https://app.eventlist.local/events/demo'
    };

    return applyTemplateTokens(form.body || '', demoValues);
  }, [form.body]);

  const apiUnavailableMessage = useMemo(
    () => t('emailTemplates.errors.backendUnavailable', { baseUrl: getApiBaseUrl() }),
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
      const response = await apiRequest('/api/admin/email-templates/');
      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('emailTemplates.errors.load')));
      }

      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('emailTemplates.errors.load'), apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage, isAdministrator]);

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
      type: template.type || 'UserRegistrationConfirm',
      language: template.language || 'en',
      subject: template.subject || '',
      body: template.body || ''
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const openTestDialog = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setTestForm({
      toEmail: session?.user?.email || '',
      type: typeFilter !== 'All' ? typeFilter : 'UserRegistrationConfirm',
      language: languageFilter !== 'All' ? languageFilter : 'en'
    });
    setIsTestDialogOpen(true);
  };

  const closeTestDialog = () => setIsTestDialogOpen(false);

  const saveTemplate = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      type: form.type,
      language: (form.language || 'en').trim().toLowerCase(),
      subject: form.subject.trim(),
      body: form.body.trim()
    };

    if (!payload.subject || !payload.body) {
      setErrorMessage(t('emailTemplates.errors.subjectBodyRequired'));
      return;
    }

    try {
      const response = await apiRequest('/api/admin/email-templates/', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('emailTemplates.errors.save')));
      }

      await loadTemplates();
      setSuccessMessage(t('emailTemplates.success.saved'));
      closeDialog();
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('emailTemplates.errors.save'), apiUnavailableMessage));
    }
  };

  const sendTestEmail = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      toEmail: testForm.toEmail.trim(),
      type: testForm.type,
      language: (testForm.language || 'en').trim().toLowerCase()
    };

    if (!payload.toEmail) {
      setErrorMessage(t('emailTemplates.errors.recipientRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.toEmail)) {
      setErrorMessage(t('emailTemplates.errors.invalidEmail'));
      return;
    }

    try {
      const response = await apiRequest('/api/admin/email-templates/test', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('emailTemplates.errors.sendTest')));
      }

      setSuccessMessage(t('emailTemplates.success.testSent', { toEmail: payload.toEmail }));
      closeTestDialog();
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('emailTemplates.errors.sendTest'), apiUnavailableMessage));
    }
  };

  if (!isAdministrator) {
    return (
      <MainCard title={t('emailTemplates.title')}>
        <Alert severity="warning">{t('emailTemplates.adminOnly')}</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={t('emailTemplates.title')}
      secondary={
        <Button variant="contained" onClick={openCreate}>
          {t('emailTemplates.newTemplate')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" color="secondary" onClick={openTestDialog} sx={{ minWidth: 180 }}>
            {t('emailTemplates.sendTestEmail')}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label={t('emailTemplates.filterByType')}
            select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="All">{t('emailTemplates.all')}</MenuItem>
            {templateTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('emailTemplates.filterByLanguage')}
            select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="All">{t('emailTemplates.all')}</MenuItem>
            {availableLanguages.map((option) => (
              <MenuItem key={option} value={option}>
                {getLanguageLabel(option)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('emailTemplates.search')}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t('emailTemplates.searchPlaceholder')}
            fullWidth
          />
        </Stack>

        <TableContainer sx={{ width: '100%', overflowX: 'auto', '& td, & th': { whiteSpace: 'nowrap' } }}>
          <Table>
            <TableHead>
              <TableRow>
                <GreekTableHeadCell>{t('emailTemplates.table.action')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('emailTemplates.table.type')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('emailTemplates.table.language')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('emailTemplates.table.subject')}</GreekTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      {t('emailTemplates.loading')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      {t('emailTemplates.noTemplates')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => openEdit(template)}>
                        {t('emailTemplates.edit')}
                      </Button>
                    </TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell>{template.language}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{t('emailTemplates.dialog.saveTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('emailTemplates.dialog.typeLabel')}
              select
              value={form.type}
              onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value }))}
            >
              {templateTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('emailTemplates.dialog.languageLabel')}
              select
              value={form.language}
              onChange={(event) => setForm((previous) => ({ ...previous, language: event.target.value }))}
              helperText={t('emailTemplates.dialog.languageHelper')}
            >
              {availableLanguages.map((option) => (
                <MenuItem key={option} value={option}>
                  {getLanguageLabel(option)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('emailTemplates.dialog.subjectLabel')}
              value={form.subject}
              onChange={(event) => setForm((previous) => ({ ...previous, subject: event.target.value }))}
              required
            />

            <TextField
              label={t('emailTemplates.dialog.bodyLabel')}
              value={form.body}
              onChange={(event) => setForm((previous) => ({ ...previous, body: event.target.value }))}
              required
              multiline
              minRows={10}
              helperText={t('emailTemplates.dialog.bodyHelper')}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('emailTemplates.dialog.livePreview')}
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
                {t('emailTemplates.dialog.previewCaption')}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Box>
            <Button onClick={closeDialog}>{t('emailTemplates.dialog.cancel')}</Button>
          </Box>
          <Button variant="contained" onClick={saveTemplate}>
            {t('emailTemplates.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isTestDialogOpen} onClose={closeTestDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('emailTemplates.dialog.testTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('emailTemplates.dialog.toEmailLabel')}
              type="email"
              value={testForm.toEmail}
              onChange={(event) => setTestForm((previous) => ({ ...previous, toEmail: event.target.value }))}
              required
              autoFocus
              error={Boolean(testForm.toEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testForm.toEmail.trim()))}
              helperText={testForm.toEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testForm.toEmail.trim()) ? t('emailTemplates.errors.invalidEmail') : ''}
            />
            <TextField
              label={t('emailTemplates.dialog.templateTypeLabel')}
              select
              value={testForm.type}
              onChange={(event) => setTestForm((previous) => ({ ...previous, type: event.target.value }))}
            >
              {templateTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('emailTemplates.dialog.languageLabel')}
              select
              value={testForm.language}
              onChange={(event) => setTestForm((previous) => ({ ...previous, language: event.target.value }))}
              helperText={t('emailTemplates.dialog.testLanguageHelper')}
            >
              {availableLanguages.map((option) => (
                <MenuItem key={option} value={option}>
                  {getLanguageLabel(option)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTestDialog}>{t('emailTemplates.dialog.cancel')}</Button>
          <Button variant="contained" onClick={sendTestEmail}>
            {t('emailTemplates.dialog.send')}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
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

function applyTemplateTokens(template, values) {
  return Object.entries(values).reduce((content, [key, value]) => content.replaceAll(`{{${key}}}`, value), template);
}

function getLanguageLabel(code) {
  const normalized = (code || '').trim().toLowerCase();
  return languageLabels[normalized] || normalized;
}