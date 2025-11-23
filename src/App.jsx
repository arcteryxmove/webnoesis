import React, { useEffect, useMemo, useState } from "react";

// ---------- storage helpers ----------
const canUseStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const loadState = (key, fallback) => {
  if (!canUseStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};
const saveState = (key, value) => {
  if (!canUseStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
};

// ---------- constants ----------
const STATUSES = [
  { min: 0, name: "Новичок" },
  { min: 100, name: "Наблюдатель" },
  { min: 250, name: "Аналитик" },
  { min: 500, name: "Практик" },
  { min: 900, name: "Создатель" },
  { min: 1400, name: "Архитектор" },
];

const BASE_LESSONS = [
  {
    id: "biz-article",
    category: "Бизнес",
    title: "Как мыслит предприниматель",
    duration: 12,
    kind: "Статья",
    content: [
      "Предприниматель начинает с боли клиента: что мешает людям, где они теряют время или деньги.",
      "Первые шаги — быстрые разговоры и микропрототипы, чтобы проверить ценность, а не полировать продукт.",
      "Первые продажи важнее всего: они подтверждают наличие ценности и дают топливо для следующих итераций.",
      "Когда появляются повторы покупок и прозрачная экономика, предприниматель масштабирует решение.",
      "Развивая предпринимательское мышление, держи фокус на гипотезах, циклах обратной связи и постоянной проверке ценности.",
    ],
  },
  { id: "logic-101", category: "Мышление", title: "Причинно‑следственные связи", duration: 8, kind: "Видео" },
  { id: "finance-steps", category: "Финансы", title: "Личный бюджет за 30 минут", duration: 10, kind: "Практика" },
  { id: "psy-motivation", category: "Психология", title: "Дисциплина без перегрева", duration: 9, kind: "Подкаст" },
];

const QUIZZES = [
  {
    id: "thinking-check",
    title: "Проверка мышления",
    category: "Мышление",
    questions: [
      { q: "Что помогает отличить причину от корреляции?", options: ["Интуиция", "Наличие механизма A→B", "Количество примеров"], a: 1 },
      { q: "Что делать перед выводами?", options: ["Сразу писать вывод", "Собрать данные и альтернативы", "Найти подтверждение"], a: 1 },
    ],
  },
  {
    id: "business-value",
    title: "Ценность продукта",
    category: "Бизнес",
    questions: [
      { q: "Что покупает клиент?", options: ["Функцию", "Решение своей задачи", "Тренд"], a: 1 },
      { q: "MVP — это", options: ["Черновик навсегда", "Минимум для проверки ценности", "Дешевая версия"], a: 1 },
    ],
  },
];

const SEQUENTIAL_QUESTS = [
  {
    id: "intellectual-path",
    title: "Интеллектуальный путь",
    steps: [
      {
        id: "observe",
        title: "Наблюдаем",
        description: "Строим карту системы",
        questions: [
          { q: "Что делаем сначала?", options: ["Выбираем любимую часть", "Рисуем элементы и связи", "Ищем виноватых"], a: 1 },
          { q: "Когда формулировать гипотезу?", options: ["После карты факторов", "Сразу", "Когда закончились идеи"], a: 0 },
        ],
      },
      {
        id: "experiment",
        title: "Тестируем",
        description: "Запускаем малые эксперименты",
        questions: [
          { q: "Что у эксперимента должно быть?", options: ["Сложный дизайн", "Метрика успеха", "Много людей"], a: 1 },
          { q: "Сколько итераций нужно, чтобы увидеть тренд?", options: ["1", "3–5", "10"], a: 1 },
        ],
      },
      {
        id: "conclude",
        title: "Делаем вывод",
        description: "Собираем инсайты и масштабируем",
        questions: [
          { q: "Когда масштабировать?", options: ["После повторяемых результатов", "Сразу", "Когда надоело"], a: 0 },
          { q: "Что делать при сомнительном результате?", options: ["Игнорировать", "Уточнить метрики и повторить", "Сменить тему"], a: 1 },
        ],
      },
    ],
  },
];
const DEFAULT_USERS = [
  { id: "me", name: "Ты", points: 0, status: "Новичок", role: "ученик" },
  { id: "lena", name: "Лена", points: 820, status: "Создатель", role: "ментор" },
  { id: "arsen", name: "Арсен", points: 690, status: "Практик", role: "аналитик" },
  { id: "mira", name: "Мира", points: 540, status: "Аналитик", role: "исследователь" },
];

// ---------- ui helpers ----------
const Section = ({ children }) => <div className="space-y-4">{children}</div>;
const Card = ({ children, theme }) => (
  <div className={`rounded-2xl border p-6 ${theme === "dark" ? "border-white/20 bg-black" : "border-black/10 bg-white shadow"}`}>
    {children}
  </div>
);
const Button = ({ children, onClick, variant = "solid", theme }) => {
  const palette = theme === "dark"
    ? { solid: "bg-emerald-500 text-white hover:bg-emerald-400", ghost: "border border-zinc-700 hover:border-zinc-500" }
    : { solid: "bg-emerald-500 text-white hover:bg-emerald-400", ghost: "border border-zinc-300 hover:border-zinc-500" };
    ? { solid: "bg-white text-black hover:bg-gray-100", ghost: "border border-white/40 text-white hover:border-white" }
    : { solid: "bg-black text-white hover:bg-neutral-800", ghost: "border border-black/30 text-black hover:border-black" };
  return (
    <button
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${palette[variant]}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};
const ProgressBar = ({ value }) => (
  <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden border border-emerald-300">
    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
const ProgressBar = ({ value, theme }) => (
  <div className={`w-full h-3 rounded-full overflow-hidden border ${theme === "dark" ? "bg-black border-white/20" : "bg-white border-black/15"}`}>
    <div
      className="h-full bg-green-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// ---------- components ----------
const Navigation = ({ tab, setTab, status, points, theme, setTheme }) => {
  const items = [
    { id: "home", label: "Главная" },
    { id: "library", label: "Библиотека" },
    { id: "quests", label: "Квесты" },
    { id: "profile", label: "Профиль" },
    { id: "community", label: "Сообщество" },
    { id: "admin", label: "Админ" },
  ];
  return (
    <div className={`flex items-center justify-between pb-4 mb-8 border-b ${theme === "dark" ? "border-white/15" : "border-black/10"}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500" />
        <div className="text-xl font-bold tracking-tight">NOESIS</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item.id}
            theme={theme}
            variant={tab === item.id ? "solid" : "ghost"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">Статус: <span className="font-semibold text-black dark:text-white">{status}</span></span>
        <span className="text-gray-500">Очки: <span className="font-semibold text-black dark:text-white">{points}</span></span>
        <Button
          theme={theme}
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀️ Светлая" : "🌙 Тёмная"}
        </Button>
      </div>
    </div>
  );
};

const Home = ({ setTab, theme }) => {
  const featureCards = [
    {
      title: "Библиотека знаний",
      text: "Уроки, статьи и практики: предпринимательство, мышление, финансы, психология.",
      action: () => setTab("library"),
      actionLabel: "Открыть библиотеку",
    },
    {
      title: "Интеллектуальные квесты",
      text: "Проходи последовательные тесты, получай очки и закрепляй навыки.",
      action: () => setTab("quests"),
      actionLabel: "Пройти квест",
    },
    {
      title: "Профиль развития",
      text: "Отслеживай прогресс, рост статуса и собранные достижения.",
      action: () => setTab("profile"),
      actionLabel: "Мой прогресс",
    },
    {
      title: "Сообщество",
      text: "Смотри топ участников, открывай их профили и вдохновляйся результатами.",
      action: () => setTab("community"),
      actionLabel: "К сообществу",
    },
  ];

  return (
    <Section>
      <div className="space-y-10">
        <div className={`rounded-3xl border p-10 flex flex-col gap-6 text-center ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-emerald-500">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">Платформа для развития</span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">Мышление • Бизнес • Финансы</span>
        <div className={`rounded-3xl border p-10 flex flex-col gap-6 text-center ${theme === "dark" ? "bg-black border-white/20" : "bg-white border-black/10"}`}>
          <div className={`flex flex-wrap justify-center gap-4 text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
            <span className={`px-3 py-1 rounded-full border ${theme === "dark" ? "border-white/25" : "border-black/10"}`}>Платформа для развития</span>
            <span className={`px-3 py-1 rounded-full border ${theme === "dark" ? "border-white/25" : "border-black/10"}`}>Мышление • Бизнес • Финансы</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold">Будь лучше вчерашнего себя</h1>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg">
              Платформа для практиков, которые хотят системно прокачивать навыки мышления и осознанности.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              «Без умных ограничений, нельзя ничего делать», — Daniel Dennett
            </p>
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            <Button theme={theme} onClick={() => setTab("library")}>Открыть библиотеку</Button>
            <Button theme={theme} variant="ghost" onClick={() => setTab("quests")}>Пройти квест</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {featureCards.map((card) => (
            <Card key={card.title} theme={theme}>
              <div className="flex flex-col gap-3 text-left">
                <div className="text-lg font-semibold">{card.title}</div>
                <p className="text-sm text-zinc-500 leading-relaxed">{card.text}</p>
                <div>
                  <Button theme={theme} onClick={card.action}>{card.actionLabel}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Library = ({ lessons, onComplete, onOpenLesson, completed, theme }) => (
  <Section>
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Библиотека</h2>
      <p className="text-sm text-zinc-500">Уроки, статьи и практики</p>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      {lessons.map((lesson) => (
        <Card key={lesson.id} theme={theme}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">{lesson.title}</div>
              <div className="text-xs text-zinc-500">{lesson.category} • {lesson.kind} • {lesson.duration} мин</div>
            </div>
            {completed[lesson.id] && <span className="text-emerald-500 text-sm">✔</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <Button theme={theme} onClick={() => onOpenLesson(lesson)}>Открыть</Button>
            {!completed[lesson.id] && (
              <Button theme={theme} variant="ghost" onClick={() => onComplete(lesson)}>Отметить</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  </Section>
);

const LessonPage = ({ lesson, onClose, onComplete, done, theme }) => {
  if (!lesson) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
      <div className={`max-w-3xl w-full rounded-3xl border p-6 space-y-4 ${theme === "dark" ? "bg-black border-white/20" : "bg-white border-black/10"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{lesson.title}</div>
            <div className="text-sm text-zinc-500">{lesson.category} • {lesson.kind}</div>
          </div>
          <div className="flex gap-2">
            {!done && <Button theme={theme} onClick={() => onComplete(lesson)}>Пройдено</Button>}
            <Button theme={theme} variant="ghost" onClick={onClose}>Закрыть</Button>
          </div>
        </div>
        <div className={`aspect-video rounded-2xl border flex items-center justify-center ${theme === "dark" ? "bg-black border-white/15 text-gray-400" : "bg-white border-black/10 text-gray-600"}`}>
          Пустое окно под видео или материал
        </div>
        {lesson.content && (
          <div className="space-y-2 text-sm text-zinc-500">
            {lesson.content.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>
    </div>
  );
};

const QuizCard = ({ quiz, onSubmit, previousResult, theme }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleSubmit = () => {
    const outcome = onSubmit(quiz, Object.values(answers));
    setResult(outcome);
  };

  return (
    <Card theme={theme}>
      <div className="text-lg font-semibold mb-2">{quiz.title}</div>
      <div className="space-y-3">
        {quiz.questions.map((q, idx) => (
          <div key={idx} className="space-y-2">
            <div className="text-sm font-medium">{idx + 1}. {q.q}</div>
            <div className="grid gap-2">
              {q.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-2 rounded-xl border p-2 ${answers[idx] === i ? "border-emerald-400 bg-emerald-50" : "border-zinc-200"}`}>
                  <input type="radio" name={`${quiz.id}-${idx}`} checked={answers[idx] === i} onChange={() => setAnswers((a) => ({ ...a, [idx]: i }))} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button theme={theme} onClick={handleSubmit}>Отправить</Button>
          {previousResult && (
            <span className="text-sm text-zinc-500">Было: {previousResult.correct}/{previousResult.total}</span>
          )}
          {result && <span className="text-sm text-emerald-500">+{result.delta} очков</span>}
        </div>
      </div>
    </Card>
  );
};

const StepBlock = ({ step, locked, done, theme, onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    setAnswers({});
    setResult(null);
  }, [open]);

  const submit = () => {
    const mapped = step.questions.map((_, idx) => answers[idx]);
    const r = onSubmit(step, mapped);
    setResult(r);
    setOpen(false);
  };

  return (
    <div className={`rounded-2xl border p-3 ${locked ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{step.title}</div>
          <div className="text-xs text-zinc-500">{step.description}</div>
        </div>
        <div className="flex items-center gap-2">
          {done && <span className="text-emerald-500 text-sm">{done.correct}/{done.total}</span>}
          <Button theme={theme} variant="ghost" onClick={() => !locked && setOpen((v) => !v)}>
            {locked ? "Закрыто" : open ? "Скрыть" : "Пройти"}
          </Button>
        </div>
      </div>
      {open && !locked && (
        <div className="mt-3 space-y-3">
          {step.questions.map((q, idx) => (
            <div key={idx} className={`rounded-xl border p-3 ${theme === "dark" ? "border-zinc-800" : "border-zinc-200"}`}>
              <div className="text-sm mb-2">{q.q}</div>
              <div className="grid gap-2 mb-2">
                {q.options.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-2 rounded-lg border p-2 ${answers[idx] === i ? "border-emerald-400 bg-emerald-50" : "border-zinc-200"}`}>
                    <input type="radio" name={`${step.id}-${idx}`} checked={answers[idx] === i} onChange={() => setAnswers((a) => ({ ...a, [idx]: i }))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Button theme={theme} onClick={submit}>Ответить</Button>
            {result && <span className="text-sm text-emerald-500">+{result.delta} очков</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const SequentialCard = ({ quest, onSubmitStep, progress, theme }) => {
  const isStepUnlocked = (idx) => idx === 0 || progress[quest.steps[idx - 1].id];

  return (
    <Card theme={theme}>
      <div className="text-lg font-semibold mb-2">{quest.title}</div>
      <div className="space-y-3">
        {quest.steps.map((step, idx) => (
          <StepBlock
            key={step.id}
            step={step}
            locked={!isStepUnlocked(idx)}
            done={progress[step.id]}
            theme={theme}
            onSubmit={onSubmitStep}
          />
        ))}
      </div>
    </Card>
  );
};

const Profile = ({ profile, status, nextStatus, achievements, theme, onOpenSubscription }) => (
  <Section>
    <Card theme={theme}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-2xl font-bold">{profile.name}</div>
          <div className="text-sm text-zinc-500">Статус: {status}</div>
        </div>
        <div className="w-full md:w-2/3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Очки</span><span className="font-semibold">{profile.points}</span>
          </div>
          <ProgressBar value={nextStatus ? Math.min(100, Math.round((profile.points / nextStatus.min) * 100)) : 100} />
          {nextStatus ? (
            <div className="text-xs text-zinc-500">До уровня «{nextStatus.name}» осталось {nextStatus.min - profile.points} очков</div>
          ) : (
            <div className="text-xs text-zinc-500">Максимальный статус достигнут</div>
          )}
          <div className="pt-2 flex flex-wrap gap-2">
            <Button theme={theme} onClick={onOpenSubscription}>Моя подписка</Button>
          </div>
        </div>
      </div>
    </Card>
    <div className="grid md:grid-cols-2 gap-4">
      <Card theme={theme}>
        <div className="text-lg font-semibold mb-2">Достижения</div>
        <div className="grid gap-2">
          {achievements.map((a) => (
            <div key={a.title} className={`flex items-center gap-3 rounded-xl border p-3 ${a.earned ? "border-emerald-300 bg-emerald-50" : "border-zinc-200"}`}>
              <span className="text-2xl">{a.icon}</span>
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-zinc-500">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card theme={theme}>
        <div className="text-lg font-semibold mb-2">Пройденные материалы</div>
        <div className="text-sm text-zinc-500">Уроки: {Object.keys(profile.completed).length}</div>
        <div className="text-sm text-zinc-500">Квесты: {Object.keys(profile.quizzes).length}</div>
        <div className="text-sm text-zinc-500">Последовательные шаги: {Object.values(profile.sequences).reduce((sum, seq) => sum + Object.keys(seq).length, 0)}</div>
      </Card>
    </div>
  </Section>
);

const Community = ({ users, onOpen, theme }) => (
  <Section>
    <h2 className="text-2xl font-semibold">Сообщество</h2>
    <div className="grid md:grid-cols-2 gap-3">
      {users.map((u) => (
        <div key={u.id} className="flex items-center justify-between rounded-2xl border p-3 cursor-pointer border-zinc-200 hover:border-emerald-300" onClick={() => onOpen(u)}>
        <div
          key={u.id}
          className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer ${theme === "dark" ? "border-white/20 hover:border-white/40" : "border-black/10 hover:border-black/40"}`}
          onClick={() => onOpen(u)}
        >
          <div>
            <div className="font-semibold">{u.name}</div>
            <div className="text-xs text-zinc-500">{u.status} • {u.role}</div>
          </div>
          <div className="font-semibold text-emerald-600">{u.points} pts</div>
        </div>
      ))}
    </div>
  </Section>
);

const MemberModal = ({ user, onClose, theme }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
      <div className={`w-full max-w-md rounded-3xl border p-6 space-y-3 ${theme === "dark" ? "bg-black border-white/20" : "bg-white border-black/10"}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold">{user.name}</div>
            <div className="text-sm text-zinc-500">Статус: {user.status} • Роль: {user.role}</div>
          </div>
          <button className="text-zinc-500" onClick={onClose}>✕</button>
        </div>
        <div className="text-sm text-zinc-500">Очки: {user.points}</div>
        <div className="text-xs text-zinc-400">Личная страница участника из топа сообщества.</div>
      </div>
    </div>
  );
};

const Admin = ({ theme, onAddLesson, onAddUser, users, onRemoveUser }) => {
  const [material, setMaterial] = useState({ title: "", category: "Бизнес", duration: 5, kind: "Статья" });
  const [user, setUser] = useState({ id: "", name: "", points: 0, status: "Новичок", role: "ученик" });

  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-4">
        <Card theme={theme}>
          <div className="text-lg font-semibold mb-2">Добавить материал</div>
          <div className="grid gap-2 text-sm">
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Название" value={material.title} onChange={(e) => setMaterial({ ...material, title: e.target.value })} />
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Категория" value={material.category} onChange={(e) => setMaterial({ ...material, category: e.target.value })} />
            <input type="number" className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Длительность" value={material.duration} onChange={(e) => setMaterial({ ...material, duration: Number(e.target.value) })} />
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Тип" value={material.kind} onChange={(e) => setMaterial({ ...material, kind: e.target.value })} />
            <Button theme={theme} onClick={() => { if (!material.title) return; onAddLesson(material); setMaterial({ title: "", category: "Бизнес", duration: 5, kind: "Статья" }); }}>Сохранить</Button>
          </div>
        </Card>
        <Card theme={theme}>
          <div className="text-lg font-semibold mb-2">Пользователи</div>
          <div className="grid gap-2 text-sm">
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="ID" value={user.id} onChange={(e) => setUser({ ...user, id: e.target.value })} />
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Имя" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
            <input type="number" className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Очки" value={user.points} onChange={(e) => setUser({ ...user, points: Number(e.target.value) })} />
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Статус" value={user.status} onChange={(e) => setUser({ ...user, status: e.target.value })} />
            <input className={`border rounded-xl px-3 py-2 ${theme === "dark" ? "bg-black border-white/20 text-white" : "bg-white border-black/15"}`} placeholder="Роль" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })} />
            <Button theme={theme} onClick={() => { if (!user.id || !user.name) return; onAddUser(user); setUser({ id: "", name: "", points: 0, status: "Новичок", role: "ученик" }); }}>Добавить</Button>
          </div>
        </Card>
      </div>
      <Card theme={theme}>
        <div className="text-lg font-semibold mb-2">Список пользователей</div>
        <div className="grid gap-2 text-sm">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border p-2">
              <div>{u.name} — {u.points} pts — {u.role}</div>
              <Button theme={theme} variant="ghost" onClick={() => onRemoveUser(u.id)}>Удалить</Button>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
};

const Subscription = ({ theme, onBack }) => {
  const perks = [
    "Доступ ко всем урокам и практикам",
    "Приоритет в интеллектуальных квестах",
    "Персональные рекомендации от менторов",
  ];

  return (
    <Section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Моя подписка</h2>
          <p className="text-sm text-gray-500">Переключай темы, следи за статусом и управляй доступом.</p>
        </div>
        <Button theme={theme} variant="ghost" onClick={onBack}>← Назад в профиль</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border-2 p-6 ${theme === "dark" ? "border-green-500/80 bg-black" : "border-green-500 bg-white"}`}>
          <div className="text-lg font-semibold mb-2">Текущий план</div>
          <div className="text-sm text-gray-500 mb-3">Активная подписка подсвечена зелёной обводкой.</div>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
            {perks.map((item) => (
              <li key={item} className="flex items-center gap-2"><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
        <Card theme={theme}>
          <div className="text-lg font-semibold mb-2">Изменить тариф</div>
          <div className="text-sm text-gray-500 mb-3">Выбери подходящий вариант, если захочешь перейти на другой уровень.</div>
          <div className="flex gap-2 flex-wrap">
            <Button theme={theme}>Обновить</Button>
            <Button theme={theme} variant="ghost">Пауза</Button>
          </div>
        </Card>
      </div>
    </Section>
  );
};

// ---------- main app ----------
export default function App() {
  const [theme, setTheme] = useState(loadState("theme", "dark"));
  const [tab, setTab] = useState(loadState("tab", "home"));
  const [lessons, setLessons] = useState(loadState("lessons", BASE_LESSONS));
  const [profile, setProfile] = useState(loadState("profile", { name: "Ты", points: 0, completed: {}, quizzes: {}, sequences: {} }));
  const [users, setUsers] = useState(loadState("users", DEFAULT_USERS));
  const [openLesson, setOpenLesson] = useState(null);
  const [openMember, setOpenMember] = useState(null);

  useEffect(() => saveState("theme", theme), [theme]);
  useEffect(() => saveState("tab", tab), [tab]);
  useEffect(() => saveState("lessons", lessons), [lessons]);
  useEffect(() => saveState("profile", profile), [profile]);
  useEffect(() => saveState("users", users), [users]);

  const status = useMemo(() => STATUSES.filter((s) => profile.points >= s.min).pop()?.name || "Новичок", [profile.points]);
  const nextStatus = STATUSES.find((s) => s.min > profile.points) || null;

  // keep leaderboard in sync
  useEffect(() => {
    setUsers((prev) => prev.map((u) => (u.id === "me" ? { ...u, points: profile.points, status } : u)));
  }, [profile.points, status]);

  const completeLesson = (lesson) => {
    if (profile.completed[lesson.id]) return;
    setProfile((p) => ({
      ...p,
      points: p.points + 20,
      completed: { ...p.completed, [lesson.id]: true },
    }));
  };

  const submitQuiz = (quiz, answers) => {
    const correct = quiz.questions.reduce((acc, q, idx) => acc + (answers[idx] === q.a ? 1 : 0), 0);
    const total = quiz.questions.length;
    const delta = correct * 30;
    setProfile((p) => ({
      ...p,
      points: p.points + delta,
      quizzes: { ...p.quizzes, [quiz.id]: { correct, total } },
    }));
    return { correct, total, delta };
  };

  const submitSequenceStep = (step, answers) => {
    const correct = step.questions.reduce((acc, q, idx) => acc + (answers[idx] === q.a ? 1 : 0), 0);
    const total = step.questions.length;
    const delta = correct * 25;
    setProfile((p) => ({
      ...p,
      points: p.points + delta,
      sequences: { ...p.sequences, [step.id]: { correct, total } },
    }));
    return { correct, total, delta };
  };

  const addLesson = (lesson) => setLessons((list) => [...list, { ...lesson, id: `${lesson.title}-${list.length}` }]);
  const addUser = (user) => setUsers((list) => [...list.filter((u) => u.id !== user.id), user]);
  const removeUser = (id) => setUsers((list) => list.filter((u) => u.id !== id));

  const achievements = useMemo(() => ([
    { title: "Первый шаг", desc: "Отметь любой урок", icon: "🥉", earned: Object.keys(profile.completed).length >= 1 },
    { title: "Квестер", desc: "Закрой квест", icon: "🥈", earned: Object.keys(profile.quizzes).length >= 1 },
    { title: "Интеллектуальный след", desc: "Пройди шаг в последовательном квесте", icon: "🥇", earned: Object.keys(profile.sequences).length >= 1 },
    { title: "Рост статуса", desc: "Повышай уровень с очками", icon: "🏅", earned: profile.points >= 100 },
  ]), [profile]);

  const communityUsers = useMemo(() => [...users].sort((a, b) => b.points - a.points), [users]);

  return (
    <div className={theme === "dark" ? "bg-black text-white min-h-screen" : "bg-white text-black min-h-screen"}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Navigation tab={tab} setTab={setTab} status={status} points={profile.points} theme={theme} setTheme={setTheme} />

        {tab === "home" && <Home setTab={setTab} theme={theme} />}
        {tab === "library" && (
          <Library
            lessons={lessons}
            onComplete={completeLesson}
            onOpenLesson={(lesson) => setOpenLesson(lesson)}
            completed={profile.completed}
            theme={theme}
          />
        )}
        {tab === "quests" && (
          <Section>
            <h2 className="text-2xl font-semibold">Интеллектуальные квесты</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {QUIZZES.map((q) => (
                <QuizCard key={q.id} quiz={q} onSubmit={submitQuiz} previousResult={profile.quizzes[q.id]} theme={theme} />
              ))}
            </div>
            <div className="space-y-3 mt-6">
              <h3 className="text-xl font-semibold">Последовательные квесты</h3>
              {SEQUENTIAL_QUESTS.map((quest) => (
                <SequentialCard key={quest.id} quest={quest} onSubmitStep={submitSequenceStep} progress={profile.sequences} theme={theme} />
              ))}
            </div>
          </Section>
        )}
        {tab === "profile" && (
          <Profile
            profile={profile}
            status={status}
            nextStatus={nextStatus}
            achievements={achievements}
            theme={theme}
            onOpenSubscription={() => setTab("subscription")}
          />
        )}
        {tab === "subscription" && (
          <Subscription theme={theme} onBack={() => setTab("profile")} />
        )}
        {tab === "community" && (
          <Community users={communityUsers} onOpen={(u) => setOpenMember(u)} theme={theme} />
        )}
        {tab === "admin" && (
          <Admin theme={theme} onAddLesson={addLesson} onAddUser={addUser} users={users} onRemoveUser={removeUser} />
        )}
      </div>
      <LessonPage
        lesson={openLesson}
        onClose={() => setOpenLesson(null)}
        onComplete={completeLesson}
        done={openLesson ? profile.completed[openLesson.id] : false}
        theme={theme}
      />
      <MemberModal user={openMember} onClose={() => setOpenMember(null)} theme={theme} />
    </div>
  );
}
