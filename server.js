/* ==========================================================================
   EduGrade 360 - Backend Server Engine (Express + MongoDB / JSON Storage)
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Try loading dotenv if present
try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for single-page web app
app.use(express.static(__dirname));

// --- Data Persistence Storage Layer ---
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

let dbData = null;
let useMongo = false;
let mongoose = null;
let ExamModel = null;

// Try MongoDB Connection if URI provided
if (MONGODB_URI) {
  try {
    mongoose = require('mongoose');
    const examSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      title: String,
      groupName: String,
      trackId: String,
      examinerId: String,
      teacherId: String,
      uniqueKey: String,
      status: String,
      createdAt: String,
      step1StartedAt: String,
      step2StartedAt: String,
      endedAt: String,
      joinedStudents: Array,
      securityAlerts: Array
    }, { timestamps: true, strict: false });

    ExamModel = mongoose.model('Exam', examSchema);

    mongoose.connection.on('connected', () => {
      useMongo = true;
      console.log('✅ Connected to MongoDB Atlas Database successfully!');
    });

    mongoose.connection.on('error', (err) => {
      console.warn('⚠️ MongoDB connection error:', err.message);
      useMongo = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost. Falling back to local JSON database.');
      useMongo = false;
    });

    mongoose.connect(MONGODB_URI)
      .then(() => {
        useMongo = true;
      })
      .catch(err => {
        console.warn('⚠️ MongoDB connection failed. Falling back to local JSON database file (data/db.json). Reason:', err.message);
        useMongo = false;
      });
  } catch (err) {
    console.warn('⚠️ Mongoose module not loaded. Falling back to local JSON database file.');
    useMongo = false;
  }
}

// Read local JSON store helper
function readLocalStore() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading db.json, returning empty store:', e.message);
    }
  }
  return null;
}

// Write local JSON store helper
function writeLocalStore(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing db.json:', e.message);
  }
}

// --- API Endpoints ---

// 1. Health Check & Mode Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EduGrade 360 Server',
    storageMode: useMongo ? 'MongoDB' : 'Local JSON File (data/db.json)',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. GET Full Store State
app.get('/api/store', async (req, res) => {
  try {
    if (useMongo && ExamModel) {
      const mongoExams = await ExamModel.find({}).lean();
      const local = readLocalStore() || {};
      if (mongoExams && mongoExams.length > 0) {
        local.exams = mongoExams.map(e => {
          delete e._id;
          delete e.__v;
          return e;
        });
      }
      return res.json(local);
    }
    const store = readLocalStore();
    return res.json(store || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. POST Sync / Update Full Store State
app.post('/api/store', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: 'No data provided' });

    writeLocalStore(payload);

    if (useMongo && ExamModel && Array.isArray(payload.exams)) {
      for (const ex of payload.exams) {
        await ExamModel.findOneAndUpdate({ id: ex.id }, ex, { upsert: true, new: true });
      }
    }

    return res.json({ success: true, message: 'Store synchronized successfully.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. POST Reset Store
app.post('/api/store/reset', async (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    if (useMongo && ExamModel) {
      await ExamModel.deleteMany({});
    }
    return res.json({ success: true, message: 'Store reset to initial state.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5. POST Create Exam Session
app.post('/api/exams/create', async (req, res) => {
  try {
    const examData = req.body;
    if (!examData || !examData.id) {
      return res.status(400).json({ error: 'Invalid exam data' });
    }

    const store = readLocalStore() || { exams: [] };
    store.exams = store.exams || [];
    store.exams.unshift(examData);
    writeLocalStore(store);

    if (useMongo && ExamModel) {
      await ExamModel.create(examData);
    }

    res.json({ success: true, exam: examData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6. POST Update Exam Status
app.post('/api/exams/status', async (req, res) => {
  try {
    const { examId, status } = req.body;
    if (!examId || !status) {
      return res.status(400).json({ error: 'examId and status required' });
    }

    const store = readLocalStore() || { exams: [] };
    const exam = (store.exams || []).find(e => e.id === examId);

    if (exam) {
      exam.status = status;
      const now = new Date().toISOString();
      if (status === 'step1_active' && !exam.step1StartedAt) exam.step1StartedAt = now;
      if (status === 'step2_active' && !exam.step2StartedAt) exam.step2StartedAt = now;
      if (status === 'completed') exam.endedAt = now;
      writeLocalStore(store);

      if (useMongo && ExamModel) {
        await ExamModel.findOneAndUpdate({ id: examId }, exam, { upsert: true });
      }
    }

    res.json({ success: true, status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 7. POST Student Join Exam Room
app.post('/api/exams/join', async (req, res) => {
  try {
    const { name, uniqueKey } = req.body;
    if (!name || !uniqueKey) {
      return res.status(400).json({ success: false, message: 'Name and Key required' });
    }

    const store = readLocalStore() || { exams: [] };
    const exam = (store.exams || []).find(e => e.uniqueKey && e.uniqueKey.toUpperCase() === uniqueKey.trim().toUpperCase());

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Imtihon xonasi topilmadi! Kalitni qayta tekshiring.' });
    }

    let student = exam.joinedStudents.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
    if (!student) {
      student = {
        id: 'std_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: name.trim(),
        joinedAt: new Date().toISOString(),
        l1Answers: null,
        l1Grade: null,
        l2TechnicalGrade: null,
        teacherProjectGrade: null,
        finalScorePct: 0,
        status: 'joined'
      };
      exam.joinedStudents.push(student);
      writeLocalStore(store);

      if (useMongo && ExamModel) {
        await ExamModel.findOneAndUpdate({ id: exam.id }, exam, { upsert: true });
      }
    }

    res.json({ success: true, examId: exam.id, student });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Catch-all route to serve SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🚀 EduGrade 360 Backend Server active!`);
  console.log(` 🌐 Server URL: http://localhost:${PORT}`);
  console.log(` 📦 Storage Mode: ${useMongo ? 'MongoDB' : 'Local JSON File (data/db.json)'}`);
  console.log(`=======================================================`);
});
