// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// project imports
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';
import LanguageSwitcher from './LanguageSwitcher';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}
      {!downLG && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<CalendarOutlined />}
          onClick={() => navigate('/events/wizard')}
          sx={{ ml: 1, whiteSpace: 'nowrap' }}
        >
          {t('header.wizard')}
        </Button>
      )}
      {!downLG && <LanguageSwitcher />}

      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
