import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { useSearchParams } from "next/navigation";

export default function SectorFilter({ limitTags = 2, _selected = [], initiatives, groupby = true, onChange, label = "Select Label", placeholder = "Select Placeholder" }) {
  const [selected, setSelected] = React.useState(_selected);

  const options = initiatives.map((option) => {
    const firstLetter = groupby
      ? option.groupby[0].toUpperCase()
      : option.name[0].toUpperCase();
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
      ...option,
    };
  });

  const handleChange = (_event, newValue) => {
    setSelected(prev => {
      // Helper to compare primitives/objects safely
      const keyOf = (v) =>
        v && typeof v === "object" ? JSON.stringify(v) : v;

      let updated;

      // Case A: Some components (e.g., MUI ToggleButtonGroup non-exclusive)
      // hand you the entire selection as an array.
      if (Array.isArray(newValue)) {
        // Dedupe while preserving original objects
        const seen = new Map();
        newValue.forEach(v => seen.set(keyOf(v), v));
        updated = Array.from(seen.values());
      } else {
        // Case B: We got a single value (clicked item)
        if (Array.isArray(prev)) {
          const k = keyOf(newValue);
          const exists = prev.some(v => keyOf(v) === k);
          updated = exists
            ? prev.filter(v => keyOf(v) !== k) // remove
            : [...prev, newValue];             // add
        } else {
          // Single-select mode: toggle to null if same value clicked
          updated = prev === newValue ? null : newValue;
        }
      }

      onChange?.(updated); // notify parent
      return updated;
    });
  };


  const searchParams = useSearchParams();
  const code = searchParams.get("code");


  React.useEffect(() => {
    if (code && label == "National OKR") {
      let newValue = [{ firstLetter: code[0].toUpperCase(), code: code, name: `${code}: ${code?.name}` }]
          setSelected(prev => {
      // Helper to compare primitives/objects safely
      const keyOf = (v) =>
        v && typeof v === "object" ? JSON.stringify(v) : v;

      let updated;

      // Case A: Some components (e.g., MUI ToggleButtonGroup non-exclusive)
      // hand you the entire selection as an array.
      if (Array.isArray(newValue)) {
        // Dedupe while preserving original objects
        const seen = new Map();
        newValue.forEach(v => seen.set(keyOf(v), v));
        updated = Array.from(seen.values());
      } else {
        // Case B: We got a single value (clicked item)
        if (Array.isArray(prev)) {
          const k = keyOf(newValue);
          const exists = prev.some(v => keyOf(v) === k);
          updated = exists
            ? prev.filter(v => keyOf(v) !== k) // remove
            : [...prev, newValue];             // add
        } else {
          // Single-select mode: toggle to null if same value clicked
          updated = prev === newValue ? null : newValue;
        }
      }

      onChange?.(updated); // notify parent
      return updated;
    });

    
    }
  }, [])

  return (
    <Autocomplete
      multiple
      limitTags={limitTags}
      id="sector-filter"
      options={options.sort((a, b) =>
        groupby
          ? -b.groupby.localeCompare(a.groupby)
          : -b.firstLetter.localeCompare(a.firstLetter)
      )}

      groupBy={(option) => (groupby ? option.groupby : option.firstLetter)}
      getOptionLabel={(option) => option.name}
      filterSelectedOptions
      value={selected}
      onChange={handleChange} // 👈 track selection + notify parent
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.code} // 👈 chip shows the code
            {...getTagProps({ index })}
            key={option.code}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
}
