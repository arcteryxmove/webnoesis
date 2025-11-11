# NOESIS — MVP (React + Vite + Tailwind) с админкой

## Запуск локально
```bash
npm install
npm run dev
```

## Деплой
- Vercel: импортируй репозиторий → Deploy (Build: `npm run build`, Output: `dist`)
- Netlify: `npm run build` → перетащи папку `dist` в https://app.netlify.com/drop

## Админка
- Внизу футера нажми “Войти как админ”, пароль: `noesis2025`.
- Добавляй материалы и квесты, экспорт/импорт контента в JSON.
- Медиа добавляются как URL (YouTube/Drive/Cloudinary). В v2 — Supabase Storage.
