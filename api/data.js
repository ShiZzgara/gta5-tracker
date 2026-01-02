// api/data.js — поддержка нескольких персонажей по пути

let storage = {};

// Инициализация персонажа
function initChar(charId) {
    if (!storage[charId]) {
        storage[charId] = {
            tasks: {},
            timers: {}
        };
        // Задания 1–40
        for (let i = 1; i <= 40; i++) {
            storage[charId].tasks[i] = { completed: false, count: 0 };
        }
        // Таймеры
        const names = ["Дрессировка", "Почта", "Реднеки", "Кармит", "Тир"];
        names.forEach(name => {
            storage[charId].timers[name] = { active: false, startedAt: 0 };
        });
    }
}

// Определяем персонажа по URL-пути
function getCharFromPath(path) {
    if (path === '/rick') return 'rick';
    if (path === '/erik') return 'erik';
    return 'karl'; // по умолчанию
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Определяем персонажа по URL
        const charId = getCharFromPath(req.url.split('?')[0]);
        initChar(charId);

        if (req.method === 'GET') {
            res.status(200).json(storage[charId]);
            return;
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            const { method } = body;

            switch (method) {
                case 'updateTask': {
                    const { taskId, completed, count } = body;
                    if (storage[charId].tasks[taskId] !== undefined) {
                        storage[charId].tasks[taskId] = { completed, count };
                    }
                    break;
                }
                case 'resetTasks': {
                    for (let i = 1; i <= 40; i++) {
                        storage[charId].tasks[i] = { completed: false, count: 0 };
                    }
                    break;
                }
                case 'startTimer': {
                    const { timerName } = body;
                    if (storage[charId].timers[timerName] !== undefined) {
                        storage[charId].timers[timerName] = { active: true, startedAt: Date.now() };
                    }
                    break;
                }
                case 'stopTimer': {
                    const { timerName } = body;
                    if (storage[charId].timers[timerName] !== undefined) {
                        storage[charId].timers[timerName].active = false;
                    }
                    break;
                }
                case 'resetTimer': {
                    const { timerName } = body;
                    if (storage[charId].timers[timerName] !== undefined) {
                        storage[charId].timers[timerName] = { active: false, startedAt: 0 };
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
