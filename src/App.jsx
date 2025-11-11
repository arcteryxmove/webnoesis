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
  { id: "b1", category: "business", kind: "video", title: "Что такое ценность и почему люди платят", duration: 8 },
  { id: "f1", category: "finance", kind: "game", title: "Бюджет на месяц: квест о приоритетах", duration: 12 },
  { id: "p1", category: "psychology", kind: "podcast", title: "Воля и дисциплина: как держать курс", duration: 9 },
  { id: "b2", category: "business", kind: "article", title: "Как устроены бизнес‑модели: подписка, разовая оплата, freemium", duration: 11 },
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

const SKILL_WEIGHTS = { thinking: 1, business: 1, finance: 1, psychology: 1 };

const Page = ({ children }) => (
  <div className="min-h-screen bg-black text-zinc-100">
    <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
  </div>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">{children}</div>
);

const Button = ({ children, onClick, variant = "primary" }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${variant === "ghost" ? "border-zinc-800 bg-transparent hover:bg-zinc-900" : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"}`}>{children}</button>
);

const Progress = ({ value }) => (
  <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800"><div className="h-2 rounded-full bg-zinc-100" style={{width: `${Math.min(100, Math.max(0, value))}%`}}/></div>
);

function useModel() {
  const [profile, setProfile] = useState(load("profile", { name: "Ученик", points: 0, skills: { thinking: 0, business: 0, finance: 0, psychology: 0 }, completed: {}, quizzes: {} }));
  const [tab, setTab] = useState(load("tab", "home"));
  const [filter, setFilter] = useState("all");

  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const queryAdmin = url?.searchParams.get('admin') === '1';
  const [isAdmin, setIsAdmin] = useState(load('adminFlag', false) || queryAdmin);

  const [libraryExtra, setLibraryExtra] = useState(load('libraryExtra', []));
  const [quizzesExtra, setQuizzesExtra] = useState(load('quizzesExtra', []));

  useEffect(() => save("profile", profile), [profile]);
  useEffect(() => save("tab", tab), [tab]);
  useEffect(() => save('adminFlag', isAdmin), [isAdmin]);
  useEffect(() => save('libraryExtra', libraryExtra), [libraryExtra]);
  useEffect(() => save('quizzesExtra', quizzesExtra), [quizzesExtra]);

  const status = useMemo(() => (STATUS_TITLES.filter(x => profile.points >= x.min).pop()?.name || STATUS_TITLES[0].name), [profile.points]);

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

  const resetAll = () => { localStorage.clear(); window.location.reload(); };

  return { profile, status, tab, setTab, filter, setFilter, completeLesson, submitQuiz, resetAll, isAdmin, setIsAdmin, libraryExtra, setLibraryExtra, quizzesExtra, setQuizzesExtra };
}

function Nav({ tab, setTab, points, status, isAdmin }) {
  const items = [
    { id: "home", label: "Главная" },
    { id: "library", label: "Библиотека" },
    { id: "quests", label: "Квесты" },
    { id: "profile", label: "Профиль" },
    { id: "leaderboard", label: "Сообщество" },
  ];
  if (isAdmin) items.push({ id: 'admin', label: 'Админ' });
  return (
    <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white"/>
        <div className="text-lg tracking-tight font-semibold">NOESIS</div>
      </div>
      <div className="flex items-center gap-2">
        {items.map(i => (
          <Button key={i.id} onClick={() => setTab(i.id)} variant={tab===i.id?"":"ghost"}>{i.label}</Button>
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-400">
        <div className="hidden sm:block">Статус: <span className="text-zinc-100">{status}</span></div>
        <div>Очки: <span className="text-zinc-100">{points}</span></div>
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

function Home({ setTab }) {
  return (
    <Page>
      <div className="text-center mb-12">
        <div className="text-5xl font-semibold mb-4">Будь лучше вчерашнего себя</div>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">Платформа для развития интеллекта и мышления. Здесь ты узнаёшь, как устроены бизнес, деньги, психология и логика мира. Каждый шаг делает тебя взрослее, осознаннее и точнее.</p>
        <QuoteOfDay />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="text-2xl mb-2">Библиотека знаний</div>
          <p className="text-zinc-400 mb-4">Статьи, видео, подкасты, курсы и игры. Всё, чтобы системно понимать, как устроен мир и бизнес.</p>
          <Button onClick={() => setTab("library")}>Перейти</Button>
        </Card>
        <Card>
          <div className="text-2xl mb-2">Интеллектуальные квесты</div>
          <p className="text-zинк-400 mb-4">Задачи и вопросы, которые проверяют мышление и дают мгновенную обратную связь.</p>
          <Button onClick={() => setTab("quests")}>Начать квест</Button>
        </Card>
        <Card>
          <div className="text-2xl mb-2">Профиль развития</div>
          <p className="text-zinc-400 mb-4">Следи за ростом навыков и статусом. Видно, как ты становишься лучше вчерашнего себя.</p>
          <Button onClick={() => setTab("profile")}>Мой прогресс</Button>
        </Card>
        <Card>
          <div className="text-2xl mb-2">Сообщество</div>
          <p className="text-zinc-400 mb-4">Умная среда единомышленников. Без шума и показухи — только развитие и идеи.</p>
          <Button onClick={() => setTab("leaderboard")}>Посмотреть участников</Button>
        </Card>
      </div>
    </Page>
  );
}

function Library({ lessons, filter, setFilter, onStart, isCompleted }) {
  const filtered = lessons.filter(l => filter === "all" || l.category === filter);
  return (
    <Page>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">Библиотека</div>
        <div className="flex gap-2">
          <Button onClick={() => setFilter("all")} variant={filter==="all"?"":"ghost"}>Все</Button>
          {CATEGORIES.map(c => (<Button key={c.id} onClick={() => setFilter(c.id)} variant={filter===c.id?"":"ghost"}>{c.title}</Button>))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(l => (
          <Card key={l.id}>
            <div className="text-lg font-medium mb-1">{l.title}</div>
            <div className="text-xs text-zinc-400 mb-3">{CATEGORIES.find(c=>c.id===l.category)?.title} • {l.kind} • {l.duration} мин</div>
            {l.description && <div className="text-sm text-zinc-400 mb-3">{l.description}</div>}
            {l.source_url && <a href={l.source_url} target="_blank" className="underline text-zinc-300 mb-3 inline-block" rel="noreferrer">Источник</a>}
            <div className="flex items-center gap-2">
              {isCompleted(l.id) ? (<div className="text-emerald-400 text-sm">Завершено</div>) : (<Button onClick={() => onStart(l)}>Пройти</Button>)}
              <Button variant="ghost">В избранное</Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 text-zinc-500 text-sm">*В релизе: карточка источника, конспект, дискуссия, ссылки на открытые материалы и наш контент.</div>
    </Page>
  );
}

function Quests({ quizzes, onSubmit, profile, selected }) {
  const [current, setCurrent] = useState(quizzes[0]?.id || null);
  const quiz = useMemo(() => quizzes.find(q => q.id === current), [current, quizzes]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => { setAnswers({}); setResult(null); }, [current]);
  useEffect(() => { if (selected) setCurrent(selected); }, [selected]);
  return (
    <Page>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">Квесты</div>
        <div className="flex gap-2">{quizzes.map(q => (<Button key={q.id} onClick={() => setCurrent(q.id)} variant={current===q.id?"":"ghost"}>{q.title}</Button>))}</div>
      </div>
      {quiz && (
        <Card>
          <div className="text-lg font-medium mb-2">{quiz.title}</div>
          <div className="text-xs text-zinc-400 mb-4">Категория: {CATEGORIES.find(c=>c.id===quiz.category)?.title}</div>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={idx}>
                <div className="mb-2">{idx+1}. {q.q}</div>
                <div className="grid gap-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${answers[idx]===i?"border-zinc-500 bg-zinc-900":"border-zinc-800 bg-zinc-950"}`}>
                      <input type="radio" name={`q${idx}`} className="accent-white" onChange={() => setAnswers(a => ({...a, [idx]: i}))} checked={answers[idx]===i} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button onClick={() => setResult(onSubmit(quiz, Object.values(answers)))}>Отправить</Button>
              {profile.quizzes[quiz.id] && (<div className="text-zinc-400 text-sm">Результат: {profile.quizzes[quiz.id].correct}/{profile.quizzes[quiz.id].total}</div>)}
            </div>
            {result && (<div className="text-emerald-400 text-sm">+{result.delta} очков • Верно {result.correct}/{result.total}</div>)}
          </div>
        </Card>
      )}
    </Page>
  );
}

function Profile({ profile, status, setTab, setFilter, setSelectedQuiz }) {
  const totalSkill = Object.values(profile.skills).reduce((a,b)=>a+b,0) || 1;
  const progress = (k) => Math.round((profile.skills[k] / totalSkill) * 100);
  return (
    <Page>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="text-xl mb-1">{profile.name}</div>
          <div className="text-sm text-zinc-400 mb-4">Статус: {status} • Очки: {profile.points}</div>
          <div className="space-y-3">
            {CATEGORIES.map(c => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1"><span>{c.title}</span><span className="text-zinc-400">{profile.skills[c.id]} pts</span></div>
                <Progress value={progress(c.id)} />
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500 mt-4">Философия: <span className="text-zinc-200">быть лучше вчерашнего себя</span></div>
        </Card>
        <Card>
          <div className="text-lg mb-2">Достижения</div>
          <ul className="list-disc ml-5 text-зинк-400 space-y-1">
            <li>Первый квест пройден</li>
            <li>3 урока из базы изучены</li>
            <li>Серия: 2 дня подряд</li>
          </ul>
          <div className="text-xs text-zinc-500 mt-4">*Автогенерация писем для родителей — в v2.</div>
        </Card>
        <Card>
          <div className="text-lg mb-2">Рекомендации</div>
          <p className="text-zinc-400 mb-3">Усиль мышление и финансы.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setFilter('thinking'); setTab('library'); }}>Карта логики</Button>
            <Button onClick={() => { setSelectedQuiz('q_finance_1'); setTab('quests'); }}>Квест: бюджет</Button>
            <Button onClick={() => { setFilter('business'); setTab('library'); }}>Видео: ценность</Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Leaderboard({ mePoints }) {
  const base = [ { name: "Arsen", points: 880 }, { name: "Mira", points: 760 }, { name: "Leo", points: 640 } ];
  const data = useMemo(() => [{ name: "Ты", points: mePoints }, ...base].sort((a,b)=>b.points-a.points), [mePoints]);
  return (
    <Page>
      <div className="text-2xl mb-4">Лидеры</div>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((u,i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100"/>
                <div>
                  <div className="text-lg">{i+1}. {u.name}</div>
                  <div className="text-xs text-zinc-400">Очки: {u.points}</div>
                </div>
              </div>
              {i===0 && <div className="text-xs text-amber-300">Топ недели</div>}
            </div>
          </Card>
        ))}
      </div>
      <div className="text-zinc-500 text-sm mt-4">*В релизе: приватный/публичный режим, фильтры по трекам, дружеские дуэли.</div>
    </Page>
  );
}

function Admin({ libraryExtra, setLibraryExtra, quizzesExtra, setQuizzesExtra }) {
  const [item, setItem] = useState({ id: '', category: 'thinking', kind: 'article', title: '', duration: 5, cover: '', source_url: '', description: '' });
  const [qz, setQz] = useState({ id: '', category: 'thinking', title: '', questions: [{ q: '', options: ['', '', ''], a: 0, explain: '' }] });

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
        <Card>
          <div className="text-xl mb-3">Добавить материал (Библиотека)</div>
          <div className="grid gap-2 text-sm">
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="id (уникальный)" value={item.id} onChange={e=>setItem({...item, id:e.target.value})}/>
            <select className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" value={item.category} onChange={e=>setItem({...item, category:e.target.value})}>
              {CATEGORIES.map(c=>(<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
            <input className="bg-зинк-900 border border-зинк-800 rounded-xl p-2" placeholder="kind (article / video / game / podcast / quiz)" value={item.kind} onChange={e=>setItem({...item, kind:e.target.value})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="Заголовок" value={item.title} onChange={e=>setItem({...item, title:e.target.value})}/>
            <input type="number" className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="Длительность (мин)" value={item.duration} onChange={e=>setItem({...item, duration:Number(e.target.value||0)})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="Обложка (URL)" value={item.cover} onChange={e=>setItem({...item, cover:e.target.value})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="Источник (URL)" value={item.source_url} onChange={e=>setItem({...item, source_url:e.target.value})}/>
            <textarea className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="Короткое описание" value={item.description} onChange={e=>setItem({...item, description:e.target.value})}/>
            <div className="flex gap-2 mt-2"><Button onClick={addLibrary}>Добавить</Button></div>
          </div>
        </Card>
        <Card>
          <div className="text-xl mb-3">Добавить квест</div>
          <div className="grid gap-2 text-sm">
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="id (уникальный)" value={qz.id} onChange={e=>setQz({...qz, id:e.target.value})}/>
            <select className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" value={qz.category} onChange={e=>setQz({...qz, category:e.target.value})}>
              {CATEGORIES.map(c=>(<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2" placeholder="Заголовок" value={qz.title} onChange={e=>setQz({...qz, title:e.target.value})}/>
            <div className="text-xs text-zinc-400">Вопросы</div>
            {qz.questions.map((qq,idx)=>(
              <div key={idx} className="border border-zinc-800 rounded-xl p-2">
                <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-full mb-2" placeholder={`Вопрос #${idx+1}`} value={qq.q} onChange={e=>{
                  const qs=[...qz.questions]; qs[idx]={...qq, q:e.target.value}; setQz({...qz, questions:qs});
                }}/>
                {qq.options.map((op,i)=>(
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-full" placeholder={`Вариант ${i+1}`} value={op} onChange={e=>{ const qs=[...qz.questions]; const opts=[...qq.options]; opts[i]=e.target.value; qs[idx]={...qq, options:opts}; setQz({...qz, questions:qs}); }} />
                    <label className="text-xs text-zinc-400 flex items-center gap-1"><input type="radio" name={`a_${idx}`} className="accent-white" checked={qq.a===i} onChange={()=>{ const qs=[...qz.questions]; qs[idx]={...qq, a:i}; setQz({...qz, questions:qs}); }}/> правильный</label>
                  </div>
                ))}
                <textarea className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 w-full" placeholder="Объяснение ответа" value={qq.explain} onChange={e=>{ const qs=[...qz.questions]; qs[idx]={...qq, explain:e.target.value}; setQz({...qz, questions:qs}); }} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={()=>setQz({...qz, questions:[...qz.questions, { q:'', options:['','',''], a:0, explain:'' }]})} variant="ghost">+ Вопрос</Button>
              <Button onClick={addQuiz}>Сохранить квест</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="text-lg mb-2">Материалы (добавленные)</div>
          <div className="space-y-2 text-sm">
            {libraryExtra.length===0 && <div className="text-zinc-500">Пусто</div>}
            {libraryExtra.map(x=> (
              <div key={x.id} className="flex items-center justify-between border border-zinc-800 rounded-xl p-2">
                <div className="truncate">{x.id} — {x.title}</div>
                <Button variant="ghost" onClick={()=>delLibrary(x.id)}>Удалить</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="text-lg mb-2">Квесты (добавленные)</div>
          <div className="space-y-2 text-sm">
            {quizzesExtra.length===0 && <div className="text-zinc-500">Пусто</div>}
            {quizzesExtra.map(x=> (
              <div key={x.id} className="flex items-center justify-between border border-zinc-800 rounded-xl p-2">
                <div className="truncate">{x.id} — {x.title}</div>
                <Button variant="ghost" onClick={()=>delQuiz(x.id)}>Удалить</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="text-lg mb-2">Импорт / Экспорт</div>
          <div className="flex items-center gap-3 text-sm">
            <Button onClick={exportJSON}>Экспорт JSON</Button>
            <label className="border border-zinc-800 rounded-xl px-3 py-2 cursor-pointer">Импорт JSON
              <input type="file" accept="application/json" className="hidden" onChange={importJSON} />
            </label>
          </div>
          <div className="text-xs text-zinc-500 mt-2">* Для файлов (обложки/документы) сейчас вставляй URL (YouTube, Drive, Dropbox, Cloudinary). В v2 подключим Supabase Storage.</div>
        </Card>
        <Card>
          <div className="text-lg mb-2">Инструкции</div>
          <ul className="list-disc ml-5 text-zinc-400 text-sm space-y-1">
            <li>Материал появляется в библиотеке сразу после добавления.</li>
            <li>Квест становится доступен во вкладке «Квесты».</li>
            <li>Экспорт/Импорт позволяет переносить контент между устройствами и деплоями.</li>
          </ul>
        </Card>
      </div>
    </Page>
  );
}

export default function App() {
  const m = useModel();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const libraryAll = [...INITIAL_LIBRARY, ...m.libraryExtra];
  const quizzesAll = [...INITIAL_QUIZZES, ...m.quizzesExtra];

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Nav tab={m.tab} setTab={m.setTab} points={m.profile.points} status={m.status} isAdmin={m.isAdmin} />
        {m.tab === "home" && <Home setTab={m.setTab} />}
        {m.tab === "library" && (
          <Library lessons={libraryAll} filter={m.filter} setFilter={m.setFilter} onStart={(l)=>{ m.completeLesson(l); alert("Урок отмечен как изученный. +20 очков и рост навыка."); }} isCompleted={(id)=>!!m.profile.completed[id]} />
        )}
        {m.tab === "quests" && (<Quests quizzes={quizzesAll} onSubmit={m.submitQuiz} profile={m.profile} selected={selectedQuiz} />)}
        {m.tab === "profile" && (<Profile profile={m.profile} status={m.status} setTab={m.setTab} setFilter={m.setFilter} setSelectedQuiz={setSelectedQuiz} />)}
        {m.tab === "leaderboard" && (<Leaderboard mePoints={m.profile.points} />)}
        {m.tab === "admin" && (<Admin libraryExtra={m.libraryExtra} setLibraryExtra={m.setLibraryExtra} quizzesExtra={m.quizzesExtra} setQuizzesExtra={m.setQuizzesExtra} />)}
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
