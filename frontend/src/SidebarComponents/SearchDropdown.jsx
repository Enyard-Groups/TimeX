import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const SearchDropdown = ({
  label,
  name,
  value,
  options,
  formData,
  setFormData,
  disabled,
  inputStyle,
  labelStyle,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      <label className={labelStyle}>{label}</label>

      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`${inputStyle} cursor-pointer flex items-center justify-between`}
      >
        {value || "Select"}
        {open ? (
          <MdKeyboardArrowUp className="text-xl" />
        ) : (
          <MdKeyboardArrowDown className="text-xl" />
        )}
      </div>

      {open && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-50">
          <input
            placeholder="Search.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 border-b border-gray-300 outline-none"
          />

          <div className="max-h-40 overflow-y-auto">
            {options
              .filter((o) => o.toLowerCase().includes(search.toLowerCase()))
              .map((o, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setFormData({ ...formData, [name]: o });
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {o}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
