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
import MainCard from 'components/MainCard';
import { apiRequest, getApiBaseUrl } from 'utils/api';
import { getAuthSession, updateAuthSession } from 'utils/auth';

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
    () => `Cannot reach backend API at ${getApiBaseUrl()}. Start API with: dotnet run --project src/Backend/EventList.Api`,
    []
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
        throw new Error(await getErrorMessageFromResponse(response, 'Unable to load people right now.'));
      }

      const data = await response.json();
      setPeople(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, 'Unable to load people right now.', apiUnavailableMessage));
    } finally {
      setIsLoading(false);
    }
  }, [apiUnavailableMessage]);

  const loadArchivedPeople = useCallback(async () => {
    try {
      const response = await apiRequest('/api/people/archived');

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, 'Unable to load archived people right now.'));
      }

      const data = await response.json();
      setArchivedPeople(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, 'Unable to load archived people right now.', apiUnavailableMessage));
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

    const shouldDelete = window.confirm(`Archive ${person.fullName}?`);
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await apiRequest(`/api/people/${person.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, 'Failed to archive person.'));
      }

      await reloadPeopleLists();
      setSuccessMessage('Person archived successfully.');
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, 'Failed to archive person.', apiUnavailableMessage));
    }
  };

  const handleRestorePerson = async (person) => {
    setErrorMessage('');
    setSuccessMessage('');

    const shouldRestore = window.confirm(`Restore ${person.fullName}?`);
    if (!shouldRestore) {
      return;
    }

    try {
      const response = await apiRequest(`/api/people/${person.id}/restore`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(await getErrorMessageFromResponse(response, 'Failed to restore person.'));
      }

      await reloadPeopleLists();
      setSuccessMessage('Person restored successfully.');
    } catch (error) {
      setErrorMessage(toFriendlyRequestError(error, 'Failed to restore person.', apiUnavailableMessage));
    }
  };

  const handleSavePerson = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const fullName = createForm.fullName.trim();
    const email = createForm.email.trim();

    if (!fullName || !email) {
      setErrorMessage('Full name and email are required.');
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
        throw new Error(await getErrorMessageFromResponse(response, editingPersonId ? 'Failed to update person.' : 'Failed to create person.'));
      }

      await reloadPeopleLists();
      setSuccessMessage(editingPersonId ? 'Person updated successfully.' : 'Person created successfully.');
      closeCreateDialog();
    } catch (error) {
      setErrorMessage(
        toFriendlyRequestError(error, editingPersonId ? 'Failed to update person.' : 'Failed to create person.', apiUnavailableMessage)
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
        setErrorMessage('The selected Excel file is empty.');
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
          throw new Error(await getErrorMessageFromResponse(response, 'Failed to import people from Excel.'));
        }

        if (existingPerson) {
          updatedCount += 1;
        } else {
          importedCount += 1;
        }
      }

      await reloadPeopleLists();

      setSuccessMessage(`Excel import complete. Added ${importedCount}, updated ${updatedCount}.`);
    } catch (error) {
      setErrorMessage(
        toFriendlyRequestError(error, 'Could not import this file. Please upload a valid .xlsx or .xls file.', apiUnavailableMessage)
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
      title="People"
      secondary={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={triggerImport}>
            Import Availability (Excel)
          </Button>
          <Button variant="contained" onClick={openCreateDialog}>
            Create Person
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Stack direction="row" spacing={1}>
          <Button variant={activeView === 'active' ? 'contained' : 'outlined'} onClick={() => setActiveView('active')}>
            Active ({people.length})
          </Button>
          <Button variant={activeView === 'archived' ? 'contained' : 'outlined'} onClick={() => setActiveView('archived')}>
            Archived ({archivedPeople.length})
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
                <TableCell>Action</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Availability</TableCell>
                {isArchivedView && <TableCell>Archived At</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={tableColumnCount}>
                    <Typography variant="body2" color="text.secondary">
                      Loading {activeView} people...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : shownPeople.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColumnCount}>
                    <Typography variant="body2" color="text.secondary">
                      {activeView === 'archived'
                        ? 'No archived people yet.'
                        : 'No people yet. Create one person or import availability from an Excel file.'}
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
                            Restore
                          </Button>
                        ) : (
                          <>
                            <Button size="small" variant="outlined" onClick={() => openEditDialog(person)}>
                              Edit
                            </Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => handleDeletePerson(person)}>
                              Archive
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
        <DialogTitle>{editingPersonId ? 'Edit Person' : 'Create Person'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={createForm.fullName}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, fullName: event.target.value }))}
              required
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, email: event.target.value }))}
              required
            />
            <TextField
              label="Phone"
              value={createForm.phone}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, phone: event.target.value }))}
            />
            <TextField
              label="Availability"
              value={createForm.availability}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, availability: event.target.value }))}
              placeholder="Example: Mon-Fri 09:00-18:00"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>Cancel</Button>
          <Box>
            <Button onClick={handleSavePerson} variant="contained" disabled={!canCreate}>
              {editingPersonId ? 'Save' : 'Create'}
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
