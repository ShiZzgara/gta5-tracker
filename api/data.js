let storage = {
    tasks: {},
    timers: {}
};

function init() {
    if (Object.keys(storage.tasks).length === 0) {
        for (let i = 1; i <= 40; i++) {
            storage.tasks[i] = { completed: false, count: 0 };
        }
        ["Дрессировка", "Почта", "Реднеки", "Кармит", "Тир"].forEach(name => {
            storage.timers[name] = { active: false, startedAt: 0 };
        });
    }
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
        init();

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
                    if (storage.tasks[taskId] !== undefined) {
                        storage.tasks[taskId] = { completed, count };
                    }
                    break;
                }
                case 'resetTasks': {
                    for (let i = 1; i <= 40; i++) {
                        storage.tasks[i] = { completed: false, count: 0 };
                    }
                    break;
                }
                case 'startTimer': {
                    const { timerName } = body;
                    if (storage.timers[timerName] !== undefined) {
                        storage.timers[timerName] = { active: true, startedAt: Date.now() };
                    }
                    break;
                }
                case 'stopTimer': {
                    const { timerName } = body;
                    if (storage.timers[timerName] !== undefined) {
                        storage.timers[timerName].active = false;
                    }
                    break;
                }
                case 'resetTimer': {
                    const { timerName } = body;
                    if (storage.timers[timerName] !== undefined) {
                        storage.timers[timerName] = { active: false, startedAt: 0 };
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
