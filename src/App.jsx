import React, { useEffect, useMemo, useState } from "react";

// Storage helpers
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };

const CATEGORIES = [
  { id: "thinking", title: "Мышление", desc: "Структура, логика, причинно‑следственные связи." },
  { id: "business", title: "Бизнес", desc: "Как устроены компании, модели дохода, ценность." },
  { id: "finance", title: "Финансы", desc: "Деньги, бюджеты, инвестиции, ответственность." },
  { id: "psychology", title: "Психология", desc: "Поведение, мотивация, коммуникация, воля." },
];

const STATUS_TITLES = [
  { min: 0, name: "Новичок" },
  { min: 100, name: "Наблюдатель" },
  { min: 300, name: "Аналитик" },
  { min: 600, name: "Мыслитель" },
  { min: 900, name: "Практик" },
  { min: 1300, name: "Предприниматель" },
  { min: 1800, name: "Архитектор" },
];

const INITIAL_LIBRARY = [
  { id: "t1", category: "thinking", kind: "article", title: "Базовая логика: как строить причинно‑следственные связи", duration: 10 },
  { id: "b1", category: "business", kind: "video", title: "Что такое ценность и почему люди платят", duration: 8, description: "Модель ценности и восприятие полезности клиентом." },
  { id: "f1", category: "finance", kind: "game", title: "Бюджет на месяц: квест о приоритетах", duration: 12 },
  { id: "p1", category: "psychology", kind: "podcast", title: "Воля и дисциплина: как держать курс", duration: 9 },
  { id: "b2", category: "business", kind: "article", title: "Как устроены бизнес‑модели: подписка, разовая оплата, freemium", duration: 11 },
  {
    id: "b_founder", category: "business", kind: "article", duration: 14,
    title: "Как мыслит предприниматель: от идеи до первых продаж",
    description: "Мини-урок без видео: путь предпринимателя, типичные ошибки и фокус на ценности.",
    content: [
      "Предприниматель замечает несоответствие между тем, как есть, и как должно быть. Он ищет болевые точки и формулирует конкретную задачу, которую можно решить продуктом.",
      "Дальше — быстрые эксперименты: разговоры с 5–10 клиентами, прототип в Figma или Notion, тест через пилот без кода. Цель — не сделать идеально, а проверить, есть ли ценность.",
      "Первые продажи важнее любых метрик. Они показывают, что проблема реальна и решение достаточно хорошо, чтобы за него платили. Без этого стартап — хобби.",
      "Частые ошибки: делать продукт для себя, а не для клиентов; рано оптимизировать; избегать разговоров с пользователями; недооценивать unit-экономику и повторяемость продаж.",
      "Фокус на ценности и обратной связи даёт энергию и снижает риск. Маленькие циклы обучения → рост продукта → первые амбассадоры."
    ],
  },
  { id: "t2", category: "thinking", kind: "quiz", title: "Критическое мышление: проверка фактов", duration: 6 },
];

const INITIAL_QUIZZES = [
  {
    id: "q_thinking_1",
    category: "thinking",
    title: "Причинно‑следственные связи",
    questions: [
      { q: "Что сначала: корреляция или причинность?", options: ["Корреляция доказывает причинность", "Причинность предполагает механизм", "Это одно и то же"], a: 1, explain: "Причинность — наличие механизма A→B. Корреляция — совместное изменение." },
      { q: "Какой вопрос сильнее выявляет причину?", options: ["Кому это выгодно?", "Что было бы, если убрать фактор X?", "Насколько это популярно?"], a: 1, explain: "Контрфактический подход (убрать X) оценивает вклад фактора." },
    ],
  },
  {
    id: "q_finance_1",
    category: "finance",
    title: "Финансовая грамотность: базовый квест",
    questions: [
      { q: "Доход 30 000₽, расходы 20 000₽. Что сначала?", options: ["Купить гаджет в рассрочку", "Сформировать подушку 3–6 месяцев", "Взять микрокредит"], a: 1, explain: "Подушка — фундамент безопасности и свободы решений." },
      { q: "Что такое сложный процент?", options: ["Процент на вклад", "Процент на вклад и ранее начисленные проценты", "Комиссия банка"], a: 1, explain: "Проценты начисляются на проценты — рост ускоряется." },
    ],
  },
  {
    id: "q_business_1",
    category: "business",
    title: "Ценность и клиенты",
    questions: [
      { q: "Что покупает клиент на самом деле?", options: ["Функции", "Решение своей задачи/боли", "Рекламу"], a: 1, explain: "Платят за решённую задачу и результат." },
      { q: "MVP — это…", options: ["Сырой продукт", "Минимальная версия для проверки гипотезы", "Скидка 50%"], a: 1, explain: "Быстрый тест ценности до больших затрат." },
    ],
  },
];

