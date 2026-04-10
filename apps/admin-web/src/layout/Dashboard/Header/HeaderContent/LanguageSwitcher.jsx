import { useTranslation } from 'react-i18next';

import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <FormControl size="small" sx={{ minWidth: 120, mx: 1 }}>
      <Select
        value={i18n.language}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        displayEmpty
        aria-label={t('language.label')}
        sx={{ bgcolor: 'grey.100' }}
      >
        <MenuItem value="en">{t('language.english')}</MenuItem>
        <MenuItem value="es">{t('language.spanish')}</MenuItem>
        <MenuItem value="el">{t('language.greek')}</MenuItem>
      </Select>
    </FormControl>
  );
}
