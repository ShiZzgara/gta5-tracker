// api/data.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

// В реальном проекте используйте базу (PostgreSQL, Firestore), но для простоты — файл на диске (только на Vercel Edge Functions это не работает)
// Поэтому используем in-memory storage (данные сбросятся при "cold start", но Vercel бесплатно не даёт БД без настройки)
// → Для настоящего решения НУЖНА БД. Но для демонстрации — временный in-memory.

let storage = {};

// Инициализация шаблонов
const TASKS = Array.from({ length: 40 }, (_, i) => ({ id: i + 1 }));
const TIMERS = ["Дрессировка", "Почта", "Реднеки", "Кармит", "Тир"];

function initChar(charId) {
    if (!storage[charId]) {
        storage[charId] = {
            tasks: {},
            timers: {}
        };
        TASKS.forEach(task => {
            storage[charId].tasks[task.id] = { completed: false, count: 0 };
        });
        TIMERS.forEach(name => {
            storage[charId].timers[name] = { active: false, startedAt: 0 };
        });
    }
}

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const { char = 'karl' } = req.query;
            ['karl', 'rick', 'erik'].forEach(c => initChar(c));
            res.status(200).json(storage);
            return;
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            const { method, char = 'karl' } = body;
            initChar(char);

            switch (method) {
                case 'updateTask': {
                    const { taskId, completed, count } = body;
                    storage[char].tasks[taskId] = { completed, count };
                    break;
                }
                case 'resetTasks': {
                    TASKS.forEach(task => {
                        storage[char].tasks[task.id] = { completed: false, count: 0 };
                    });
                    break;
                }
                case 'startTimer': {
                    const { timerName } = body;
                    storage[char].timers[timerName] = { active: true, startedAt: Date.now() };
                    break;
                }
                case 'stopTimer': {
                    const { timerName } = body;
                    const timer = storage[char].timers[timerName];
                    if (timer) timer.active = false;
                    break;
                }
                case 'resetTimer': {
                    const { timerName } = body;
                    storage[char].timers[timerName] = { active: false, startedAt: 0 };
                    break;
                }
            }

            res.status(200).json({ ok: true });
            return;
        }

        res.status(405).end();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Error' });
    }
}
