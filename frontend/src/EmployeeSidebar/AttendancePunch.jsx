/* eslint-disable no-async-promise-executor */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRecord, fetchRecord, updateRecord } from "../action";

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const formatDate = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ── DEVICE DETECTION ──────────────────────────────────────────
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  return "desktop";
};

const StatusBadge = ({ status }) => {
  const colors = {
    Present: "background:#dcfce7;color:#166534;border:1px solid #bbf7d0",
    Late: "background:#fef9c3;color:#854d0e;border:1px solid #fde047",
    Absent: "background:#fee2e2;color:#991b1b;border:1px solid #fecaca",
    "Half Day": "background:#fef9c3;color:#854d0e;border:1px solid #fde047",
    "In Progress": "background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe",
    Missed: "background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff",
  };
  return (
    <span
      style={{
        ...Object.fromEntries(
          (colors[status] || colors.Present)
            .split(";")
            .map((s) => s.split(":")),
        ),
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

// Device badge shown in the table
const DeviceBadge = ({ device }) => {
  const styles = {
    mobile: { bg: "#eff6ff", color: "#1d4ed8", label: "Mobile" },
    desktop: { bg: "#eef2ff", color: "#4338ca", label: "Desktop" },
    biometric: { bg: "#f5f3ff", color: "#6d28d9", label: "Biometric" },
  };
  const s = styles[device] || styles.desktop;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

const PermissionModal = ({ type, onRetry, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "32px 28px",
        maxWidth: 380,
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: type === "camera" ? "#dbeafe" : "#fef3c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke={type === "camera" ? "#1e40af" : "#92400e"}
          strokeWidth="2"
        >
          {type === "camera" ? (
            <>
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          )}
        </svg>
      </div>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 17,
          fontWeight: 700,
          color: "#111",
        }}
      >
        {type === "camera" ? "Camera Access Needed" : "Location Access Needed"}
      </h3>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 14,
          color: "#6b7280",
          lineHeight: 1.6,
        }}
      >
        {type === "camera"
          ? "A photo is captured at punch in/out for attendance verification. Please allow camera access in your browser settings."
          : "Your location coordinates are recorded with each punch. Please allow location access in your browser settings."}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onRetry}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "#1e40af",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "#f3f4f6",
            color: "#374151",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  </div>
);

const CameraModal = ({
  videoRef,
  preview,
  onCapture,
  onRetake,
  onConfirm,
  onCancel,
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.78)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        background: "#18181b",
        borderRadius: 20,
        padding: 24,
        width: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#e4e4e7",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          {preview ? "Preview" : "Take Photo"}
        </span>
        <button
          onClick={onCancel}
          style={{
            background: "#3f3f46",
            border: "none",
            borderRadius: 8,
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div
        style={{
          position: "relative",
          width: 272,
          height: 204,
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
          border: "2px solid #3f3f46",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: preview ? "none" : "block",
          }}
        />
        {preview && (
          <img
            src={preview}
            alt="snapshot"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
        {!preview &&
          [
            {
              top: 8,
              left: 8,
              borderTop: "2px solid #60a5fa",
              borderLeft: "2px solid #60a5fa",
            },
            {
              top: 8,
              right: 8,
              borderTop: "2px solid #60a5fa",
              borderRight: "2px solid #60a5fa",
            },
            {
              bottom: 8,
              left: 8,
              borderBottom: "2px solid #60a5fa",
              borderLeft: "2px solid #60a5fa",
            },
            {
              bottom: 8,
              right: 8,
              borderBottom: "2px solid #60a5fa",
              borderRight: "2px solid #60a5fa",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 18,
                height: 18,
                borderRadius: 2,
                ...s,
              }}
            />
          ))}
        {preview && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(16,185,129,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "#71717a",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {preview
          ? "Happy with the photo? Confirm to proceed."
          : "Position your face in the frame, then tap Capture."}
      </p>

      {!preview ? (
        <button
          onClick={onCapture}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M20 7h-3l-2-2H9L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          </svg>
          Capture
        </button>
      ) : (
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={onRetake}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "#3f3f46",
              color: "#e4e4e7",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#52525b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3f3f46")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Retake
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Use Photo
          </button>
        </div>
      )}
    </div>
  </div>
);

const AttendancePunch = ({ user }) => {
  const dispatch = useDispatch();
  const records = useSelector((state) => state.record);
  console.log(records);

  const filteredRecord = records.filter((r) => r.userID === user.id);

  const [loading, setLoading] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraResolve, setCameraResolve] = useState(null);
  const [cameraReject, setCameraReject] = useState(null);

  const [permissionModal, setPermissionModal] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  // ── PERSIST PUNCH STATE TO LOCALSTORAGE ───────────────────────
  const [isPunchedIn, setIsPunchedIn] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(`isPunchedIn_${user.id}`)) || false
      );
    } catch {
      return false;
    }
  });

  // Inside the todayRecord initializer, add a date check:
  const [todayRecord, setTodayRecord] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`todayRecord_${user.id}`));
      if (saved && saved.date !== formatDate(new Date())) {
        localStorage.removeItem(`todayRecord_${user.id}`);
        localStorage.removeItem(`isPunchedIn_${user.id}`);
        return null;
      }
      return saved || null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`isPunchedIn_${user.id}`, JSON.stringify(isPunchedIn));
  }, [isPunchedIn, user.id]);

  useEffect(() => {
    if (todayRecord) {
      localStorage.setItem(
        `todayRecord_${user.id}`,
        JSON.stringify(todayRecord),
      );
    } else {
      localStorage.removeItem(`todayRecord_${user.id}`);
    }
  }, [todayRecord, user.id]);

  useEffect(() => {
    dispatch(fetchRecord());
  }, [dispatch]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setPhotoPreview(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("no-geo"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5),
          }),
        (err) => reject(err),
        { timeout: 8000 },
      );
    });

  const capturePhoto = useCallback(
    () =>
      new Promise(async (resolve, reject) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          streamRef.current = stream;
          setCameraResolve(() => resolve);
          setCameraReject(() => reject);
          setPhotoPreview(null);
          setShowCamera(true);
          await new Promise((r) => setTimeout(r, 80));
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          stopCamera();
          reject(err);
        }
      }),
    [stopCamera],
  );

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = canvasRef.current;
    canvas.width = 320;
    canvas.height = 240;
    canvas.getContext("2d").drawImage(video, 0, 0, 320, 240);
    setPhotoPreview(canvas.toDataURL("image/jpeg", 0.85));
  }, []);

  const handleRetake = useCallback(() => {
    setPhotoPreview(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (cameraResolve && photoPreview) cameraResolve(photoPreview);
    setCameraResolve(null);
    setCameraReject(null);
    stopCamera();
  }, [cameraResolve, photoPreview, stopCamera]);

  const handleCameraCancel = useCallback(() => {
    if (cameraReject) cameraReject(new Error("cancelled"));
    setCameraResolve(null);
    setCameraReject(null);
    stopCamera();
  }, [cameraReject, stopCamera]);

  const executePunch = useCallback(
    async (skipCamera = false, skipLocation = false, savedPhoto = null) => {
      const now = new Date();
      const currentTime = now.getTime();

      // ── 1. LOCKOUT CHECK (BEFORE CAMERA/LOCATION) ──────────────
      if (!isPunchedIn) {
        // Get the most recent record from the user's history
        const lastRecord = filteredRecord[filteredRecord.length - 1];

        if (lastRecord && lastRecord._inTime) {
          // Ensure we compare numbers (timestamps)
          const lastInTime =
            typeof lastRecord._inTime === "string"
              ? new Date(lastRecord._inTime).getTime()
              : lastRecord._inTime;

          const msPassed = currentTime - lastInTime;
          const hoursPassed = msPassed / (1000 * 60 * 60);

          if (hoursPassed < 12) {
            const hoursLeft = (12 - hoursPassed).toFixed(1);
            alert(
              `Policy Restriction: You can only punch in once every 12 hours. Please wait ${hoursLeft} more hours.`,
            );
            return; // Exit function immediately
          }
        }
      }

      setLoading(true);
      let photo = savedPhoto || null;
      let location = null;

      // ── 2. CAMERA ─────────────────────────────────────────────
      if (!skipCamera) {
        try {
          photo = await capturePhoto();
        } catch (err) {
          if (err.message !== "cancelled") {
            setPendingAction({ skipCamera: false, skipLocation, photo: null });
            setPermissionModal("camera");
            setLoading(false);
            return;
          } else {
            setLoading(false); // User cancelled camera
            return;
          }
        }
      }

      // ── 3. LOCATION ───────────────────────────────────────────
      if (!skipLocation) {
        try {
          location = await getLocation();
        } catch (err) {
          if (err.message === "no-geo" || err.code === 1) {
            setPendingAction({ skipCamera: true, skipLocation: false, photo });
            setPermissionModal("location");
            setLoading(false);
            return;
          }
        }
      }

      // ── 4. DEVICE ─────────────────────────────────────────────
      const device = getDeviceType();

      // ── 5. PUNCH IN / OUT ─────────────────────────────────────
      if (!isPunchedIn) {
        const newRecord = {
          id: Date.now(),
          userID: user.id,
          username: user.user_name,
          date: formatDate(now),
          checkIn: formatTime(now),
          checkOut: "-",
          status: "In Progress",
          hours: "-",
          location,
          photo,
          checkinDevice: device,
          checkoutDevice: null,
          _inTime: currentTime, // Save as numeric timestamp
        };
        setTodayRecord(newRecord);
        setIsPunchedIn(true);
        dispatch(addRecord(newRecord));
      } else {
        const pad = (num) => String(num).padStart(2, "0");
        const updatedRecord = filteredRecord.map((r) => {
          if (r.id === todayRecord?.id) {
            // Robust timestamp handling
            const inTimeRaw = r._inTime || todayRecord?._inTime;
            const inTime =
              typeof inTimeRaw === "string"
                ? new Date(inTimeRaw).getTime()
                : inTimeRaw;

            const diffInMs = currentTime - inTime;
            const totalSeconds = Math.max(0, Math.floor(diffInMs / 1000));

            const displayHrs = Math.floor(totalSeconds / 3600);
            const displayMins = Math.floor((totalSeconds % 3600) / 60);
            const displaySecs = totalSeconds % 60;

            const totalHrs = totalSeconds / 3600;

            let finalStatus = "Present";
            if (totalHrs < 4) finalStatus = "Absent";
            else if (totalHrs < 8) finalStatus = "Half Day";

            return {
              ...r,
              checkOut: formatTime(now),
              status: finalStatus,
              hours: `${pad(displayHrs)}:${pad(displayMins)}:${pad(displaySecs)}`,
              location: location || r.location,
              photo: photo || r.photo,
              checkoutDevice: device,
            };
          }
          return r;
        });
        dispatch(updateRecord(updatedRecord));
        setIsPunchedIn(false);
        setTodayRecord(null);
      }

      setPendingAction(null);
      setLoading(false);
    },
    [
      isPunchedIn,
      todayRecord,
      filteredRecord,
      user,
      capturePhoto,
      stopCamera,
      dispatch,
    ],
  );

  const handlePermissionRetry = useCallback(async () => {
    setPermissionModal(null);
    if (pendingAction) {
      const { skipCamera, skipLocation, photo: savedPhoto } = pendingAction;
      setPendingAction(null);
      await executePunch(skipCamera, skipLocation, savedPhoto);
    }
  }, [pendingAction, executePunch]);

  const handlePermissionSkip = useCallback(() => {
    setPermissionModal(null);
    if (pendingAction) {
      const { photo: savedPhoto } = pendingAction;
      setPendingAction(null);
      executePunch(true, true, savedPhoto);
    }
  }, [pendingAction, executePunch]);

  const handleAutoCheckout = useCallback(() => {
    if (!todayRecord) return;

    const now = new Date();
    const autoOutRecord = filteredRecord.map((r) => {
      if (r.id === todayRecord?.id) {
        return {
          ...r,
          checkOut: formatTime(now),
          status: "Missed",
          hours: "—",
          checkoutDevice: null,
        };
      }
      return r;
    });

    dispatch(updateRecord(autoOutRecord));
    setIsPunchedIn(false);
    setTodayRecord(null);
  }, [todayRecord, filteredRecord, dispatch]);

  const presentDays = filteredRecord.filter(
    (r) => r.status === "Present",
  ).length;
  const absentDays = filteredRecord.filter((r) => r.status === "Absent").length;
  const halfDays = filteredRecord.filter((r) => r.status === "Half Day").length;

  const userName = user?.user_name
    ? user.user_name.charAt(0).toUpperCase() + user.user_name.slice(1)
    : "User";

  // Add this state near your other states
  const [timeLeft, setTimeLeft] = useState(null);

  // Add this effect for the countdown
  useEffect(() => {
    if (!isPunchedIn || !todayRecord) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const inTime = new Date(todayRecord._inTime);
      const deadline = new Date(inTime.getTime() + 12 * 60 * 60 * 1000);
      const remaining = deadline - new Date();

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        handleAutoCheckout();
      } else {
        const hrs = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft({ hrs, mins, secs, total: remaining });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPunchedIn, todayRecord]);

  // Add this near your other useMemo/state declarations
  const canPunchIn = useMemo(() => {
    if (isPunchedIn) return false; // Already in

    const lastRecord = filteredRecord[filteredRecord.length - 1];
    if (!lastRecord || !lastRecord._inTime) return true; // No history, go ahead

    const lastInTime = new Date(lastRecord._inTime).getTime();
    const hoursPassed = (new Date().getTime() - lastInTime) / (1000 * 60 * 60);

    return hoursPassed >= 12;
  }, [isPunchedIn, filteredRecord]);

  return (
    <div className=" mx-auto pb-10 px-4 sm:px-6">
      {showCamera && (
        <CameraModal
          videoRef={videoRef}
          preview={photoPreview}
          onCapture={handleCapture}
          onRetake={handleRetake}
          onConfirm={handleConfirm}
          onCancel={handleCameraCancel}
        />
      )}

      {permissionModal && (
        <PermissionModal
          type={permissionModal}
          onRetry={handlePermissionRetry}
          onClose={handlePermissionSkip}
        />
      )}

      {expandedPhoto && (
        <div
          onClick={() => setExpandedPhoto(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1001] cursor-pointer"
        >
          <img
            src={expandedPhoto}
            alt="Punch photo"
            className="max-w-[80vw] max-h-[80vh] rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Header */}

      {/* Punch Card + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="md:col-span-2 bg-white border border-blue-100 rounded-2xl p-7 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Today's Attendance
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {isPunchedIn
              ? `Punched in at ${todayRecord?.checkIn} — remember to punch out`
              : "Mark your attendance to stay on track"}
          </p>

          {isPunchedIn && todayRecord && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap gap-6 items-start">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1">
                  Punched In
                </div>
                <div className="text-blue-900 font-bold text-base">
                  {todayRecord.checkIn}
                </div>
              </div>

              {todayRecord.location && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1">
                    Location
                  </div>
                  <div className="text-blue-800 font-semibold text-sm flex items-center gap-1">
                    <span className="opacity-70">Lat:</span>{" "}
                    {todayRecord.location.lat},
                    <span className="opacity-70 ml-1">Lng:</span>{" "}
                    {todayRecord.location.lng}
                  </div>
                </div>
              )}

              {todayRecord.checkinDevice && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1">
                    Device
                  </div>
                  <DeviceBadge device={todayRecord.checkinDevice} />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => canPunchIn && !loading && executePunch()}
              disabled={!canPunchIn || loading}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]
    ${
      !canPunchIn
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
        : "bg-gradient-to-br from-blue-700 to-blue-600 text-white shadow-md shadow-blue-200 hover:shadow-lg"
    }`}
            >
              {loading && !isPunchedIn ? "Processing..." : "Punch In"}
            </button>
            <button
              onClick={() => isPunchedIn && !loading && executePunch()}
              disabled={!isPunchedIn || loading}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]
        ${
          !isPunchedIn
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : "bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
        }`}
            >
              {loading && isPunchedIn ? "Processing..." : "Punch Out"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-blue-50 rounded-2xl px-4 py-3 shadow-sm flex justify-between items-center hover:border-green-200 transition-colors">
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-1">
                Present Days
              </div>
              <div className="text-3xl font-black text-gray-900">
                {presentDays}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl shadow-inner">
              ✓
            </div>
          </div>
          <div className="bg-white border border-blue-50 rounded-2xl px-4 py-3 shadow-sm flex justify-between items-center hover:border-red-200 transition-colors">
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-1">
                Absent Days
              </div>
              <div className="text-3xl font-black text-gray-900">
                {absentDays}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl shadow-inner">
              ✕
            </div>
          </div>
          <div className="bg-white border border-amber-50 rounded-2xl px-4 py-4 shadow-sm flex justify-between items-center hover:border-amber-200 transition-colors">
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                Half Days
              </div>
              <div className="text-3xl font-black text-gray-900">
                {halfDays}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-inner border border-amber-100">
              ⏳
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-blue-50 bg-blue-50/50">
          <h3 className="text-sm font-bold text-gray-900">
            Recent Attendance History
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Live-updated with location, device & photo capture
          </p>
        </div>

        {/* Record Detail Modal for mobile */}
        {expandedRecord && (
          <div
            onClick={() => setExpandedRecord(null)}
            className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-xl"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50">
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Attendance Record
                  </div>
                  <div className="text-base font-black text-gray-900">
                    {expandedRecord.date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={expandedRecord.status} />
                  <button
                    onClick={() => setExpandedRecord(null)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm ml-1"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Photo */}
              {expandedRecord.photo && (
                <div className="px-5 pt-4">
                  <img
                    src={expandedRecord.photo}
                    alt="punch"
                    onClick={() => setExpandedPhoto(expandedRecord.photo)}
                    className="w-full h-full object-cover rounded-xl border-2 border-blue-100 cursor-pointer hover:border-blue-400 transition-all"
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className="p-5 grid grid-cols-2 gap-3">
                {[
                  { label: "Punch In", value: expandedRecord.checkIn },
                  { label: "Punch Out", value: expandedRecord.checkOut },
                  { label: "Hours", value: expandedRecord.hours },
                  {
                    label: "Location",
                    value: expandedRecord.location
                      ? `${expandedRecord.location.lat}, ${expandedRecord.location.lng}`
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-xl px-3 py-2.5"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                      {label}
                    </div>
                    <div className="text-sm font-bold text-gray-800 break-all">
                      {value}
                    </div>
                  </div>
                ))}

                {/* Devices */}
                <div className="col-span-2 bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                    Device
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expandedRecord.checkinDevice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">
                          IN
                        </span>
                        <DeviceBadge device={expandedRecord.checkinDevice} />
                      </div>
                    )}
                    {expandedRecord.checkoutDevice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">
                          OUT
                        </span>
                        <DeviceBadge device={expandedRecord.checkoutDevice} />
                      </div>
                    )}
                    {!expandedRecord.checkinDevice &&
                      !expandedRecord.checkoutDevice && (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-blue-50">
                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Photo
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  In
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Out
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Hours
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Device
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Location
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filteredRecord.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No records yet — punch in to get started.
                  </td>
                </tr>
              ) : (
                filteredRecord.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/40 transition-colors group text-center"
                  >
                    {/* Date — always visible */}
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap text-center">
                      {record.date}
                    </td>

                    {/* Photo — hidden on mobile */}
                    <td className="hidden md:table-cell px-6 py-3 text-center">
                      {record.photo ? (
                        <img
                          src={record.photo}
                          alt="punch"
                          onClick={() => setExpandedPhoto(record.photo)}
                          className="w-11 h-9 rounded-lg object-cover border-2 border-blue-100 cursor-pointer hover:border-blue-400 transition-all"
                        />
                      ) : (
                        <div className="w-11 h-9 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* In — always visible */}
                    <td className="px-6 py-4 text-gray-600 font-medium text-center hidden md:table-cell">
                      {record.checkIn}
                    </td>

                    {/* Out — hidden on mobile */}
                    <td className="hidden md:table-cell px-6 py-4 text-gray-600 font-medium text-center">
                      {record.checkOut}
                    </td>

                    {/* Hours — hidden on mobile */}
                    <td className="hidden xl:table-cell px-6 py-4 font-bold text-gray-700 text-center">
                      {record.hours}
                    </td>

                    {/* Device — hidden on mobile */}
                    <td className="hidden xl:table-cell px-6 py-4 text-center">
                      <div className="flex flex-col gap-1">
                        {record.checkinDevice && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400 w-6">
                              IN
                            </span>
                            <DeviceBadge device={record.checkinDevice} />
                          </div>
                        )}
                        {record.checkoutDevice && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400 w-6">
                              OUT
                            </span>
                            <DeviceBadge device={record.checkoutDevice} />
                          </div>
                        )}
                        {!record.checkinDevice && !record.checkoutDevice && (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </td>

                    {/* Location — hidden on mobile */}
                    <td className="hidden xl:table-cell px-6 py-4 text-center">
                      {record.location ? (
                        <div className="flex flex-col text-[11px] leading-tight group-hover:translate-x-1 transition-transform">
                          <div className="flex items-center gap-1 text-blue-600 font-bold">
                            <svg
                              className="w-3 h-3 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                            </svg>
                            {record.location.lat}
                          </div>
                          <span className="text-blue-300 ml-4 font-medium">
                            {record.location.lng}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Status — always visible */}
                    <td className="px-6 py-4 text-center hidden lg:table-cell">
                      <StatusBadge status={record.status} />
                    </td>

                    {/* Eye icon — only on mobile */}
                    <td className="px-3 py-4 text-center">
                      <button
                        onClick={() => setExpandedRecord(record)}
                        className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors mx-auto"
                      >
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-center text-[11px] font-medium text-gray-400 py-4 border-t border-blue-50 bg-gray-50/30">
          Showing {filteredRecord.length} records •
          <span className="text-green-600 px-1">{presentDays} Present</span> •
          <span className="text-red-600 px-1">{absentDays} Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendancePunch;
