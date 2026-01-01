// api/data.js — рабочая версия для Vercel

let storage = {};

// Инициализация персонажей
function initChar(charId) {
    if (!storage[charId]) {
        storage[charId] = {
            tasks: {},
            timers: {}
        };
        // Задания (ID 1–40)
        for (let i = 1; i <= 40; i++) {
            storage[charId].tasks[i] = { completed: false, count: 0 };
        }
        // Таймеры
        const timerNames = ["Дрессировка", "Почта", "Реднеки", "Кармит", "Тир"];
        timerNames.forEach(name => {
            storage[charId].timers[name] = { active: false, startedAt: 0 };
        });
    }
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { char = 'karl' } = req.query || {};
        initChar(char);

        if (req.method === 'GET') {
            res.status(200).json(storage);
            return;
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            const { method } = body;

            switch (method) {
                case 'updateTask': {
                    const { taskId, completed, count } = body;
                    if (storage[char]?.tasks?.[taskId] !== undefined) {
                        storage[char].tasks[taskId] = { completed, count };
                    }
                    break;
                }
                case 'resetTasks': {
                    for (let i = 1; i <= 40; i++) {
                        storage[char].tasks[i] = { completed: false, count: 0 };
                    }
                    break;
                }
                case 'startTimer': {
                    const { timerName } = body;
                    if (storage[char]?.timers?.[timerName] !== undefined) {
                        storage[char].timers[timerName] = { active: true, startedAt: Date.now() };
                    }
                    break;
                }
                case 'stopTimer': {
                    const { timerName } = body;
                    if (storage[char]?.timers?.[timerName] !== undefined) {
                        storage[char].timers[timerName].active = false;
                    }
                    break;
                }
                case 'resetTimer': {
                    const { timerName } = body;
                    if (storage[char]?.timers?.[timerName] !== undefined) {
                        storage[char].timers[timerName] = { active: false, startedAt: 0 };
                    }
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
