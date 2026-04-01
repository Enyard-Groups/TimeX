import db from "../lib/db.js";

const authHeaders = (req) => req.headers.authorization; // kept for future middleware use

// ─── Devices ─────────────────────────────────────────────────────────────────

export const getDevices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*
      FROM devices d
      ORDER BY d.created_at DESC
    `);
    return res.json({ data: result.rows });
  } catch (error) {
    console.log("error in getDevices", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createDevice = async (req, res) => {
  const {
    name,
    company,
    deviceip,
    deviceserialno,
    devicemodel,
    latitude,
    longitude,
    isFace,
    isFingerprint,
    isCardNo,
    isPinNo,
    isActive,
  } = req.body;

  if (!name || !company || !deviceip) {
    return res.status(400).json({ message: "name, company and deviceip are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO devices
        (device_name, company, ip_address, serial_number, device_model, latitude, longitude,
         is_face, is_fingerprint, is_card_no, is_pin_no, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [name, company, deviceip, deviceserialno, devicemodel, latitude, longitude,
       isFace ?? false, isFingerprint ?? false, isCardNo ?? false, isPinNo ?? false, isActive ?? false]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("error in createDevice", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDevice = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    company,
    deviceip,
    deviceserialno,
    devicemodel,
    latitude,
    longitude,
    isFace,
    isFingerprint,
    isCardNo,
    isPinNo,
    isActive,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE devices
       SET device_name=$1, company=$2, ip_address=$3, serial_number=$4, device_model=$5,
           latitude=$6, longitude=$7,
           is_face=$8, is_fingerprint=$9, is_card_no=$10, is_pin_no=$11, is_active=$12
       WHERE id=$13
       RETURNING *`,
      [name, company, deviceip, deviceserialno, devicemodel, latitude, longitude,
       isFace ?? false, isFingerprint ?? false, isCardNo ?? false, isPinNo ?? false, isActive ?? false, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Device not found" });
    return res.json(result.rows[0]);
  } catch (error) {
    console.log("error in updateDevice", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM devices WHERE id=$1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Device not found" });
    return res.json({ message: "Device deleted" });
  } catch (error) {
    console.log("error in deleteDevice", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Device Models ────────────────────────────────────────────────────────────

export const getDeviceModels = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM device_models ORDER BY created_at DESC");
    return res.json({ data: result.rows });
  } catch (error) {
    console.log("error in getDeviceModels", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createDeviceModel = async (req, res) => {
  const { name, code, company, active } = req.body;
  if (!name || !code || !company) {
    return res.status(400).json({ message: "name, code and company are required" });
  }
  try {
    const result = await db.query(
      `INSERT INTO device_models (name, code, company, active)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, code, company, active ?? false]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("error in createDeviceModel", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDeviceModel = async (req, res) => {
  const { id } = req.params;
  const { name, code, company, active } = req.body;
  try {
    const result = await db.query(
      `UPDATE device_models SET name=$1, code=$2, company=$3, active=$4
       WHERE id=$5 RETURNING *`,
      [name, code, company, active ?? false, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Device model not found" });
    return res.json(result.rows[0]);
  } catch (error) {
    console.log("error in updateDeviceModel", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDeviceModel = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM device_models WHERE id=$1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Device model not found" });
    return res.json({ message: "Device model deleted" });
  } catch (error) {
    console.log("error in deleteDeviceModel", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Device Communications ───────────────────────────────────────────────────

export const getDeviceCommunications = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM device_communications ORDER BY created_at DESC"
    );
    return res.json({ data: result.rows });
  } catch (error) {
    console.log("error in getDeviceCommunications", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
