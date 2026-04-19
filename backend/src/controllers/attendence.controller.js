import db from "../lib/db.js";

export const getAttendenceLogs = async (req, res) => {
  try {
    // New schema: attendance is stored per user_id + date
    const { user_id, date, status } = req.query;
    const where = [];
    const values = [];
    let i = 1;

    if (user_id) {
      where.push(`user_id = $${i++}`);
      values.push(Number(user_id));
    }
    if (date) {
      where.push(`date = $${i++}`);
      values.push(date);
    }
    if (status) {
      where.push(`status = $${i++}`);
      values.push(status);
    }

    const result = await db.query(
      `
      SELECT *
      FROM attendance
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY _in_time DESC
    `,
      values,
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("Error in getAttendenceLogs:", error.message);
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const createAttendenceLog = async (req, res) => {
  // Backward-compatible alias for creating a record
  const body = req.body || {};
  const payload = {
    id: body.id ?? Date.now(),
    user_id: body.user_id ?? body.userId ?? body.userID,
    username: body.username ?? body.user_name ?? body.userName,
    date: body.date,
    check_in: body.check_in ?? body.checkIn,
    check_out: body.check_out ?? body.checkOut ?? null,
    status: body.status ?? "In Progress",
    hours: body.hours ?? "-",
    location: body.location ?? null,
    photo: body.photo ?? null,
    checkin_device: body.checkin_device ?? body.checkinDevice ?? null,
    checkout_device: body.checkout_device ?? body.checkoutDevice ?? null,
    _in_time: body._in_time ?? body._inTime,
    _session_seconds: body._session_seconds ?? body._sessionSeconds ?? 0,
    _prev_day_seconds: body._prev_day_seconds ?? body._prevDaySeconds ?? 0,
  };

  try {
    if (!payload.user_id || !payload.username || !payload.date || !payload.check_in || !payload._in_time) {
      return res.status(400).json({
        message: "Missing required fields: user_id, username, date, check_in, _in_time",
      });
    }

    const result = await db.query(
      `
      INSERT INTO attendance (
        id, user_id, username, date,
        check_in, check_out, status, hours,
        location, photo, checkin_device, checkout_device,
        _in_time, _session_seconds, _prev_day_seconds
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,$12,
        $13,$14,$15
      )
      RETURNING *
    `,
      [
        payload.id,
        payload.user_id,
        payload.username,
        payload.date,
        payload.check_in,
        payload.check_out,
        payload.status,
        payload.hours,
        payload.location ? JSON.stringify(payload.location) : null,
        payload.photo,
        payload.checkin_device,
        payload.checkout_device,
        payload._in_time,
        payload._session_seconds,
        payload._prev_day_seconds,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("Error in createAttendenceLog:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    // Best-effort stats under new schema.
    const totalUsers = await db.query("SELECT COUNT(*) FROM users");
    const presentToday = await db.query(
      "SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = CURRENT_DATE AND status <> 'In Progress'",
    );
    const totalDevices = await db.query("SELECT COUNT(*) FROM devices");
    const pendingRequests = await db.query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending'",
    );

    return res.json({
      totalEmployees: totalUsers.rows[0].count,
      presentToday: presentToday.rows[0].count,
      totalDevices: totalDevices.rows[0].count,
      pendingRequests: pendingRequests.rows[0].count,
    });
  } catch (error) {
    console.log("error in getDashboardStats:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const punchIn = async (req, res) => {
  // Creates a new "In Progress" attendance session for a user.
  // This endpoint is kept for compatibility with older frontend code.
  const { id: userIdParam } = req.params;
  const body = req.body || {};
  const user_id = Number(body.user_id ?? body.userId ?? body.userID ?? userIdParam);
  const username = body.username ?? body.user_name ?? body.userName;
  const date = body.date; // YYYY-MM-DD recommended (DATE column)
  const check_in = body.check_in ?? body.checkIn; // HH:MM:SS
  const photo = body.photo ?? null;
  const location = body.location ?? null;
  const checkin_device = body.checkin_device ?? body.checkinDevice ?? null;
  const _in_time = body._in_time ?? body._inTime ?? new Date().toISOString();
  const _prev_day_seconds = body._prev_day_seconds ?? body._prevDaySeconds ?? 0;

  try {
    if (!user_id || !username || !date || !check_in) {
      return res.status(400).json({
        message: "Missing required fields: user_id, username, date, check_in",
      });
    }

    const result = await db.query(
      `
      INSERT INTO attendance (
        id, user_id, username, date,
        check_in, check_out, status, hours,
        location, photo, checkin_device, checkout_device,
        _in_time, _session_seconds, _prev_day_seconds
      )
      VALUES (
        $1,$2,$3,$4,
        $5,NULL,'In Progress','-',
        $6,$7,$8,NULL,
        $9,0,$10
      )
      RETURNING *
    `,
      [
        body.id ?? Date.now(),
        user_id,
        username,
        date,
        check_in,
        location ? JSON.stringify(location) : null,
        photo,
        checkin_device,
        _in_time,
        _prev_day_seconds,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("Error in punchIn:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const punchOut = async (req, res) => {
  // Closes the latest open "In Progress" record for this user.
  // This endpoint is kept for compatibility with older frontend code.
  const { id: userIdParam } = req.params;
  const body = req.body || {};
  const user_id = Number(body.user_id ?? body.userId ?? body.userID ?? userIdParam);
  const photo = body.photo ?? null;
  const location = body.location ?? null;
  const status = body.status ?? "Present";
  const check_out = body.check_out ?? body.checkOut;
  const hours = body.hours;
  const checkout_device = body.checkout_device ?? body.checkoutDevice ?? null;
  const _session_seconds = body._session_seconds ?? body._sessionSeconds;

  try {
    if (!user_id) {
      return res.status(400).json({ message: "Missing required field: user_id" });
    }

    const result = await db.query(
      `
      UPDATE attendance
      SET
        check_out = COALESCE($1, check_out),
        status = COALESCE($2, status),
        hours = COALESCE($3, hours),
        location = COALESCE($4, location),
        photo = COALESCE($5, photo),
        checkout_device = COALESCE($6, checkout_device),
        _session_seconds = COALESCE($7, _session_seconds)
      WHERE id = (
        SELECT id
        FROM attendance
        WHERE user_id = $8 AND status = 'In Progress'
        ORDER BY _in_time DESC
        LIMIT 1
      )
      RETURNING *
    `,
      [
        check_out ?? null,
        status ?? null,
        hours ?? null,
        location ? JSON.stringify(location) : null,
        photo ?? null,
        checkout_device ?? null,
        typeof _session_seconds === "number" ? _session_seconds : null,
        user_id,
      ],
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No active punch-in found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log("Error in punchOut:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------
// AttendancePunch.jsx endpoints
// ---------------------------

const toFrontendRecord = (row) => {
  if (!row) return row;
  let location = row.location;
  if (typeof location === "string") {
    try {
      location = JSON.parse(location);
    } catch {
      // leave as-is
    }
  }
  return {
    id: Number(row.id),
    userID: row.user_id,
    username: row.username,
    date: row.date
      ? new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : row.date,
    checkIn: row.check_in,
    checkOut: row.check_out ?? "-",
    status: row.status,
    hours: row.hours ?? "-",
    location: location ?? null,
    photo: row.photo ?? null,
    checkinDevice: row.checkin_device ?? null,
    checkoutDevice: row.checkout_device ?? null,
    _inTime: row._in_time,
    _sessionSeconds: row._session_seconds ?? 0,
    _prevDaySeconds: row._prev_day_seconds ?? 0,
  };
};

export const getAttendanceRecordsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      `
      SELECT *
      FROM attendance
      WHERE user_id = $1
      ORDER BY _in_time DESC
    `,
      [Number(userId)],
    );
    return res.status(200).json(result.rows.map(toFrontendRecord));
  } catch (error) {
    console.log("Error in getAttendanceRecordsByUser:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createAttendanceRecord = async (req, res) => {
  const body = req.body || {};
  try {
    const payload = {
      id: body.id ?? Date.now(),
      user_id: Number(body.user_id ?? body.userId ?? body.userID),
      username: body.username ?? body.user_name ?? body.userName,
      date: body.date, // should be YYYY-MM-DD (DATE column)
      check_in: body.check_in ?? body.checkIn,
      check_out: body.check_out ?? body.checkOut ?? null,
      status: body.status ?? "In Progress",
      hours: body.hours ?? "-",
      location: body.location ?? null,
      photo: body.photo ?? null,
      checkin_device: body.checkin_device ?? body.checkinDevice ?? null,
      checkout_device: body.checkout_device ?? body.checkoutDevice ?? null,
      _in_time: body._in_time ?? body._inTime,
      _session_seconds: body._session_seconds ?? body._sessionSeconds ?? 0,
      _prev_day_seconds: body._prev_day_seconds ?? body._prevDaySeconds ?? 0,
    };

    if (!payload.user_id || !payload.username || !payload.date || !payload.check_in || !payload._in_time) {
      return res.status(400).json({
        message: "Missing required fields: user_id, username, date, check_in, _in_time",
      });
    }

    const result = await db.query(
      `
      INSERT INTO attendance (
        id, user_id, username, date,
        check_in, check_out, status, hours,
        location, photo, checkin_device, checkout_device,
        _in_time, _session_seconds, _prev_day_seconds
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,$12,
        $13,$14,$15
      )
      RETURNING *
    `,
      [
        payload.id,
        payload.user_id,
        payload.username,
        payload.date,
        payload.check_in,
        payload.check_out,
        payload.status,
        payload.hours,
        payload.location ? JSON.stringify(payload.location) : null,
        payload.photo,
        payload.checkin_device,
        payload.checkout_device,
        payload._in_time,
        payload._session_seconds,
        payload._prev_day_seconds,
      ],
    );

    return res.status(201).json(toFrontendRecord(result.rows[0]));
  } catch (error) {
    console.log("Error in createAttendanceRecord:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAttendanceRecord = async (req, res) => {
  const { attendanceId } = req.params;
  const body = req.body || {};
  try {
    const fields = [];
    const values = [];
    let i = 1;

    const set = (col, val) => {
      fields.push(`${col} = $${i++}`);
      values.push(val);
    };

    if (body.check_out ?? body.checkOut) set("check_out", body.check_out ?? body.checkOut);
    if (body.status) set("status", body.status);
    if (body.hours) set("hours", body.hours);
    if (body.location) set("location", JSON.stringify(body.location));
    if (body.photo) set("photo", body.photo);
    if (body.checkout_device ?? body.checkoutDevice) set("checkout_device", body.checkout_device ?? body.checkoutDevice);
    if (typeof (body._session_seconds ?? body._sessionSeconds) === "number")
      set("_session_seconds", body._session_seconds ?? body._sessionSeconds);
    if (typeof (body._prev_day_seconds ?? body._prevDaySeconds) === "number")
      set("_prev_day_seconds", body._prev_day_seconds ?? body._prevDaySeconds);

    if (!fields.length) {
      return res.status(400).json({ message: "No updatable fields provided" });
    }

    values.push(Number(attendanceId));

    const result = await db.query(
      `
      UPDATE attendance
      SET ${fields.join(", ")}
      WHERE id = $${i}
      RETURNING *
    `,
      values,
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.status(200).json(toFrontendRecord(result.rows[0]));
  } catch (error) {
    console.log("Error in updateAttendanceRecord:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
