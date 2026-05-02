import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';

import { toGreekUppercaseNoTonos } from 'utils/greekText';

function normalizeHeaderContent(content) {
  if (typeof content === 'string') {
    return toGreekUppercaseNoTonos(content);
  }

  return content;
}

export default function GreekTableHeadCell({ children, ...props }) {
  return <TableCell {...props}>{normalizeHeaderContent(children)}</TableCell>;
}

GreekTableHeadCell.propTypes = {
  children: PropTypes.node
};
