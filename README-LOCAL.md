# Local ажиллуулах (Windows)

1. Энэ ZIP-ийн файлуудыг Figma төслийн хавтас руу хуулж давхарлан сольно:
   - src/payload.config.ts, next.config.ts, package.json, .env
2. Эдгээрийг УСТГАНА: figma-image-loader.ts, pnpm-lock.yaml, pnpm-workspace.yaml, node_modules, .next, .figaro, .tmp
3. Terminal (төслийн хавтсанд, OneDrive-аас гадна, жишээ C:\dev\digital-club):
   npm install --legacy-peer-deps
   npx payload generate:importmap
   npm run dev
4. http://localhost:3000/admin  -> эхний Admin хэрэглэгчээ үүсгэнэ.
5. Admin дотроос "Users" (гишүүнчлэл) үүсгэнэ: email, password, name, studentCode, role, major.
6. Сайт: http://localhost:3000
