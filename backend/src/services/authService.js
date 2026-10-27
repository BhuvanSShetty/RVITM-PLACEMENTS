import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function loginAdmin({ id, password }) {
  if (!password) {
    const error = new Error('Password is required.');
    error.statusCode = 400;
    throw error;
  }

  const validAdminId = process.env.ADMIN_ID;
  if (!validAdminId) {
    console.error('ADMIN_ID environment variable is not configured.');
    const error = new Error('Server authentication not configured.');
    error.statusCode = 500;
    throw error;
  }

  if (id && id !== validAdminId) {
    const error = new Error('Invalid Admin ID or Password.');
    error.statusCode = 401;
    throw error;
  }

  const storedHash = process.env.ADMIN_PW_HASH;
  if (!storedHash) {
    console.error('ADMIN_PW_HASH environment variable is not set.');
    const error = new Error('Server authentication not configured.');
    error.statusCode = 500;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, storedHash);
  if (!passwordMatch) {
    const error = new Error('Invalid Admin ID or Password.');
    error.statusCode = 401;
    throw error;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set.');
    const error = new Error('Server authentication not configured.');
    error.statusCode = 500;
    throw error;
  }

  const token = jwt.sign(
    { admin: true, id: validAdminId },
    jwtSecret,
    { expiresIn: '24h' }
  );

  return { token };
}
