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
    return l && typeof l === 'string' && l.toLowerCase().includes(search.toLowerCase());
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
      const updatedFormData = {
        ...formData,
        [name]: labelName === name ? lbl : val,
      };

      if (labelName && labelName !== name) {
        updatedFormData[labelName] = lbl;
      }

      if (valueKey && labelName === name) {
        updatedFormData[`${name}_id`] = val;
      }

      setFormData(updatedFormData);
      setOpen(false);
    }
  };

  const isSelected = (val) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(val);
    }

    if (labelName === name && valueKey) {
      return formData[`${name}_id`] === val;
    }

    return value === val;
  };

  return (
    <div className="relative">
      <label className={labelStyle}>{label}</label>

      {/* Input */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`${inputStyle} ${
          disabled
            ? "cursor-not-allowed opacity-60 bg-gray-100 border-gray-200 text-gray-500 hover:border-gray-200"
            : "cursor-pointer border-2 hover:border-blue-500/60"
        } flex items-center justify-between min-h-[40px] transition-all`}
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
            <MdKeyboardArrowUp className="text-xl shrink-0 text-gray-500" />
          ) : (
            <MdKeyboardArrowDown className="text-xl shrink-0 text-gray-500" />
          ))}
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute w-full bg-white border-2 border-gray-300 rounded-lg mt-2 shadow-xl z-[100]">
          {/* Search */}
          <input
            placeholder="Search.."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border-b-2 border-gray-200 outline-none focus:ring-1 focus:ring-gray-400 focus:bg-gray-50 text-gray-900 placeholder-gray-400 font-medium transition-all"
          />

          {/* Options */}
          <div
            className="max-h-48 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {filtered.length > 0 ? (
              filtered.map((o, i) => {
                const val = getValue(o);
                const lbl = getLabel(o);

                return (
                  <div
                    key={i}
                    onClick={() => handleSelect(val, lbl)}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-3 transition-all border-b border-gray-50/50 last:border-b-0 ${
                      isSelected(val)
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected(val)}
                        readOnly
                        className="w-4 h-4 accent-gray-500 cursor-pointer"
                      />
                    )}
                    <span className="font-medium">{lbl}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4 text-gray-400 italic text-center">
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
