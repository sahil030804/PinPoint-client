function getNestedValue(obj, path) {
  const keys = path.split('.');
  let val = obj;
  for (const key of keys) {
    if (val == null) return undefined;
    val = val[key];
  }
  return val;
}

export function calculateColumnWidths(items, columns) {
  const CHAR_W = 7.5;
  const PAD = 28;

  return columns.map(col => {
    if (col.fixedWidth) return { ...col, width: col.fixedWidth };
    if (col.flex) return col;

    let maxLen = col.header.length;
    for (const item of items) {
      let text = '';
      if (col.measureFn) {
        text = col.measureFn(item);
      } else {
        const val = getNestedValue(item, col.key);
        text = val != null ? String(val) : '';
      }
      maxLen = Math.max(maxLen, text.length);
    }

    const width = Math.ceil(maxLen * CHAR_W + PAD);
    return { ...col, width: `${Math.min(Math.max(width, 60), 350)}px` };
  });
}
