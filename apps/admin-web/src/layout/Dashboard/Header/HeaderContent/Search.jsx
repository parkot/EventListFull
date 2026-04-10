// material-ui
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';

import { useTranslation } from 'react-i18next';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

export default function Search() {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}>
      <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
        <OutlinedInput
          size="small"
          id="header-search"
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.5 }}>
              <SearchOutlined />
            </InputAdornment>
          }
          aria-describedby="header-search-text"
          slotProps={{ input: { 'aria-label': t('header.searchPlaceholder') } }}
          placeholder={t('header.searchPlaceholder')}
        />
      </FormControl>
    </Box>
  );
}
