import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const SearchDropdown = ({
  label,
  name,
  value = [],
  displayValue,
  options = [],
  formData,
  setFormData,
  disabled,
  inputStyle,
  labelStyle,
  labelKey,
  valueKey,
  labelName,
  multiple = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getLabel = (opt) => (labelKey ? opt[labelKey] : opt);
  const getValue = (opt) => (valueKey ? opt[valueKey] : opt);

  const filtered = options.filter((o) => {
    const l = getLabel(o);
    return l && l.toLowerCase().includes(search.toLowerCase());
  });

  //  MULTI + SINGLE HANDLER
  const handleSelect = (val, lbl) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const currentLabels = Array.isArray(formData[labelName || `${name}_name`])
        ? formData[labelName || `${name}_name`]
        : [];

      let updatedValues;
      let updatedLabels;

      if (currentValues.includes(val)) {
        // remove
        updatedValues = currentValues.filter((v) => v !== val);
        updatedLabels = currentLabels.filter((l) => l !== lbl);
      } else {
        // add
        updatedValues = [...currentValues, val];
        updatedLabels = [...currentLabels, lbl];
      }

      setFormData({
        ...formData,
        [name]: updatedValues,
        [labelName || `${name}_name`]: updatedLabels,
      });
    } else {
      setFormData({
        ...formData,
        [name]: val,
        [labelName || `${name}_name`]: lbl,
      });
      setOpen(false);
    }
  };

  const isSelected = (val) => {
    return multiple
      ? Array.isArray(value) && value.includes(val)
      : value === val;
  };

  return (
    <div className="relative">
      <label className={labelStyle}>{label}</label>

      {/* Input */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`${inputStyle} ${
          disabled ? "cursor-default" : "cursor-pointer"
        } flex items-center justify-between min-h-[40px]`}
      >
        <span className="truncate">
          {multiple
            ? Array.isArray(formData[labelName || `${name}_name`]) &&
              formData[labelName || `${name}_name`].length > 0
              ? formData[labelName || `${name}_name`].join(", ")
              : "Select"
            : displayValue || value || "Select"}
        </span>

        {!disabled &&
          (open ? (
            <MdKeyboardArrowUp className="text-xl shrink-0" />
          ) : (
            <MdKeyboardArrowDown className="text-xl shrink-0" />
          ))}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-[100]">
          {/* Search */}
          <input
            placeholder="Search.."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 border-b border-gray-300 outline-none"
          />

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((o, i) => {
                const val = getValue(o);
                const lbl = getLabel(o);

                return (
                  <div
                    key={i}
                    onClick={() => handleSelect(val, lbl)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected(val)}
                        readOnly
                      />
                    )}
                    <span>{lbl}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-400 italic">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
