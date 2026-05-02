import { useCallback, useEffect, useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import MainCard from 'components/MainCard';
import GreekTableHeadCell from 'components/GreekTableHeadCell';
import { apiRequest, getApiBaseUrl } from 'utils/api';
import { getAuthSession } from 'utils/auth';
import { useTranslation } from 'react-i18next';

const roleOptions = ['FreeUser', 'PremiumUser', 'Administrator'];
const preferredLanguageOptions = [
  { value: 'en', label: 'en - English' },
  { value: 'es', label: 'es - Spain' },
  { value: 'el', label: 'gr - Greece' }
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

function getPreferredLanguageLabel(code) {
  const match = preferredLanguageOptions.find((option) => option.value === code);
  return match?.label || code || '-';
}

function getTimeZoneLabel(timeZone, timeZoneOptions) {
  const match = timeZoneOptions.find((option) => option.value === timeZone);
  return match?.label || timeZone || '-';
}

function formatDate(value, timeZone) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function emptyUserForm(defaultTimeZone) {
  return {
    email: '',
    password: '',
    preferredLanguage: 'en',
    timeZone: defaultTimeZone,
    role: 'FreeUser',
    emailConfirmed: true
  };
}

export default function UsersPage() {
  const session = getAuthSession();
  const isAdministrator = session?.user?.role === 'Administrator';
  const { t } = useTranslation();
  const defaultTimeZone = useMemo(() => session?.user?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [session]);
  const timeZoneOptions = useMemo(() => getAllTimeZones().map(mapTimeZoneOption), []);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(() => emptyUserForm(defaultTimeZone));

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(() => emptyUserForm(defaultTimeZone));

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const apiUnavailableMessage = useMemo(
    () => t('usersPage.errors.backendUnavailable', { baseUrl: getApiBaseUrl() }),
    [t]
  );

  const loadUsers = useCallback(async () => {
    if (!isAdministrator) {
      setIsLoading(false);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/admin/users/');
      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('usersPage.errors.load')));
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('usersPage.errors.load'), apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage, isAdministrator]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setCreateForm(emptyUserForm(defaultTimeZone));
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
  };

  const openEdit = (user) => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditingUser(user);
    setEditForm({
      email: user.email || '',
      password: '',
      preferredLanguage: user.preferredLanguage || 'en',
      timeZone: user.timeZone || defaultTimeZone,
      role: user.role || 'FreeUser',
      emailConfirmed: Boolean(user.emailConfirmed)
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingUser(null);
  };

  const openView = async (userId) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await apiRequest(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('usersPage.errors.loadDetails')));
      }

      const data = await response.json();
      setViewUser(data);
      setIsViewOpen(true);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('usersPage.errors.loadDetails'), apiUnavailableMessage));
    }
  };

  const closeView = () => {
    setIsViewOpen(false);
    setViewUser(null);
  };

  const createUser = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const email = createForm.email.trim();
    const password = createForm.password;
    if (!email || !password) {
      setErrorMessage(t('usersPage.errors.emailPasswordRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('usersPage.errors.invalidEmail'));
      return;
    }

    try {
      const response = await apiRequest('/api/admin/users/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          preferredLanguage: createForm.preferredLanguage.trim() || 'en',
          timeZone: createForm.timeZone.trim() || 'UTC',
          role: createForm.role
        })
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('usersPage.errors.create')));
      }

      await loadUsers();
      setSuccessMessage(t('usersPage.success.created'));
      closeCreate();
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('usersPage.errors.create'), apiUnavailableMessage));
    }
  };

  const updateUser = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!editingUser) {
      return;
    }

    const email = editForm.email.trim();
    if (!email) {
      setErrorMessage(t('usersPage.errors.emailRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('usersPage.errors.invalidEmail'));
      return;
    }

    try {
      const response = await apiRequest(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          email,
          preferredLanguage: editForm.preferredLanguage.trim() || 'en',
          timeZone: editForm.timeZone.trim() || 'UTC',
          role: editForm.role,
          emailConfirmed: Boolean(editForm.emailConfirmed)
        })
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('usersPage.errors.update')));
      }

      await loadUsers();
      setSuccessMessage(t('usersPage.success.updated'));
      closeEdit();
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('usersPage.errors.update'), apiUnavailableMessage));
    }
  };

  if (!isAdministrator) {
    return (
      <MainCard title={t('usersPage.title')}>
        <Alert severity="warning">{t('usersPage.adminOnly')}</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={t('usersPage.title')}
      secondary={
        <Button variant="contained" onClick={openCreate}>
          {t('usersPage.createUser')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <TableContainer sx={{ width: '100%', overflowX: 'auto', '& td, & th': { whiteSpace: 'nowrap' } }}>
          <Table>
            <TableHead>
              <TableRow>
                <GreekTableHeadCell>{t('usersPage.table.action')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.email')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.role')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.language')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.timeZone')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.emailConfirmed')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.created')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('usersPage.table.lastLogin')}</GreekTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">
                      {t('usersPage.loading')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">
                      {t('usersPage.noUsers')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => openView(user.id)}>
                          {t('usersPage.view')}
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => openEdit(user)}>
                          {t('usersPage.edit')}
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{getPreferredLanguageLabel(user.preferredLanguage)}</TableCell>
                    <TableCell>{getTimeZoneLabel(user.timeZone, timeZoneOptions)}</TableCell>
                    <TableCell>{user.emailConfirmed ? t('usersPage.yes') : t('usersPage.no')}</TableCell>
                    <TableCell>{formatDate(user.createdAtUtc, defaultTimeZone)}</TableCell>
                    <TableCell>{formatDate(user.lastLoginAtUtc, defaultTimeZone)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Dialog open={isCreateOpen} onClose={closeCreate} fullWidth maxWidth="sm">
        <DialogTitle>{t('usersPage.createDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('usersPage.createDialog.emailLabel')}
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, email: event.target.value }))}
              required
              autoFocus
              error={Boolean(createForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim()))}
              helperText={createForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim()) ? t('usersPage.errors.invalidEmail') : ''}
            />
            <TextField
              label={t('usersPage.createDialog.passwordLabel')}
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, password: event.target.value }))}
              required
            />
            <TextField
              label={t('usersPage.createDialog.roleLabel')}
              select
              value={createForm.role}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, role: event.target.value }))}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('usersPage.createDialog.preferredLanguageLabel')}
              select
              value={createForm.preferredLanguage}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, preferredLanguage: event.target.value }))}
            >
              {preferredLanguageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              options={timeZoneOptions}
              value={timeZoneOptions.find((option) => option.value === createForm.timeZone) || null}
              onChange={(_, newValue) => setCreateForm((previous) => ({ ...previous, timeZone: newValue?.value || defaultTimeZone }))}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={(params) => <TextField {...params} label={t('usersPage.createDialog.timeZoneLabel')} />}
              fullWidth
              autoHighlight
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreate}>{t('usersPage.createDialog.cancel')}</Button>
          <Button variant="contained" onClick={createUser}>
            {t('usersPage.createDialog.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>{t('usersPage.editDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('usersPage.editDialog.emailLabel')}
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm((previous) => ({ ...previous, email: event.target.value }))}
              required
              autoFocus
              error={Boolean(editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim()))}
              helperText={editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim()) ? t('usersPage.errors.invalidEmail') : ''}
            />
            <TextField
              label={t('usersPage.editDialog.roleLabel')}
              select
              value={editForm.role}
              onChange={(event) => setEditForm((previous) => ({ ...previous, role: event.target.value }))}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('usersPage.editDialog.preferredLanguageLabel')}
              select
              value={editForm.preferredLanguage}
              onChange={(event) => setEditForm((previous) => ({ ...previous, preferredLanguage: event.target.value }))}
            >
              {preferredLanguageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              options={timeZoneOptions}
              value={timeZoneOptions.find((option) => option.value === editForm.timeZone) || null}
              onChange={(_, newValue) => setEditForm((previous) => ({ ...previous, timeZone: newValue?.value || defaultTimeZone }))}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={(params) => <TextField {...params} label={t('usersPage.editDialog.timeZoneLabel')} />}
              fullWidth
              autoHighlight
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(editForm.emailConfirmed)}
                  onChange={(event) => setEditForm((previous) => ({ ...previous, emailConfirmed: event.target.checked }))}
                />
              }
              label={t('usersPage.editDialog.emailConfirmedLabel')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>{t('usersPage.editDialog.cancel')}</Button>
          <Button variant="contained" onClick={updateUser}>
            {t('usersPage.editDialog.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isViewOpen} onClose={closeView} fullWidth maxWidth="sm">
        <DialogTitle>{t('usersPage.viewDialog.title')}</DialogTitle>
        <DialogContent>
          {viewUser ? (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.email')}:</strong> {viewUser.email}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.role')}:</strong> {viewUser.role}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.preferredLanguage')}:</strong> {getPreferredLanguageLabel(viewUser.preferredLanguage)}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.timeZone')}:</strong> {getTimeZoneLabel(viewUser.timeZone, timeZoneOptions)}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.emailConfirmed')}:</strong> {viewUser.emailConfirmed ? t('usersPage.yes') : t('usersPage.no')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.created')}:</strong> {formatDate(viewUser.createdAtUtc, defaultTimeZone)}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.lastLogin')}:</strong> {formatDate(viewUser.lastLoginAtUtc, defaultTimeZone)}
              </Typography>
              <Typography variant="body2">
                <strong>{t('usersPage.viewDialog.userId')}:</strong> {viewUser.id}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('usersPage.viewDialog.loadingDetails')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box>
            <Button onClick={closeView}>{t('usersPage.viewDialog.close')}</Button>
          </Box>
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
