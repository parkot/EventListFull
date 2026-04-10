// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}
    >
      <Typography variant="caption">
        &copy; {t('footer.rightsReserved')}{' '}
        <Link href="https://codedthemes.com/" target="_blank" underline="hover">
          CodedThemes
        </Link>
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="https://codedthemes.com/hire-us/" target="_blank" variant="caption" color="text.primary">
          {t('footer.hireUs')}
        </Link>
        <Link href="https://mui.com/store/license/" target="_blank" variant="caption" color="text.primary">
          {t('footer.license')}
        </Link>
        <Link href="https://mui.com/store/terms/" target="_blank" variant="caption" color="text.primary">
          {t('footer.terms')}
        </Link>
        <Link href="https://links.codedthemes.com/dAAOP" target="_blank" variant="caption" color="text.primary">
          {t('footer.figmaDesignSystem')}
        </Link>
      </Stack>
    </Stack>
  );
}
