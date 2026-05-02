const TONOS_OR_PERISPOMENI = /[\u0300\u0301\u0342]/g;

export function toGreekUppercaseNoTonos(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const withoutAccentMarks = value.normalize('NFD').replace(TONOS_OR_PERISPOMENI, '').normalize('NFC');

  return withoutAccentMarks.toLocaleUpperCase('el-GR');
}
