const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

async function extractTextFromPDF(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;
    const resumeText = await extractTextFromPDF(req.file.buffer);

    const prompt = `You are an expert ATS resume analyzer.

Analyze this resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond ONLY in this exact JSON format, nothing else:
{
  "matchScore": 75,
  "matchingKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "keywordSuggestions": ["keyword1", "keyword2"],
  "bulletImprovements": [
    {"original": "old bullet", "improved": "new bullet with numbers"},
    {"original": "old bullet", "improved": "new bullet with numbers"},
    {"original": "old bullet", "improved": "new bullet with numbers"}
  ],
  "atsIssues": ["issue1", "issue2"],
  "overallFeedback": "Your feedback here"
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));