const express = require('express');
const axios = require('axios');
const { DateTime } = require('luxon');

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_NAME = "ZEXX_OWNER";

// 🔑 Multiple Keys Database
const KEYS_DB = {
  "ZEXX@_4M": { expiry: "2027-12-31", status: "Premium" },
  "OWNER_TEST": { expiry: "2032-12-30", status: "Trial" },
  "ZEXX_1M": { expiry: "2026-08-15", status: "Basic" },
  "ZEXX_T4L": { expiry: "2026-02-25", status: "Premium" }
};

app.use(express.json());

// ================= SEARCH API =================
app.get('/search', async (req, res) => {
  const { phone, key } = req.query;

  // 1️⃣ Key Validation
  if (!key || !KEYS_DB[key]) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Key!',
      owner: OWNER_NAME
    });
  }

  // 2️⃣ Expiry Check
  const today = DateTime.local();
  const expiryDate = DateTime.fromISO(KEYS_DB[key].expiry);

  if (today > expiryDate) {
    return res.status(403).json({
      success: false,
      message: 'Key Expired!',
      expiry_date: KEYS_DB[key].expiry,
      owner: OWNER_NAME
    });
  }

  // 3️⃣ Phone Check
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone parameter required',
      owner: OWNER_NAME
    });
  }

  try {
    const response = await axios.get('https://api.subhxcosmo.in/api', {
      params: {
        key: 'CYBERXZEXX',
        type: 'mobile',
        term: phone
      },
      timeout: 10000
    });

    const apiData = response.data;

    // 🔥 OWNER LINK REPLACE
    if (apiData.data && apiData.data.owner) {
      apiData.data.owner = apiData.data.owner.replace(
        "https://t.me/SUBHXCOSMO",
        "https://t.me/cyberx4chat"
      );
    }

    // 🔥 REMOVE DUPLICATES (based on mobile + name)
    if (apiData.data?.result?.results) {
      const uniqueResults = [];
      const seen = new Set();

      for (const item of apiData.data.result.results) {
        const key = item.mobile + "_" + item.name;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(item);
        }
      }

      apiData.data.result.results = uniqueResults;
      apiData.data.result.count = uniqueResults.length;
    }

    return res.json({
      success: true,
      owner: OWNER_NAME,
      key_status: KEYS_DB[key].status,
      expiry_date: KEYS_DB[key].expiry,
      data: apiData.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'External API Error',
      error: error.message,
      owner: OWNER_NAME
    });
  }
});

// ================= HOME ROUTE =================
app.get('/', (req, res) => {
  res.json({
    message: 'API Running Successfully 🚀',
    owner: OWNER_NAME,
    telegram: "https://t.me/cyberx4chat"
  });
});

// ================= EXPORT =================
module.exports = app;
