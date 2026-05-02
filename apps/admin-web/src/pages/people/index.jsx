import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import GreekTableHeadCell from 'components/GreekTableHeadCell';
import MainCard from 'components/MainCard';
import { apiRequest, getApiBaseUrl } from 'utils/api';
import { getAuthSession, updateAuthSession } from 'utils/auth';
import { useTranslation } from 'react-i18next';

function normalizeAvailability(value) {
  if (value === undefined || value === null) {
    return 'Not set';
  }

  const text = String(value).trim();
  return text || 'Not set';
}

function toExcelRows(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
}

function getExcelValue(row, candidates) {
  for (const candidate of candidates) {
    if (row[candidate] !== undefined && row[candidate] !== null && String(row[candidate]).trim() !== '') {
      return String(row[candidate]).trim();
    }
  }

  return '';
}

function formatUtcDate(value, timeZone) {
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

function resolveUserTimeZone(value, fallback) {
  if (value && String(value).trim()) {
    return String(value).trim();
  }

  return fallback;
}

export default function PeoplePage() {
  const fallbackTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
  const { t } = useTranslation();
  const [people, setPeople] = useState([]);
  const [archivedPeople, setArchivedPeople] = useState([]);
  const [activeView, setActiveView] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    availability: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userTimeZone, setUserTimeZone] = useState(() => resolveUserTimeZone(getAuthSession()?.user?.timeZone, fallbackTimeZone));
  const fileInputRef = useRef(null);

  const apiUnavailableMessage = useMemo(
    () => t('peoplePage.errors.backendUnavailable', { baseUrl: getApiBaseUrl() }),
    [t]
  );

  useEffect(() => {
    let isMounted = true;

    const loadUserSettings = async () => {
      try {
        const response = await apiRequest('/api/users/me');
        if (!response.ok) {
          return;
        }

        const user = await response.json();
        const nextTimeZone = resolveUserTimeZone(user?.timeZone, fallbackTimeZone);

        if (isMounted) {
          setUserTimeZone(nextTimeZone);
        }

        updateAuthSession({
          user: {
            ...getAuthSession()?.user,
            ...user,
            timeZone: nextTimeZone
          }
        });
      } catch {
        // Keep fallback/session timezone when profile fetch fails.
      }
    };

    loadUserSettings();

    return () => {
      isMounted = false;
    };
  }, [fallbackTimeZone]);

  const loadPeople = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await apiRequest('/api/people/');

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('peoplePage.errors.load')));
      }

      const data = await response.json();
      setPeople(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('peoplePage.errors.load'), apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage]);

  const loadArchivedPeople = useCallback(async () => {
    try {
      const response = await apiRequest('/api/people/archived');

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('peoplePage.errors.loadArchived')));
      }

      const data = await response.json();
      setArchivedPeople(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('peoplePage.errors.loadArchived'), apiUnavailableMessage));
    }
  }, [apiUnavailableMessage]);

  const reloadPeopleLists = useCallback(async () => {
    await loadPeople();
    await loadArchivedPeople();
  }, [loadArchivedPeople, loadPeople]);

  useEffect(() => {
    reloadPeopleLists();
  }, [reloadPeopleLists]);

  const canCreate = useMemo(() => {
    return createForm.fullName.trim() !== '' && createForm.email.trim() !== '';
  }, [createForm.email, createForm.fullName]);

  const openCreateDialog = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditingPersonId(null);
    setCreateForm({ fullName: '', email: '', phone: '', availability: '' });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (person) => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditingPersonId(person.id);
    setCreateForm({
      fullName: person.fullName || '',
      email: person.email || '',
      phone: person.phoneNumber || '',
      availability: person.availability === 'Not set' ? '' : person.availability || ''
    });
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingPersonId(null);
    setCreateForm({ fullName: '', email: '', phone: '', availability: '' });
  };

  const handleDeletePerson = async (person) => {
    setErrorMessage('');
    setSuccessMessage('');

    const shouldDelete = window.confirm(t('peoplePage.confirmArchive', { name: person.fullName }));
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await apiRequest(`/api/people/${person.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('peoplePage.errors.archive')));
      }

      await reloadPeopleLists();
      setSuccessMessage(t('peoplePage.success.archived'));
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('peoplePage.errors.archive'), apiUnavailableMessage));
    }
  };

  const handleRestorePerson = async (person) => {
    setErrorMessage('');
    setSuccessMessage('');

    const shouldRestore = window.confirm(t('peoplePage.confirmRestore', { name: person.fullName }));
    if (!shouldRestore) {
      return;
    }

    try {
      const response = await apiRequest(`/api/people/${person.id}/restore`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, t('peoplePage.errors.restore')));
      }

      await reloadPeopleLists();
      setSuccessMessage(t('peoplePage.success.restored'));
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, t('peoplePage.errors.restore'), apiUnavailableMessage));
    }
  };

  const handleSavePerson = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const fullName = createForm.fullName.trim();
    const email = createForm.email.trim();

    if (!fullName || !email) {
      setErrorMessage(t('peoplePage.errors.fullNameEmailRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('peoplePage.errors.invalidEmail'));
      return;
    }

    try {
      const payload = {
        fullName,
        email,
        phoneNumber: createForm.phone.trim(),
        availability: normalizeAvailability(createForm.availability)
      };

      const response = await apiRequest(editingPersonId ? `/api/people/${editingPersonId}` : '/api/people/', {
        method: editingPersonId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, editingPersonId ? t('peoplePage.errors.update') : t('peoplePage.errors.create')));
      }

      await reloadPeopleLists();
      setSuccessMessage(editingPersonId ? t('peoplePage.success.updated') : t('peoplePage.success.created'));
      closeCreateDialog();
    } catch (error) {
      setErrorMessage(
        toFriendlyRequestError(error, editingPersonId ? t('peoplePage.errors.update') : t('peoplePage.errors.create'), apiUnavailableMessage)
      );
    }
  };

  const triggerImport = () => {
    setErrorMessage('');
    setSuccessMessage('');
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      const excelRows = toExcelRows(fileBuffer);

      if (excelRows.length === 0) {
        setErrorMessage(t('peoplePage.errors.emptyFile'));
        return;
      }

      let importedCount = 0;
      let updatedCount = 0;

      for (const row of excelRows) {
        const fullName = getExcelValue(row, ['Full Name', 'Name', 'fullName', 'name']);
        const email = getExcelValue(row, ['Email', 'email']);
        const phone = getExcelValue(row, ['Phone', 'phone', 'Phone Number', 'phoneNumber']);
        const availability = getExcelValue(row, ['Availability', 'availability', 'Available', 'available']);

        if (!email && !fullName) {
          continue;
        }

        const existingPerson = people.find((person) => {
          if (email) {
            return person.email.toLowerCase() === email.toLowerCase();
          }

          return person.fullName.toLowerCase() === fullName.toLowerCase();
        });

        const payload = {
          fullName: fullName || existingPerson?.fullName || 'Unnamed',
          email: email || existingPerson?.email || `${crypto.randomUUID()}@unknown.local`,
          phoneNumber: phone || existingPerson?.phoneNumber || '',
          availability: normalizeAvailability(availability || existingPerson?.availability)
        };

        const response = await apiRequest(existingPerson ? `/api/people/${existingPerson.id}` : '/api/people/', {
          method: existingPerson ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(await getErrorMessageFromResponse(response, t('peoplePage.errors.importApiError')));
        }

        if (existingPerson) {
          updatedCount += 1;
        } else {
          importedCount += 1;
        }
      }

      await reloadPeopleLists();

      setSuccessMessage(t('peoplePage.success.importComplete', { added: importedCount, updated: updatedCount }));
    } catch (error) {
      setErrorMessage(
        toFriendlyRequestError(error, t('peoplePage.errors.importFailed'), apiUnavailableMessage)
      );
    } finally {
      event.target.value = '';
    }
  };

  const shownPeople = activeView === 'archived' ? archivedPeople : people;
  const isArchivedView = activeView === 'archived';
  const tableColumnCount = isArchivedView ? 6 : 5;

  return (
    <MainCard
      title={t('peoplePage.title')}
      secondary={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={triggerImport}>
            {t('peoplePage.importAvailability')}
          </Button>
          <Button variant="contained" onClick={openCreateDialog}>
            {t('peoplePage.createPerson')}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Stack direction="row" spacing={1}>
          <Button variant={activeView === 'active' ? 'contained' : 'outlined'} onClick={() => setActiveView('active')}>
            {t('peoplePage.active')} ({people.length})
          </Button>
          <Button variant={activeView === 'archived' ? 'contained' : 'outlined'} onClick={() => setActiveView('archived')}>
            {t('peoplePage.archived')} ({archivedPeople.length})
          </Button>
        </Stack>

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
                <GreekTableHeadCell>{t('peoplePage.table.action')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('peoplePage.table.fullName')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('peoplePage.table.email')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('peoplePage.table.phone')}</GreekTableHeadCell>
                <GreekTableHeadCell>{t('peoplePage.table.availability')}</GreekTableHeadCell>
                {isArchivedView && <GreekTableHeadCell>{t('peoplePage.table.archivedAt')}</GreekTableHeadCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={tableColumnCount}>
                    <Typography variant="body2" color="text.secondary">
                      {t('peoplePage.loading', { view: activeView })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : shownPeople.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColumnCount}>
                    <Typography variant="body2" color="text.secondary">
                      {activeView === 'archived'
                        ? t('peoplePage.noArchivedPeople')
                        : t('peoplePage.noPeople')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                shownPeople.map((person) => (
                  <TableRow key={person.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {activeView === 'archived' ? (
                          <Button size="small" color="success" variant="outlined" onClick={() => handleRestorePerson(person)}>
                            {t('peoplePage.restore')}
                          </Button>
                        ) : (
                          <>
                            <Button size="small" variant="outlined" onClick={() => openEditDialog(person)}>
                              {t('peoplePage.edit')}
                            </Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => handleDeletePerson(person)}>
                              {t('peoplePage.archive')}
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{person.fullName}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{person.phoneNumber || '-'}</TableCell>
                    <TableCell>{normalizeAvailability(person.availability)}</TableCell>
                    {isArchivedView && <TableCell>{formatUtcDate(person.archivedAtUtc, userTimeZone)}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />

      <Dialog open={isCreateDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingPersonId ? t('peoplePage.dialog.editTitle') : t('peoplePage.dialog.createTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('peoplePage.dialog.fullNameLabel')}
              value={createForm.fullName}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, fullName: event.target.value }))}
              required
              autoFocus
            />
            <TextField
              label={t('peoplePage.dialog.emailLabel')}
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, email: event.target.value }))}
              required
              error={Boolean(createForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim()))}
              helperText={createForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim()) ? t('peoplePage.errors.invalidEmail') : ''}
            />
            <TextField
              label={t('peoplePage.dialog.phoneLabel')}
              value={createForm.phone}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, phone: event.target.value }))}
            />
            <TextField
              label={t('peoplePage.dialog.availabilityLabel')}
              value={createForm.availability}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, availability: event.target.value }))}
              placeholder={t('peoplePage.dialog.availabilityPlaceholder')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>{t('peoplePage.dialog.cancel')}</Button>
          <Box>
            <Button onClick={handleSavePerson} variant="contained" disabled={!canCreate}>
              {editingPersonId ? t('peoplePage.dialog.save') : t('peoplePage.dialog.create')}
            </Button>
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

  if (message.toLowerCase().includes('failed to fetch')) {
    return unreachableMessage;
  }

  return message || fallback;
}
