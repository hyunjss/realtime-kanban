# Realtime Kanban – Backend

Node.js + Express + Socket.io 백엔드 (TypeScript).

## 실행

```bash
# 서버 디렉터리에서
npm run dev

# 또는 프로젝트 루트에서
npm run dev:server
```

기본 포트: **3000**  
프론트엔드( Vite ) 기본: `http://localhost:5173` → CORS 허용됨.

## REST API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/boards/:id` | 보드 조회 (board, columns, cards) |
| POST | `/api/cards` | 카드 생성 (body: `title`, `description`, `status?`) |
| PATCH | `/api/cards/:id` | 카드 수정 (body: `title` \| `description` \| `status` \| `order`) |
| DELETE | `/api/cards/:id` | 카드 삭제 |

## Socket.io 이벤트

- **card:created** – 새 카드 생성 브로드캐스트 (payload: Card)
- **card:updated** – 카드 수정 브로드캐스트 (payload: Card)
- **card:deleted** – 카드 삭제 브로드캐스트 (payload: `{ cardId }`)
- **card:moved** – 카드 이동 브로드캐스트 (payload: `{ cardId, targetColumnId, newOrder }`)
- **user:joined** – 사용자 접속 (payload: `{ userId, boardId }`)
- **user:left** – 사용자 나가기 (payload: `{ userId, boardId }`)

연결 시 쿼리: `?boardId=default` (같은 보드끼리 룸 공유).

## 환경 변수

- `PORT` – 서버 포트 (기본 3000)
- `CORS_ORIGIN` – CORS 허용 오리진 (기본 `http://localhost:5173`)

## 데이터

인메모리 저장. 이후 DB 연결 시 `server/src/db/store.ts`를 DB 클라이언트로 교체하면 됨.
