'use client';

import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { useSearchParams } from 'next/navigation';

type Initiative = {
  code: string;
  name: string;
  groupby?: string;
  [k: string]: any;
};

type Props = {
  limitTags?: number;
  _selected?: Initiative[];
  initiatives: Initiative[];
  groupby?: boolean;
  onChange?: (val: Initiative[]) => void;
  label?: string;
  placeholder?: string;
};

export default function SectorFilter({
  limitTags = 2,
  _selected = [],
  initiatives = [],
  groupby = true,
  onChange,
  label = 'Select Label',
  placeholder = 'Select Placeholder',
}: Props) {
  const [selected, setSelected] = React.useState<Initiative[]>(_selected);

  // Build options with safe firstLetter/grouping
  const options = React.useMemo(() => {
    return (initiatives || []).map((option) => {
      const base = groupby ? option.groupby ?? option.name ?? '' : option.name ?? '';
      const firstLetterRaw = (base[0] || '').toUpperCase();
      const firstLetter = /[0-9]/.test(firstLetterRaw) ? '0-9' : (firstLetterRaw || '#');
      return { firstLetter, ...option };
    });
  }, [initiatives, groupby]);

  // Keep a quick lookup by code
  const byCode = React.useMemo(() => {
    const m = new Map<string, Initiative>();
    options.forEach((o) => m.set(o.code, o));
    return m;
  }, [options]);

  const handleChange = (_event: any, newValue: Initiative[]) => {
    // Autocomplete (multiple) always hands the full array
    const seen = new Map<string, Initiative>();
    newValue.forEach((v) => seen.set(v.code ?? JSON.stringify(v), v));
    const updated = Array.from(seen.values());
    setSelected(updated);
    onChange?.(updated);
  };

  // ---- URL query handling (code=XYZ) ----
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  React.useEffect(() => {
    // Only auto-select for a specific label (your original logic)
    if (!code || label !== 'National OKR') return;

    // Prefer the option from the options list to keep reference identity
    const opt = byCode.get(code) ?? {
      // fallback object (if not present in options)
      code,
      name: `${code}`, // avoid code?.name which is undefined
      groupby: code[0]?.toUpperCase() ?? '',
      firstLetter: (code[0]?.toUpperCase() ?? '#').match(/[0-9]/) ? '0-9' : (code[0]?.toUpperCase() ?? '#'),
    };

    setSelected((prev) => {
      const exists = prev.some((v) => v.code === opt.code);
      if (exists) return prev;
      const updated = [...prev, opt];
      onChange?.(updated);
      return updated;
    });
  }, [code, label, byCode, onChange]);

  return (
    <Autocomplete
      multiple
      limitTags={limitTags}
      id="sector-filter"
      options={[...options].sort((a, b) =>
        groupby
          ? -(a.groupby ?? '').localeCompare(b.groupby ?? '')
          : -(a.firstLetter ?? '').localeCompare(b.firstLetter ?? '')
      )}
      groupBy={(option) => (groupby ? option.groupby ?? '' : option.firstLetter ?? '')}
      getOptionLabel={(option) => option.name ?? option.code ?? ''}
      // 👇 CRITICAL: define equality by code, not object identity
      isOptionEqualToValue={(opt, val) => opt.code === val.code}
      filterSelectedOptions
      value={selected}
      onChange={handleChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={option.code} {...getTagProps({ index })} key={option.code} />
        ))
      }
      renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
    />
  );
}
