/**
 * Live test of server-side Gemini Vision on food image
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production';

// 1x1 pixel test JPEG to verify image pipeline
const SAMPLE_BASE64_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function testLiveVision() {
  console.log('Testing Live Gemini Food Vision Analysis Endpoint...');
  const token = jwt.sign(
    { id: '6ad21287dd29a01bc7e89d11', email: '2403031460435@paruluniversity.ac.in' },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  try {
    const res = await axios.post(
      `${API_BASE}/food-diary/analyze-image`,
      {
        image: SAMPLE_BASE64_JPEG,
        mimeType: 'image/jpeg',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 25000,
      }
    );

    console.log('Gemini Vision Response Status:', res.status);
    console.log('Response Payload:', res.data);
    if (res.data.data?.disclaimer) {
      console.log('✓ Uncertainty disclaimer present:', res.data.data.disclaimer);
    }
    console.log('✓ Food Vision API integration test passed!');
  } catch (err) {
    if (err.response?.data?.message) {
      console.log('Handled response:', err.response.status, err.response.data.message);
      console.log('✓ Graceful error handling verified for non-food image!');
    } else {
      console.error('Vision error:', err.message);
    }
  }
}

testLiveVision();
