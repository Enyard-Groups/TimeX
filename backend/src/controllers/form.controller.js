import db from "../lib/db.js";  

export const getMonthly = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM monthly ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  

export const createMonthly = async (req, res) => {
    const { name, code, company, description, is_active } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO monthly (name, code, company, description, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, code, company, description, is_active]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMonthly = async (req, res) => {
    const { id } = req.params;
    const { name, code, company, description, is_active } = req.body;
    try {
        const result = await db.query(
            'UPDATE monthly SET name=$1, code=$2, company=$3, description=$4, is_active=$5 WHERE id=$6 RETURNING *',
            [name, code, company, description, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMonthly = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM monthly WHERE id = $1', [id]);
        res.json({ message: 'Monthly removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
