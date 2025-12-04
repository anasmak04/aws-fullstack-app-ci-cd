const initDB = require('../config/db');

class Todo {
  static async getAll() {
    const db = await initDB(); 
    const [rows] = await db.query('SELECT * FROM todos ORDER BY created_at DESC');
    return rows;
  }

  static async getById(id) {
    const db = await initDB();
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ title, description }) {
    const db = await initDB();
    const [result] = await db.query(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description]
    );
    return { id: result.insertId, title, description, status: 'pending' };
  }

  static async update(id, updateData) {
    const db = await initDB();
    const allowedFields = ['title', 'description', 'status', 'completed', 'order'];
    const fields = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        const escapedField = field === 'order' ? `\`${field}\`` : field;
        fields.push(`${escapedField} = ?`);
        values.push(updateData[field]);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(query, values);
  }

  static async delete(id) {
    const db = await initDB();
    await db.query('DELETE FROM todos WHERE id = ?', [id]);
  }
}

module.exports = Todo;