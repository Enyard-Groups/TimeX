import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

const SignPad = ({ fieldName, name, formData, setFormData, mode }) => {
  const sigRef = useRef();

  const handleClear = () => {
    sigRef.current.clear();
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleSave = () => {
    if (!sigRef.current.isEmpty()) {
      const dataURL = sigRef.current.toDataURL();
      setFormData((prev) => ({ ...prev, [fieldName]: dataURL }));
    }
  };

  return (
    <div className="mt-2">
      {/* View mode — show saved signature only */}
      {mode === "view" ? (
        formData[fieldName] ? (
          <img
            src={formData[fieldName]}
            alt="signature"
            className="w-[230px] h-[150px] border mt-2"
          />
        ) : formData[name] ? (
          <img
            src={URL.createObjectURL(formData[name])}
            alt="uploaded"
            className="w-[230px] h-[150px] border mt-2"
          />
        ) : (
          <p className="text-sm text-gray-400 mt-2">No signature provided</p>
        )
      ) : (
        /* Edit/Add mode — show canvas or saved image */
        <>
          {formData[fieldName] ? (
            <img
              src={formData[fieldName]}
              alt="signature"
              className="w-[230px] h-[150px] border mt-2"
            />
          ) : formData[name] ? (
            <img
              src={URL.createObjectURL(formData[name])}
              alt="uploaded"
              className="w-[230px] h-[150px] border mt-2"
            />
          ) : (
            <div className="border border-gray-300 rounded-xl w-full max-w-[300px] h-[150px] mt-2">
              <SignatureCanvas
                penColor="black"
                canvasProps={{ width: "full", height: 150 }}
                ref={sigRef}
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-400 rounded-lg cursor-pointer transition-all duration-200 active:scale-95"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1e2d51] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SignPad;