const SEQUENTIAL_QUESTS = [
  {
    id: "intellect_path",
    title: "Интеллектуальный путь",
    steps: [
      {
        id: "iq_step1",
        title: "Наблюдаем систему",
        description: "Учимся видеть связи и формулировать гипотезы.",
        questions: [
          { q: "Что важно сделать сначала, видя новую систему?", options: ["Выбрать любимую часть", "Собрать карту элементов и потоков", "Сразу тестировать гипотезу"], a: 1, explain: "Карта элементов и потоков даёт целостность — без неё решения слепы." },
          { q: "Как понять, что гипотеза пригодна для теста?", options: ["В ней красивое описание", "Есть наблюдаемая метрика и способ измерения", "Её поддерживает знакомый"], a: 1, explain: "Без измерения гипотеза не проверяется и остаётся мнением." },
        ],
      },
      {
        id: "iq_step2",
        title: "Тестируем решения",
        description: "Малые эксперименты и обратная связь.",
        questions: [
          { q: "Что должно быть у эксперимента?", options: ["Сложный интерфейс", "Гипотеза, план и критерий успеха", "Только отчёт"], a: 1, explain: "Ясный критерий успеха позволяет принять решение после теста." },
          { q: "Сколько итераций нужно, чтобы увидеть паттерн?", options: ["1", "3–5", "10"], a: 1, explain: "Несколько повторений показывают тренд и снижают шум." },
        ],
      },
      {
        id: "iq_step3",
        title: "Делаем выводы",
        description: "Интерпретация данных и масштабирование.",
        questions: [
          { q: "Если результат сомнителен, что делать?", options: ["Остановить проект", "Уточнить метрики и повторить", "Игнорировать"], a: 1, explain: "Уточнённые метрики и повтор дают уверенность и новое знание." },
          { q: "Когда масштабировать?", options: ["Когда интересно", "Когда повторяемый результат подтверждён", "После первой удачи"], a: 1, explain: "Повторяемость снижает риск и даёт основу для роста." },
        ],
      },
    ],
  },
];

const INITIAL_USERS = [
  { id: "me", name: "Ты", points: 0, status: "Новичок", role: "ученик" },
  { id: "arsen", name: "Arsen", points: 880, status: "Архитектор", role: "ментор" },
  { id: "mira", name: "Mira", points: 760, status: "Практик", role: "аналитик" },
  { id: "leo", name: "Leo", points: 640, status: "Аналитик", role: "исследователь" },
];

const SKILL_WEIGHTS = { thinking: 1, business: 1, finance: 1, psychology: 1 };

const Page = ({ children }) => (
  <div className="space-y-6">{children}</div>
);

