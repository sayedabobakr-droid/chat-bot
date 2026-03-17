require('dotenv').config();
const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());

// جعل المجلد الحالي متاحاً للملفات الثابتة
app.use(express.static(__dirname));

// إعداد الاتصال بموديل Qwen عبر منصة Hugging Face
const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN, 
});

// مسار معالجة الرسائل
app.post('/api/chat', async (req, res) => {
    try {
        const chatCompletion = await client.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct:together",
            messages: [
                { role: "system", content: "أنت مساعد تعليمي خبير ومفيد للطلاب في منصة TAIPING STUDY HARD." },
                { role: "user", content: req.body.prompt },
            ],
            max_tokens: 500,
        });

        res.json({ text: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("خطأ في السيرفر:", error.message);
        res.status(500).json({ text: "حدث خطأ في الاتصال بالذكاء الاصطناعي، حاول مرة أخرى." });
    }
});

// تقديم صفحة الشات عند طلب الرابط الرئيسي للمجلد
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تصدير التطبيق ليعمل على سيرفرات Vercel
module.exports = app;

// تشغيل السيرفر محلياً للتجربة (اختياري)
const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}