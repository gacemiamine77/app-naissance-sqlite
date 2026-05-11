import express from 'express';
import cors from 'cors';
import { dbFunctions } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.get('/api/wilayas', async (req, res) => {
  try {
    const wilayas = await dbFunctions.getWilayas();
    res.json(wilayas);
  } catch (error) {
    console.error('Erreur wilayas:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/personnes', async (req, res) => {
  const { nom, prenom, date_naissance, wilaya } = req.body;
  
  if (!nom || !prenom || !date_naissance || !wilaya) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const result = await dbFunctions.addPersonne(nom, prenom, date_naissance, wilaya);
    res.json({ id: result.lastInsertRowid, message: 'Ajouté avec succès' });
  } catch (error) {
    console.error('Erreur ajout:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/personnes', async (req, res) => {
  try {
    const personnes = await dbFunctions.getPersonnes();
    res.json(personnes);
  } catch (error) {
    console.error('Erreur récupération:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/personnes/:id', async (req, res) => {
  try {
    const result = await dbFunctions.deletePersonne(parseInt(req.params.id));
    res.json({ deleted: result.changes });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Servir le build React en production
app.use(express.static(path.join(__dirname, 'dist')));

// Toutes les autres routes -> React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur port ${PORT}`);
});