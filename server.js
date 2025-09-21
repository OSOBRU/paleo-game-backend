import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Supabase (variables de entorno)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // usa la service_role key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Endpoint de prueba
app.get('/health', (req, res) => res.json({ ok: true }));

// Crear/recuperar usuario invitado
app.post('/api/v1/auth/guest', async (req, res) => {
  const { nombre, grupo = null } = req.body || {};
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
  const { data, error } = await supabase
    .from('usuarios')
    .upsert([{ nombre, grupo }], { onConflict: 'nombre,grupo' })
    .select()
    .limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ usuario: data[0] });
});

// Listar documentos
app.get('/api/v1/documentos', async (req, res) => {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .order('siglo', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Preguntas de un documento
app.get('/api/v1/documentos/:id/preguntas', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('preguntas')
    .select('*')
    .eq('documento_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('API lista en puerto ' + port));
