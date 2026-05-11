import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à la base SQLite
const db = new sqlite3.Database(process.env.DATABASE_URL || './database.sqlite');

// Fonction utilitaire pour promisify manuellement
function runQuery(sql: string, params: any[] = []): Promise<{ lastID: number, changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAllQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Initialisation des tables
async function initDatabase() {
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS personnes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        date_naissance TEXT NOT NULL,
        wilaya TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS wilayas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code INTEGER UNIQUE,
        name TEXT NOT NULL
      )
    `);

    const count = await getQuery('SELECT COUNT(*) as count FROM wilayas');
    
    if (count.count === 0) {
      const wilayas = [
        { code: 1, name: 'Adrar' }, { code: 2, name: 'Chlef' }, 
        { code: 3, name: 'Laghouat' }, { code: 4, name: 'Oum El Bouaghi' },
        { code: 5, name: 'Batna' }, { code: 6, name: 'Béjaïa' },
        { code: 7, name: 'Biskra' }, { code: 8, name: 'Béchar' },
        { code: 9, name: 'Blida' }, { code: 10, name: 'Bouira' },
        { code: 11, name: 'Tamanrasset' }, { code: 12, name: 'Tébessa' },
        { code: 13, name: 'Tlemcen' }, { code: 14, name: 'Tiaret' },
        { code: 15, name: 'Tizi Ouzou' }, { code: 16, name: 'Alger' },
        { code: 17, name: 'Djelfa' }, { code: 18, name: 'Jijel' },
        { code: 19, name: 'Sétif' }, { code: 20, name: 'Saïda' },
        { code: 21, name: 'Skikda' }, { code: 22, name: 'Sidi Bel Abbès' },
        { code: 23, name: 'Annaba' }, { code: 24, name: 'Guelma' },
        { code: 25, name: 'Constantine' }, { code: 26, name: 'Médéa' },
        { code: 27, name: 'Mostaganem' }, { code: 28, name: 'M\'Sila' },
        { code: 29, name: 'Mascara' }, { code: 30, name: 'Ouargla' },
        { code: 31, name: 'Oran' }, { code: 32, name: 'El Bayadh' },
        { code: 33, name: 'Illizi' }, { code: 34, name: 'Bordj Bou Arréridj' },
        { code: 35, name: 'Boumerdès' }, { code: 36, name: 'El Tarf' },
        { code: 37, name: 'Tindouf' }, { code: 38, name: 'Tissemsilt' },
        { code: 39, name: 'El Oued' }, { code: 40, name: 'Khenchela' },
        { code: 41, name: 'Souk Ahras' }, { code: 42, name: 'Tipaza' },
        { code: 43, name: 'Mila' }, { code: 44, name: 'Aïn Defla' },
        { code: 45, name: 'Naâma' }, { code: 46, name: 'Aïn Témouchent' },
        { code: 47, name: 'Ghardaïa' }, { code: 48, name: 'Relizane' }
      ];

      for (const w of wilayas) {
        await runQuery('INSERT INTO wilayas (code, name) VALUES (?, ?)', [w.code, w.name]);
      }
      console.log('✅ Wilayas initialisées');
    }
    
    console.log('✅ Base de données initialisée');
  } catch (error) {
    console.error('❌ Erreur initialisation DB:', error);
  }
}

// Export des fonctions
export const dbFunctions = {
  getWilayas: async () => {
    return await getAllQuery('SELECT * FROM wilayas ORDER BY code');
  },

  addPersonne: async (nom: string, prenom: string, date_naissance: string, wilaya: string) => {
    const result = await runQuery(
      'INSERT INTO personnes (nom, prenom, date_naissance, wilaya) VALUES (?, ?, ?, ?)',
      [nom, prenom, date_naissance, wilaya]
    );
    return { lastInsertRowid: result.lastID };
  },

  getPersonnes: async () => {
    return await getAllQuery('SELECT * FROM personnes ORDER BY created_at DESC');
  },

  deletePersonne: async (id: number) => {
    const result = await runQuery('DELETE FROM personnes WHERE id = ?', [id]);
    return { changes: result.changes };
  },

  getPersonneById: async (id: number) => {
    return await getQuery('SELECT * FROM personnes WHERE id = ?', [id]);
  }
};

// Initialiser la base
await initDatabase();

export default db;