import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-desarrollo';
const FRONTEND_URL = 'http://localhost:5173';
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim());

const oauth2Client = new OAuth2Client(CLIENT_ID);

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const picture = payload?.picture;

    if (!email) return res.status(400).json({ error: 'No se pudo obtener el correo' });

    if (!ALLOWED_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Acceso denegado: Tu correo no está autorizado.' });
    }

    const token = jwt.sign({ email, name, picture }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('svsci_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });
    
    res.json({ success: true, user: { email, name, picture } });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Token de Google inválido' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});