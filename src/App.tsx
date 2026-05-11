import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Personne {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  wilaya: string;
  created_at: string;
}

interface Wilaya {
  id: number;
  code: number;
  name: string;
}

interface FormData {
  nom: string;
  prenom: string;
  date_naissance: string;
  wilaya: string;
}

interface Message {
  text: string;
  type: string;
}

function App() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    date_naissance: '',
    wilaya: ''
  });
  const [message, setMessage] = useState<Message>({ text: '', type: '' });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPersonnes();
    fetchWilayas();
  }, []);

  const fetchPersonnes = async (): Promise<void> => {
    try {
      const response = await axios.get<Personne[]>('/api/personnes');
      setPersonnes(response.data);
    } catch (error) {
      console.error('Erreur fetch personnes:', error);
    }
  };

  const fetchWilayas = async (): Promise<void> => {
    try {
      const response = await axios.get<Wilaya[]>('/api/wilayas');
      setWilayas(response.data);
    } catch (error) {
      console.error('Erreur fetch wilayas:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/personnes', formData);
      setMessage({ text: '✅ Personne ajoutée avec succès!', type: 'success' });
      setFormData({ nom: '', prenom: '', date_naissance: '', wilaya: '' });
      await fetchPersonnes();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ text: '❌ Erreur lors de l\'ajout', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (confirm('Voulez-vous vraiment supprimer cette personne ?')) {
      try {
        await axios.delete(`/api/personnes/${id}`);
        await fetchPersonnes();
        setMessage({ text: '✅ Personne supprimée', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
      } catch (error) {
        console.error('Erreur suppression:', error);
        setMessage({ text: '❌ Erreur lors de la suppression', type: 'error' });
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📋 Gestion des Personnes</h1>
        <p>React + TypeScript + SQLite</p>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="container">
        <div className="form-card">
          <h2>➕ Nouvelle personne</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Entrez le nom"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                placeholder="Entrez le prénom"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Date de naissance *</label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Wilaya *</label>
              <select
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionnez une wilaya</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter la personne'}
            </button>
          </form>
        </div>

        <div className="list-card">
          <h2>📊 Liste des personnes ({personnes.length})</h2>
          {personnes.length === 0 ? (
            <p className="empty">Aucune personne enregistrée</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Date naissance</th>
                    <th>Wilaya</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personnes.map((person) => (
                    <tr key={person.id}>
                      <td>{person.nom}</td>
                      <td>{person.prenom}</td>
                      <td>
                        {new Date(person.date_naissance).toLocaleDateString('fr-FR')}
                      </td>
                      <td>{person.wilaya}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="btn-delete"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;