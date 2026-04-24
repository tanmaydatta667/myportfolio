// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const portfolioAPI = {
  // Fetch all portfolio data
  async getPortfolio() {
    try {
      const res = await fetch(`${API_URL}/portfolio`);
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      return await res.json();
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return null;
    }
  },

  // Save entire portfolio
  async savePortfolio(data) {
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save portfolio');
      return await res.json();
    } catch (error) {
      console.error('Error saving portfolio:', error);
      return null;
    }
  },

  // Update specific field
  async updateField(field, value) {
    try {
      const res = await fetch(`${API_URL}/portfolio/${field}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error(`Failed to update ${field}`);
      return await res.json();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      return null;
    }
  },

  // Upload CV PDF
  async uploadCV(file: File) {
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const res = await fetch(`${API_URL}/portfolio/upload-cv`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload CV');
      return await res.json();
    } catch (error) {
      console.error('Error uploading CV:', error);
      return null;
    }
  }
};
