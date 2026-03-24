import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const SearchDropdown = ({
  label,
  name,
  value,
  displayValue,
  options = [],
  formData,
  setFormData,
  disabled,
  inputStyle,
  labelStyle,
  labelKey, // If options are objects, which key is the label
  valueKey, // If options are objects, which key is the value
  labelName, // The field in formData to store the selected label
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getLabel = (opt) => (labelKey ? opt[labelKey] : opt);
  const getValue = (opt) => (valueKey ? opt[valueKey] : opt);

  const filtered = options.filter((o) => {
    const l = getLabel(o);
    return l && l.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative">
      <label className={labelStyle}>{label}</label>

      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`${inputStyle} ${
          disabled ? "cursor-default" : "cursor-pointer"
        } flex items-center justify-between min-h-[40px]`}
      >
        <span className="truncate">{displayValue || value || "Select"}</span>
        {!disabled &&
          (open ? (
            <MdKeyboardArrowUp className="text-xl shrink-0" />
          ) : (
            <MdKeyboardArrowDown className="text-xl shrink-0" />
          ))}
      </div>

      {open && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-[100]">
          <input
            placeholder="Search.."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 border-b border-gray-300 outline-none"
          />

          <div
            className="max-h-48 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {filtered.length > 0 ? (
              filtered.map((o, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const val = getValue(o);
                    const lbl = getLabel(o);
                    // Update both the ID and name fields if needed, 
                    // or just set the ID. Here we set the 'name' field in formData
                    setFormData({ 
                      ...formData, 
                      [name]: val,
                      // Optionally set a separate field for the label to avoid re-fetching
                      [labelName || `${name}_name`]: lbl 
                    });
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {getLabel(o)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-400 italic">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
