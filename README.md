# MyHome.ge Clone — Full-Stack (NestJS + Angular + Prisma)

უძრავი ქონების პლატფორმა (MyHome.ge-ს ანალოგი), აწყობილი **NestJS** ბექენდით, **Prisma ORM (SQLite)** მონაცემთა ბაზით და **Angular 17 + Tailwind CSS** ფრონტენდით.

## არქიტექტურა

- **`backend/` (NestJS + Prisma)** — REST API სერვერი (`http://localhost:3001/api`):
  - `GET /api/properties` — დეტალური ფილტრაცია (გარიგების ტიპი, ქონების ტიპი, ქალაქი, უბანი, ფასი USD/GEL-ში, ფართობი, ოთახები, სტატუსი, მდგომარეობა, VIP, აივანი, პარკინგი, სორტირება და ძებნა ID/სიტყვით).
  - `POST /api/properties` — ახალი განცხადების დამატება მონაცემთა ბაზაში.
  - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` — JWT ავტორიზაცია და რეგისტრაცია.
  - `POST /api/favorites/toggle` — რჩეული განცხადებების მართვა.
- **`frontend/` (Angular 17 + Tailwind CSS)** — SPA კლიენტი (`http://localhost:4200`):
  - მთავარი გვერდი, დეტალური ფილტრაცია, ვალუტის გადამრთველი (`$ USD` / `₾ GEL`), ფავორიტები, განცხადების დეტალური მოდალი და ახალი განცხადების დამატების ფორმა.

## გაშვების ინსტრუქცია

### 1. Backend (NestJS)
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run start:dev
```

### 2. Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
