import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdfService } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const response = await pdfService.getMyPDFs();
      setPdfs(response.data.pdfs);
    } catch (error) {
      toast.error('Failed to fetch PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);
    try {
      await pdfService.upload(formData);
      toast.success('PDF uploaded successfully! 🎉');
      fetchPDFs(); // Refresh list
      e.target.value = ''; // Reset input
    } catch (error) {
      toast.error(
        'Upload failed: ' + (error.response?.data?.message || 'Unknown error')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (uuid, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await pdfService.deletePDF(uuid);
      toast.success('PDF deleted successfully');
      fetchPDFs();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleRename = async (uuid) => {
    if (!newName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    try {
      await pdfService.renamePDF(uuid, newName);
      toast.success('PDF renamed successfully');
      setEditingId(null);
      setNewName('');
      fetchPDFs();
    } catch (error) {
      toast.error('Rename failed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your library...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My PDF Library 📚</h1>
        <div className="upload-section">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            id="pdf-upload"
            className="file-input"
          />
          <label htmlFor="pdf-upload" className="upload-btn">
            {uploading ? 'Uploading...' : '+ Upload PDF'}
          </label>
        </div>
      </div>

      {pdfs.length === 0 ? (
        <div className="empty-state">
          <p>No PDFs yet! Upload your first PDF</p>
        </div>
      ) : (
        <div className="pdf-grid">
          {pdfs.map((pdf) => (
            <div key={pdf.uuid} className="pdf-card">
              <div className="pdf-icon">📄</div>

              {editingId === pdf.uuid ? (
                <div className="edit-name">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New name"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(pdf.uuid)}
                    className="save-btn"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewName('');
                    }}
                    className="cancel-btn"
                  >
                    ✗
                  </button>
                </div>
              ) : (
                <h3 className="pdf-name">{pdf.fileName}</h3>
              )}

              <p className="pdf-date">{formatDate(pdf.uploadDate)}</p>

              <div className="pdf-actions">
                <button
                  onClick={() => navigate(`/pdf/${pdf.uuid}`)}
                  className="action-btn view-btn"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    setEditingId(pdf.uuid);
                    setNewName(pdf.fileName);
                  }}
                  className="action-btn edit-btn"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(pdf.uuid, pdf.fileName)}
                  className="action-btn delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