const Card = ({ children, theme = "dark" }) => (
  <div className={`rounded-2xl border p-6 ${theme === "dark" ? "border-zinc-800 bg-zinc-950/60" : "border-zinc-200 bg-white shadow-sm"}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", theme = "dark" }) => {
  const styles = theme === "dark"
    ? {
        primary: "border-zinc-700 bg-zinc-900 hover:bg-zinc-800",
        ghost: "border-zinc-800 bg-transparent hover:bg-zinc-900",
      }
    : {
        primary: "border-zinc-300 bg-zinc-100 hover:bg-zinc-200",
        ghost: "border-zinc-200 bg-transparent hover:bg-zinc-100",
      };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

const Progress = ({ value, tone = "emerald", theme = "dark" }) => {
  const colors = tone === "emerald" ? "from-emerald-400 to-emerald-600" : "from-zinc-400 to-zinc-600";
  const track = theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200";
  return (
    <div className={`w-full h-2 rounded-full border overflow-hidden ${track}`}>
      <div className={`h-2 rounded-full bg-gradient-to-r ${colors}`} style={{width: `${Math.min(100, Math.max(0, value))}%`}}/>
    </div>
  );
};

const inputClass = (theme) =>
  `${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"} rounded-xl p-2`;

function useModel() {
  const [profile, setProfile] = useState(load("profile", { name: "Ученик", points: 0, skills: { thinking: 0, business: 0, finance: 0, psychology: 0 }, completed: {}, quizzes: {}, sequences: {} }));
  const [tab, setTab] = useState(load("tab", "home"));
  const [filter, setFilter] = useState("all");

  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const queryAdmin = url?.searchParams.get('admin') === '1';
  const [isAdmin, setIsAdmin] = useState(load('adminFlag', false) || queryAdmin);

  const [libraryExtra, setLibraryExtra] = useState(load('libraryExtra', []));
  const [quizzesExtra, setQuizzesExtra] = useState(load('quizzesExtra', []));
  const [users, setUsers] = useState(load('users', INITIAL_USERS));

  const status = useMemo(() => (STATUS_TITLES.filter(x => profile.points >= x.min).pop()?.name || STATUS_TITLES[0].name), [profile.points]);

  useEffect(() => save("profile", profile), [profile]);
  useEffect(() => save("tab", tab), [tab]);
  useEffect(() => save('adminFlag', isAdmin), [isAdmin]);
  useEffect(() => save('libraryExtra', libraryExtra), [libraryExtra]);
  useEffect(() => save('quizzesExtra', quizzesExtra), [quizzesExtra]);
  useEffect(() => save('users', users), [users]);

  useEffect(() => {
    setUsers(prev => prev.map(u => u.id === 'me' ? { ...u, points: profile.points, status } : u));
  }, [profile.points, status]);

  const completeLesson = (lesson) => {
    if (profile.completed[lesson.id]) return;
    const delta = 20;
    setProfile(p => ({ ...p, points: p.points + delta, skills: { ...p.skills, [lesson.category]: p.skills[lesson.category] + delta * SKILL_WEIGHTS[lesson.category] }, completed: { ...p.completed, [lesson.id]: true }, }));
  };

  const submitQuiz = (quiz, answers) => {
    const correct = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
    const total = quiz.questions.length;
    const delta = correct * 30;
    setProfile(p => ({ ...p, points: p.points + delta, skills: { ...p.skills, [quiz.category]: p.skills[quiz.category] + delta }, quizzes: { ...p.quizzes, [quiz.id]: { correct, total } }, }));
    return { correct, total, delta };
  };

  const submitSequence = (sequenceId, stepId, quiz, answers) => {
    const correct = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
    const total = quiz.questions.length;
    const delta = correct * 25;
    setProfile(p => ({
      ...p,
      points: p.points + delta,
      skills: { ...p.skills, [quiz.category || 'thinking']: p.skills[quiz.category || 'thinking'] + delta },
      sequences: {
        ...p.sequences,
        [sequenceId]: {
          ...(p.sequences?.[sequenceId] || {}),
          [stepId]: { correct, total },
        }
      }
    }));
    return { correct, total, delta };
  };

  const addUser = (u) => { if (!u.id || !u.name) return; setUsers(arr => [...arr.filter(x=>x.id!==u.id), u]); };
  const removeUser = (id) => setUsers(arr => arr.filter(u => u.id !== id));
  const updateUserPoints = (id, points) => setUsers(arr => arr.map(u => u.id === id ? { ...u, points } : u));

  const resetAll = () => { localStorage.clear(); window.location.reload(); };

  return { profile, status, tab, setTab, filter, setFilter, completeLesson, submitQuiz, submitSequence, resetAll, isAdmin, setIsAdmin, libraryExtra, setLibraryExtra, quizzesExtra, setQuizzesExtra, users, addUser, removeUser, updateUserPoints };
}

function ThemeToggle({ theme, setTheme }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button theme={theme} variant="ghost" onClick={() => setTheme(next)}>
      {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
    </Button>
  );
}

function Nav({ tab, setTab, points, status, isAdmin, theme, setTheme }) {
  const items = [
    { id: "home", label: "Главная" },
    { id: "library", label: "Библиотека" },
    { id: "quests", label: "Квесты" },
    { id: "profile", label: "Профиль" },
    { id: "leaderboard", label: "Сообщество" },
  ];
  if (isAdmin) items.push({ id: 'admin', label: 'Админ' });
  const border = theme === "dark" ? "border-zinc-800" : "border-zinc-200";
  const textMuted = theme === "dark" ? "text-zinc-400" : "text-zinc-600";
  const textStrong = theme === "dark" ? "text-zinc-100" : "text-zinc-900";
  return (
    <div className={`flex items-center justify-between mb-8 border-b pb-4 ${border}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white"/>
        <div className="text-lg tracking-tight font-semibold">NOESIS</div>
      </div>
      <div className="flex items-center gap-2">
        {items.map(i => (
          <Button theme={theme} key={i.id} onClick={() => setTab(i.id)} variant={tab===i.id?"":"ghost"}>{i.label}</Button>
        ))}
      </div>
      <div className={`flex items-center gap-4 text-sm ${textMuted}`}>
        <div className="hidden sm:block">Статус: <span className={textStrong}>{status}</span></div>
        <div>Очки: <span className={textStrong}>{points}</span></div>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
}

function QuoteOfDay() {
  const quotes = [
    { author: "Илон Маск", text: "Неудача — это вариант. Если что-то не терпит неудачу, вы недостаточно инновационны." },
    { author: "Стив Джобс", text: "Единственный способ делать великую работу — любить то, что ты делаешь." },
    { author: "Рей Далио", text: "Боль + Размышление = Прогресс." },
    { author: "Питер Тиль", text: "Лучше рискнуть и создать что-то великое, чем всю жизнь делать посредственное." },
  ];
  const [q, setQ] = useState(quotes[Math.floor(Math.random()*quotes.length)]);
  useEffect(() => { const t = setInterval(()=> setQ(quotes[Math.floor(Math.random()*quotes.length)]), 1000*60*60*6); return ()=>clearInterval(t); }, []);
  return (
    <div className="text-center mb-10">
      <p className="text-zinc-300 italic text-lg mb-2">“{q.text}”</p>
      <p className="text-zinc-500 text-sm">— {q.author}</p>
    </div>
  );
}

function Home({ setTab, theme }) {
  return (
    <Page>
      <div className="text-center mb-12">
        <div className="text-5xl font-semibold mb-4">Будь лучше вчерашнего себя</div>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">Платформа для развития интеллекта и мышления. Здесь ты узнаёшь, как устроены бизнес, деньги, психология и логика мира. Каждый шаг делает тебя взрослее, осознаннее и точнее.</p>
        <QuoteOfDay />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card theme={theme}>
          <div className="text-2xl mb-2">Библиотека знаний</div>
          <p className="text-zinc-400 mb-4">Статьи, видео, подкасты, курсы и игры. Всё, чтобы системно понимать, как устроен мир и бизнес.</p>
          <Button theme={theme} onClick={() => setTab("library")}>Перейти</Button>
        </Card>
        <Card theme={theme}>
          <div className="text-2xl mb-2">Интеллектуальные квесты</div>
          <p className="text-zinc-400 mb-4">Задачи и вопросы, которые проверяют мышление и дают мгновенную обратную связь.</p>
          <Button theme={theme} onClick={() => setTab("quests")}>Начать квест</Button>
        </Card>
        <Card theme={theme}>
          <div className="text-2xl mb-2">Профиль развития</div>
          <p className="text-zinc-400 mb-4">Следи за ростом навыков и статусом. Видно, как ты становишься лучше вчерашнего себя.</p>
          <Button theme={theme} onClick={() => setTab("profile")}>Мой прогресс</Button>
        </Card>
        <Card theme={theme}>
          <div className="text-2xl mb-2">Сообщество</div>
          <p className="text-zinc-400 mb-4">Умная среда единомышленников. Без шума и показухи — только развитие и идеи.</p>
          <Button theme={theme} onClick={() => setTab("leaderboard")}>Посмотреть участников</Button>
        </Card>
      </div>
    </Page>
  );
}

function Library({ lessons, filter, setFilter, onStart, isCompleted, onOpen, theme }) {
  const filtered = lessons.filter(l => filter === "all" || l.category === filter);
  return (
    <Page>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">Библиотека</div>
        <div className="flex gap-2">
          <Button theme={theme} onClick={() => setFilter("all")} variant={filter==="all"?"":"ghost"}>Все</Button>
          {CATEGORIES.map(c => (<Button theme={theme} key={c.id} onClick={() => setFilter(c.id)} variant={filter===c.id?"":"ghost"}>{c.title}</Button>))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(l => (
          <Card key={l.id} theme={theme}>
            <div className="text-lg font-medium mb-1">{l.title}</div>
            <div className="text-xs text-zinc-400 mb-3">{CATEGORIES.find(c=>c.id===l.category)?.title} • {l.kind} • {l.duration} мин</div>
            {l.description && <div className="text-sm text-zinc-400 mb-3">{l.description}</div>}
            {l.source_url && <a href={l.source_url} target="_blank" className="underline text-zinc-300 mb-3 inline-block" rel="noreferrer">Источник</a>}
            <div className="flex items-center gap-2">
              <Button theme={theme} onClick={() => onOpen(l)}>{isCompleted(l.id) ? "Открыть урок" : "Начать"}</Button>
              {isCompleted(l.id) ? (<div className="text-emerald-400 text-sm">Завершено</div>) : (<Button theme={theme} variant="ghost" onClick={() => onStart(l)}>Отметить изученным</Button>)}
              <Button theme={theme} variant="ghost">В избранное</Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 text-zinc-500 text-sm">*В релизе: карточка источника, конспект, дискуссия, ссылки на открытые материалы и наш контент.</div>
    </Page>
  );
}

function Quests({ quizzes, sequential, onSubmit, onSubmitSequence, profile, selected, theme }) {
  const [current, setCurrent] = useState(quizzes[0]?.id || null);
  const quiz = useMemo(() => quizzes.find(q => q.id === current), [current, quizzes]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => { setAnswers({}); setResult(null); }, [current]);
  useEffect(() => { if (selected) setCurrent(selected); }, [selected]);
  const optionSelected = theme === "dark" ? "border-zinc-500 bg-zinc-900" : "border-zinc-400 bg-zinc-100";
  const optionIdle = theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white";
  return (
    <Page>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">Квесты</div>
        <div className="flex gap-2">{quizzes.map(q => (<Button theme={theme} key={q.id} onClick={() => setCurrent(q.id)} variant={current===q.id?"":"ghost"}>{q.title}</Button>))}</div>
      </div>
      {quiz && (
        <Card theme={theme}>
          <div className="text-lg font-medium mb-2">{quiz.title}</div>
          <div className="text-xs text-zinc-400 mb-4">Категория: {CATEGORIES.find(c=>c.id===quiz.category)?.title}</div>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={idx}>
                <div className="mb-2">{idx+1}. {q.q}</div>
                <div className="grid gap-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${answers[idx]===i? optionSelected : optionIdle}`}>
                      <input type="radio" name={`q${idx}`} className="accent-white" onChange={() => setAnswers(a => ({...a, [idx]: i}))} checked={answers[idx]===i} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button theme={theme} onClick={() => setResult(onSubmit(quiz, Object.values(answers)))}>Отправить</Button>
              {profile.quizzes[quiz.id] && (<div className="text-zinc-400 text-sm">Результат: {profile.quizzes[quiz.id].correct}/{profile.quizzes[quiz.id].total}</div>)}
            </div>
            {result && (<div className="text-emerald-400 text-sm">+{result.delta} очков • Верно {result.correct}/{result.total}</div>)}
          </div>
        </Card>
      )}

      <div className="mt-8">
        <div className="text-xl mb-3">Последовательные квесты</div>
        <div className="grid md:grid-cols-2 gap-4">
          {sequential.map(seq => (
            <Card key={seq.id} theme={theme}>
              <div className="text-lg mb-2">{seq.title}</div>
              <div className="space-y-3">
                {seq.steps.map((step, idx) => {
                  const done = profile.sequences?.[seq.id]?.[step.id];
                  const locked = idx > 0 && !profile.sequences?.[seq.id]?.[seq.steps[idx-1].id];
                  return (
                    <SequentialStep
                      key={step.id}
                      step={step}
                      locked={locked}
                      result={done}
                      onSubmit={(answers)=>onSubmitSequence(seq.id, step, answers)}
                      theme={theme}
                    />
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
}

function SequentialStep({ step, locked, onSubmit, result, theme }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [localResult, setLocalResult] = useState(null);

  useEffect(() => { setAnswers({}); setLocalResult(null); }, [open]);

  const submit = () => {
    const r = onSubmit(Object.values(answers));
    setLocalResult(r);
    setOpen(false);
  };

  const container = locked
    ? (theme === "dark" ? 'border-zinc-900 text-zinc-500' : 'border-zinc-200 text-zinc-400')
    : (theme === "dark" ? 'border-zinc-800' : 'border-zinc-200');
  const questionBg = theme === "dark" ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200";
  const optionIdle = theme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white";
  return (
    <div className={`p-3 rounded-xl border ${container}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{step.title}</div>
          <div className="text-xs text-zinc-500">{step.description}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {result && <span className="text-emerald-400">{result.correct}/{result.total}</span>}
          <Button theme={theme} variant="ghost" onClick={()=>!locked && setOpen(o=>!o)}>{locked ? 'Закрыто' : (open ? 'Скрыть' : 'Пройти')}</Button>
        </div>
      </div>
      {(open && !locked) && (
        <div className="mt-3 space-y-3">
          {step.questions.map((q, idx) => (
            <div key={idx} className={`${questionBg} border rounded-xl p-3`}>
              <div className="text-sm mb-2">{q.q}</div>
              <div className="grid gap-2">
                {q.options.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${answers[idx]===i?"border-emerald-500 bg-emerald-500/10":optionIdle}`}>
                    <input type="radio" name={`${step.id}_${idx}`} className="accent-emerald-400" checked={answers[idx]===i} onChange={()=>setAnswers(a=>({...a, [idx]: i}))}/>
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Button theme={theme} onClick={submit}>Ответить</Button>
            {localResult && <span className="text-emerald-400 text-sm">+{localResult.delta} очков</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({ profile, status, setTab, setFilter, setSelectedQuiz, theme }) {
  const totalSkill = Object.values(profile.skills).reduce((a,b)=>a+b,0) || 1;
  const progress = (k) => Math.round((profile.skills[k] / totalSkill) * 100);
  const achievements = computeAchievements(profile, status);
  const nextStatus = STATUS_TITLES.find(s => s.min > profile.points);
  const percentToNext = nextStatus ? Math.min(100, Math.round((profile.points / nextStatus.min) * 100)) : 100;
  return (
    <Page>
      <div className="grid md:grid-cols-3 gap-6">
        <Card theme={theme}>
          <div className="text-xl mb-1">{profile.name}</div>
          <div className="text-sm text-zinc-400 mb-2">Статус: {status} • Очки: {profile.points}</div>
          {nextStatus && (
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-1">До статуса «{nextStatus.name}» осталось {nextStatus.min - profile.points} очков</div>
              <Progress value={percentToNext} theme={theme} />
            </div>
          )}
          <div className="space-y-3">
            {CATEGORIES.map(c => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1"><span>{c.title}</span><span className="text-zinc-400">{profile.skills[c.id]} pts</span></div>
                <Progress value={progress(c.id)} theme={theme} />
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500 mt-4">Философия: <span className="text-zinc-200">быть лучше вчерашнего себя</span></div>
        </Card>
        <Card theme={theme}>
          <div className="text-lg mb-2">Достижения</div>
          <div className="space-y-2">
            {achievements.map((a,i)=>{
              const look = a.earned ? 'border-emerald-500 bg-emerald-500/10' : (theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white');
              return (
                <div key={i} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${look}`}>
                  <div>
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="text-xs text-zinc-500">{a.desc}</div>
                  </div>
                  <div className="text-lg">{a.earned ? '🥇' : '🔒'}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-zinc-500 mt-4">Собирай медальки: проходят квесты, уроки и копи очки.</div>
        </Card>
        <Card theme={theme}>
          <div className="text-lg mb-2">Рекомендации</div>
          <p className="text-zinc-400 mb-3">Усиль мышление и финансы.</p>
          <div className="flex flex-wrap gap-2">
            <Button theme={theme} onClick={() => { setFilter('thinking'); setTab('library'); }}>Карта логики</Button>
            <Button theme={theme} onClick={() => { setSelectedQuiz('q_finance_1'); setTab('quests'); }}>Квест: бюджет</Button>
            <Button theme={theme} onClick={() => { setFilter('business'); setTab('library'); }}>Видео: ценность</Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Leaderboard({ users, selectUser, selected, theme }) {
  const data = useMemo(() => [...users].sort((a,b)=>b.points-a.points), [users]);
  return (
    <Page>
      <div className="text-2xl mb-4">Лидеры</div>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((u,i) => (
          <Card key={i} theme={theme}>
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-3 text-left" onClick={()=>selectUser(u)}>
                <div className="w-10 h-10 rounded-full bg-zinc-100"/>
                <div>
                  <div className="text-lg">{i+1}. {u.name}</div>
                  <div className="text-xs text-zinc-400">Очки: {u.points}</div>
                </div>
              </button>
              <div className="text-xs text-zinc-500">{u.status}</div>
            </div>
            {selected?.id === u.id && (
              <div className="mt-3 text-sm text-zinc-300">{u.name} открыт в профиле справа.</div>
            )}
          </Card>
        ))}
      </div>
      <div className="text-zinc-500 text-sm mt-4">*Кликни по карточке, чтобы открыть страницу участника.</div>
    </Page>
  );
}

function Admin({ libraryExtra, setLibraryExtra, quizzesExtra, setQuizzesExtra, users, addUser, removeUser, updateUserPoints, theme }) {
  const [item, setItem] = useState({ id: '', category: 'thinking', kind: 'article', title: '', duration: 5, cover: '', source_url: '', description: '' });
  const [qz, setQz] = useState({ id: '', category: 'thinking', title: '', questions: [{ q: '', options: ['', '', ''], a: 0, explain: '' }] });
  const [newUser, setNewUser] = useState({ id: '', name: '', points: 0, status: 'Новичок', role: 'ученик' });

  const addLibrary = () => {
    if (!item.id || !item.title) { alert('Нужны id и title'); return; }
    setLibraryExtra(arr => [...arr.filter(x=>x.id!==item.id), item]);
    setItem({ id: '', category: 'thinking', kind: 'article', title: '', duration: 5, cover: '', source_url: '', description: '' });
  };
  const delLibrary = (id) => setLibraryExtra(arr => arr.filter(x=>x.id!==id));

  const addQuiz = () => {
    if (!qz.id || !qz.title || !qz.questions?.length) { alert('Нужны id, title и вопросы'); return; }
    setQuizzesExtra(arr => [...arr.filter(x=>x.id!==qz.id), qz]);
    setQz({ id: '', category: 'thinking', title: '', questions: [{ q: '', options: ['', '', ''], a: 0, explain: '' }] });
  };
  const delQuiz = (id) => setQuizzesExtra(arr => arr.filter(x=>x.id!==id));

  const exportJSON = () => {
    const payload = { items: libraryExtra, quizzes: quizzesExtra };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'noesis-content.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.items)) setLibraryExtra(data.items);
        if (Array.isArray(data.quizzes)) setQuizzesExtra(data.quizzes);
        alert('Импортировано');
      } catch { alert('Не удалось прочитать JSON'); }
    };
    reader.readAsText(file);
  };

  return (
    <Page>
      <div className="grid md:grid-cols-2 gap-6">
        <Card theme={theme}>
          <div className="text-xl mb-3">Добавить материал (Библиотека)</div>
          <div className="grid gap-2 text-sm">
              <input className={inputClass(theme)} placeholder="id (уникальный)" value={item.id} onChange={e=>setItem({...item, id:e.target.value})}/>
              <select className={inputClass(theme)} value={item.category} onChange={e=>setItem({...item, category:e.target.value})}>
              {CATEGORIES.map(c=>(<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
              <input className={inputClass(theme)} placeholder="kind (article / video / game / podcast / quiz)" value={item.kind} onChange={e=>setItem({...item, kind:e.target.value})}/>
              <input className={inputClass(theme)} placeholder="Заголовок" value={item.title} onChange={e=>setItem({...item, title:e.target.value})}/>
              <input type="number" className={inputClass(theme)} placeholder="Длительность (мин)" value={item.duration} onChange={e=>setItem({...item, duration:Number(e.target.value||0)})}/>
              <input className={inputClass(theme)} placeholder="Обложка (URL)" value={item.cover} onChange={e=>setItem({...item, cover:e.target.value})}/>
              <input className={inputClass(theme)} placeholder="Источник (URL)" value={item.source_url} onChange={e=>setItem({...item, source_url:e.target.value})}/>
              <textarea className={inputClass(theme)} placeholder="Короткое описание" value={item.description} onChange={e=>setItem({...item, description:e.target.value})}/>
              <div className="flex gap-2 mt-2"><Button theme={theme} onClick={addLibrary}>Добавить</Button></div>
          </div>
        </Card>
        <Card theme={theme}>
          <div className="text-xl mb-3">Добавить квест</div>
          <div className="grid gap-2 text-sm">
              <input className={inputClass(theme)} placeholder="id (уникальный)" value={qz.id} onChange={e=>setQz({...qz, id:e.target.value})}/>
              <select className={inputClass(theme)} value={qz.category} onChange={e=>setQz({...qz, category:e.target.value})}>
                {CATEGORIES.map(c=>(<option key={c.id} value={c.id}>{c.title}</option>))}
              </select>
              <input className={inputClass(theme)} placeholder="Заголовок" value={qz.title} onChange={e=>setQz({...qz, title:e.target.value})}/>
              <div className="text-xs text-zinc-400">Вопросы</div>
              {qz.questions.map((qq,idx)=>(
                <div key={idx} className="border border-zinc-800 rounded-xl p-2">
                  <input className={`${inputClass(theme)} w-full mb-2`} placeholder={`Вопрос #${idx+1}`} value={qq.q} onChange={e=>{
                    const qs=[...qz.questions]; qs[idx]={...qq, q:e.target.value}; setQz({...qz, questions:qs});
                  }}/>
                  {qq.options.map((op,i)=>(
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <input className={`${inputClass(theme)} w-full`} placeholder={`Вариант ${i+1}`} value={op} onChange={e=>{ const qs=[...qz.questions]; const opts=[...qq.options]; opts[i]=e.target.value; qs[idx]={...qq, options:opts}; setQz({...qz, questions:qs}); }} />
                      <label className="text-xs text-zinc-400 flex items-center gap-1"><input type="radio" name={`a_${idx}`} className="accent-white" checked={qq.a===i} onChange={()=>{ const qs=[...qz.questions]; qs[idx]={...qq, a:i}; setQz({...qz, questions:qs}); }}/> правильный</label>
                    </div>
                  ))}
                  <textarea className={`${inputClass(theme)} w-full`} placeholder="Объяснение ответа" value={qq.explain} onChange={e=>{ const qs=[...qz.questions]; qs[idx]={...qq, explain:e.target.value}; setQz({...qz, questions:qs}); }} />
                </div>
              ))}
              <div className="flex gap-2">
                <Button theme={theme} onClick={()=>setQz({...qz, questions:[...qz.questions, { q:'', options:['','',''], a:0, explain:'' }]})} variant="ghost">+ Вопрос</Button>
                <Button theme={theme} onClick={addQuiz}>Сохранить квест</Button>
              </div>
            </div>
          </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card theme={theme}>
          <div className="text-lg mb-2">Материалы (добавленные)</div>
          <div className="space-y-2 text-sm">
            {libraryExtra.length===0 && <div className="text-zinc-500">Пусто</div>}
            {libraryExtra.map(x=> (
              <div key={x.id} className="flex items-center justify-between border border-zinc-800 rounded-xl p-2">
                <div className="truncate">{x.id} — {x.title}</div>
                <Button theme={theme} variant="ghost" onClick={()=>delLibrary(x.id)}>Удалить</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card theme={theme}>
          <div className="text-lg mb-2">Квесты (добавленные)</div>
          <div className="space-y-2 text-sm">
            {quizzesExtra.length===0 && <div className="text-zinc-500">Пусто</div>}
            {quizzesExtra.map(x=> (
              <div key={x.id} className="flex items-center justify-between border border-zinc-800 rounded-xl p-2">
                <div className="truncate">{x.id} — {x.title}</div>
                <Button theme={theme} variant="ghost" onClick={()=>delQuiz(x.id)}>Удалить</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card theme={theme}>
          <div className="text-lg mb-2">Импорт / Экспорт</div>
          <div className="flex items-center gap-3 text-sm">
            <Button theme={theme} onClick={exportJSON}>Экспорт JSON</Button>
            <label className="border border-zinc-800 rounded-xl px-3 py-2 cursor-pointer">Импорт JSON
              <input type="file" accept="application/json" className="hidden" onChange={importJSON} />
            </label>
          </div>
          <div className="text-xs text-zinc-500 mt-2">* Для файлов (обложки/документы) сейчас вставляй URL (YouTube, Drive, Dropbox, Cloudinary). В v2 подключим Supabase Storage.</div>
        </Card>
        <Card theme={theme}>
          <div className="text-lg mb-2">Пользователи</div>
          <div className="grid gap-2 text-sm">
            <input className={inputClass(theme)} placeholder="id (уникальный)" value={newUser.id} onChange={e=>setNewUser({...newUser, id:e.target.value})}/>
            <input className={inputClass(theme)} placeholder="Имя" value={newUser.name} onChange={e=>setNewUser({...newUser, name:e.target.value})}/>
            <input type="number" className={inputClass(theme)} placeholder="Очки" value={newUser.points} onChange={e=>setNewUser({...newUser, points:Number(e.target.value||0)})}/>
            <input className={inputClass(theme)} placeholder="Статус" value={newUser.status} onChange={e=>setNewUser({...newUser, status:e.target.value})}/>
            <input className={inputClass(theme)} placeholder="Роль" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}/>
            <div className="flex gap-2 mt-2"><Button theme={theme} onClick={()=>{ addUser(newUser); setNewUser({ id: '', name: '', points: 0, status: 'Новичок', role: 'ученик' }); }}>Сохранить</Button></div>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between border border-zinc-800 rounded-xl p-2">
                <div className="truncate">{u.name} • {u.points} pts • {u.role}</div>
                <div className="flex items-center gap-2">
                  <input type="number" className={`${inputClass(theme)} w-24 text-right`} value={u.points} onChange={e=>updateUserPoints(u.id, Number(e.target.value||0))}/>
                  <Button theme={theme} variant="ghost" onClick={()=>removeUser(u.id)}>Удалить</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

function LessonPage({ lesson, onClose, onComplete, completed, theme }) {
  if (!lesson) return null;
  return (
    <Page>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-semibold">{lesson.title}</div>
          <div className="text-sm text-zinc-500">Категория: {CATEGORIES.find(c=>c.id===lesson.category)?.title} • {lesson.kind}</div>
        </div>
        <div className="flex gap-2">
          {!completed && <Button theme={theme} onClick={() => onComplete(lesson)}>Отметить как пройдено</Button>}
          <Button theme={theme} variant="ghost" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
      <Card theme={theme}>
        <div className={`aspect-video rounded-xl border mb-4 flex items-center justify-center text-zinc-600 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>Плейсхолдер видео/вставки</div>
        {lesson.content ? (
          <div className="space-y-3 text-sm text-zinc-300">
            {lesson.content.map((p,i)=>(<p key={i}>{p}</p>))}
          </div>
        ) : (
          <div className="text-sm text-zinc-500">Контент появится позже. Сейчас можно отметить урок как изученный.</div>
        )}
      </Card>
    </Page>
  );
}

function MemberProfile({ user, onClose, theme }) {
  if (!user) return null;
  const card = theme === "dark" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900";
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
      <div className={`${card} border rounded-2xl p-6 max-w-lg w-full relative`}>
        <button className="absolute top-3 right-3 text-zinc-500" onClick={onClose}>✕</button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100" />
          <div>
            <div className="text-xl font-semibold">{user.name}</div>
            <div className="text-sm text-zinc-500">Статус: {user.status} • Роль: {user.role}</div>
          </div>
        </div>
        <div className="text-sm text-zinc-300">Очки: {user.points}</div>
        <div className="text-xs text-zinc-500 mt-2">*Профиль участника из сообщества. В следующих версиях появятся сообщения и совместные сессии.</div>
      </div>
    </div>
  );
}

function computeAchievements(profile, status) {
  const lessonsDone = Object.keys(profile.completed || {}).length;
  const quizzesDone = Object.keys(profile.quizzes || {}).length;
  const seqDone = Object.values(profile.sequences || {}).reduce((acc, seq) => acc + Object.keys(seq || {}).length, 0);
  const items = [
    { title: "Первый шаг", desc: "Отметить хотя бы один урок", earned: lessonsDone >= 1 },
    { title: "Квестер", desc: "Завершить квест из вкладки Квесты", earned: quizzesDone >= 1 },
    { title: "Интеллектуальный след", desc: "Пройти шаг в последовательном квесте", earned: seqDone >= 1 },
    { title: "Сотня", desc: "Набрать 100 очков и получить новый статус", earned: profile.points >= 100 },
    { title: "Растущий статус", desc: `Дойти до уровня «${status}»`, earned: true },
  ];
  return items;
}

export default function App() {
  const m = useModel();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [openLesson, setOpenLesson] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [theme, setTheme] = useState(load("theme", "dark"));

  useEffect(() => save("theme", theme), [theme]);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const libraryAll = [...INITIAL_LIBRARY, ...m.libraryExtra];
  const quizzesAll = [...INITIAL_QUIZZES, ...m.quizzesExtra];

  const background = theme === "dark" ? "bg-black text-zinc-100" : "bg-zinc-50 text-zinc-900";

  return (
    <div className={`min-h-screen ${background}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Nav tab={m.tab} setTab={m.setTab} points={m.profile.points} status={m.status} isAdmin={m.isAdmin} theme={theme} setTheme={setTheme} />
          {m.tab === "home" && <Home setTab={m.setTab} theme={theme} />}
        {m.tab === "library" && (
          <Library lessons={libraryAll} filter={m.filter} setFilter={m.setFilter} onStart={(l)=>{ m.completeLesson(l); alert("Урок отмечен как изученный. +20 очков и рост навыка."); }} isCompleted={(id)=>!!m.profile.completed[id]} onOpen={(lesson)=>{ setOpenLesson(lesson); m.setTab('lesson'); }} theme={theme} />
        )}
          {m.tab === "quests" && (<Quests quizzes={quizzesAll} sequential={SEQUENTIAL_QUESTS} onSubmit={m.submitQuiz} onSubmitSequence={(seqId, step, answers)=>m.submitSequence(seqId, step.id, step, answers)} profile={m.profile} selected={selectedQuiz} theme={theme} />)}
        {m.tab === "profile" && (<Profile profile={m.profile} status={m.status} setTab={m.setTab} setFilter={m.setFilter} setSelectedQuiz={setSelectedQuiz} theme={theme} />)}
        {m.tab === "lesson" && (<LessonPage lesson={openLesson} onClose={()=>{ setOpenLesson(null); m.setTab('library'); }} onComplete={(l)=>{ m.completeLesson(l); }} completed={!!m.profile.completed[openLesson?.id]} theme={theme} />)}
        {m.tab === "leaderboard" && (<><Leaderboard users={m.users} selectUser={(u)=>{ setSelectedMember(u); m.setTab('leaderboard'); }} selected={selectedMember} theme={theme} />{selectedMember && <MemberProfile user={selectedMember} onClose={()=>setSelectedMember(null)} theme={theme} />}</>)}
        {m.tab === "admin" && (<Admin libraryExtra={m.libraryExtra} setLibraryExtra={m.setLibraryExtra} quizzesExtra={m.quizzesExtra} setQuizzesExtra={m.setQuizzesExtra} users={m.users} addUser={m.addUser} removeUser={m.removeUser} updateUserPoints={m.updateUserPoints} theme={theme} />)}
        <div className="mt-10 flex items-center justify-between text-xs text-zinc-500">
          <div>© {new Date().getFullYear()} NOESIS — интеллектуальная платформа (MVP)</div>
          <div className="flex items-center gap-3">
            <button onClick={m.resetAll} className="underline hover:no-underline">Сбросить прогресс</button>
            {!m.isAdmin && <button onClick={()=>{ const p = prompt('Пароль администратора'); if (p === 'noesis2025') { m.setIsAdmin(true); m.setTab('admin'); } else if (p) { alert('Неверный пароль'); } }} className="underline hover:no-underline">Войти как админ</button>}
            {m.isAdmin && <button onClick={()=>{ m.setIsAdmin(false); if (m.tab==='admin') m.setTab('home'); }} className="underline hover:no-underline">Выйти из админки</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
