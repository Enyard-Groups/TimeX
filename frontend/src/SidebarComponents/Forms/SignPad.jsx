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
    <div className="mt-2 ">
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
        <div className="border w-[230px] h-[150px] mt-2">
          <SignatureCanvas
            penColor="black"
            canvasProps={{ width: 230, height: 150 }}
            ref={sigRef}
          />
        </div>
      )}
      {mode !== "view" && (
        <div className="flex gap-2 mt-2">
          {" "}
          <button onClick={handleClear} className="border px-2 py-1 rounded">
            {" "}
            Clear{" "}
          </button>{" "}
          <button
            onClick={handleSave}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            {" "}
            Save{" "}
          </button>{" "}
        </div>
      )}
    </div>
  );
};
export default SignPad;
