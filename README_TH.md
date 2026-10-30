# Gacha Pulse — คู่มือติดตั้งภาษาไทย

เว็บติดตามเวลาอัปเดตเกม กิจกรรม แพตช์ และประกาศปิดปรับปรุง (แนวทาง Gacha Monitor)
โครงสร้าง: Cloudflare Pages + Pages Functions + D1

## สิ่งที่มีในชุดนี้
- Dashboard โทนดำ/ม่วง รองรับมือถือและคอมพิวเตอร์
- ค้นหาเกม และกรองตามภูมิภาค
- Countdown สำหรับเหตุการณ์ที่มีวันเวลาแน่นอน
- หน้ารวม Patch / Maintenance / Events
- ปุ่มรีเฟรชและแสดงเวลาอัปเดตข้อมูล
- API บน Pages Functions อ่าน/เพิ่ม/แก้ไขข้อมูลใน D1
- มีโหมดข้อมูลตัวอย่างสำหรับเปิดหน้าเว็บก่อนเชื่อม D1
- SQL สำหรับสร้างตารางและใส่รายชื่อเกมตัวอย่างที่ยังไม่มีการยืนยันเวลาแพตช์

## ข้อสำคัญ
ชุดนี้เป็น starter project ที่พร้อมนำไป Deploy และต่อยอดได้ ไม่ได้อ้างว่ามีตัวดึงข้อมูลอัตโนมัติที่ครอบคลุมทุกเกมแล้ว
แหล่งข้อมูลและรูปแบบประกาศต่างกันในแต่ละเกม จึงควรเพิ่มตัวเชื่อมข้อมูลที่ตรวจสอบได้เป็นรายเกม
ระบบจะไม่สร้างวันแพตช์/เวลาปิดปรับปรุงปลอมขึ้นมาเอง รายการที่ยังไม่มีเวลาแน่นอนจะแสดงว่า “ยังไม่มีประกาศยืนยัน”
เวลาของเหตุการณ์เก็บเป็น ISO 8601 และแสดงตามเวลาไทย (Asia/Bangkok) โดยเบราว์เซอร์

## A. เตรียม D1
1. เข้า Cloudflare Dashboard
2. ไปที่ Workers & Pages → D1 SQL Database
3. ใช้ฐานข้อมูล D1 ที่มีอยู่แล้วได้ ไม่ต้องสร้างใหม่ หากต้องการใช้ฐานเดิม ให้ตรวจสอบตารางก่อน
4. เปิด D1 → Console
5. เปิดไฟล์ `schema.sql` ใน ZIP แล้วคัดลอกเนื้อหาทั้งหมดไป Run
   - ถ้าใช้ฐานข้อมูลเดิมและมีตารางชื่อเดียวกันอยู่แล้ว อย่ารันแบบไม่ตรวจสอบ เพราะอาจมีโครงสร้างต่างกัน
   - แนะนำสำรองข้อมูลก่อนเปลี่ยน schema

## B. อัปโหลดเว็บไป Cloudflare Pages
1. แตกไฟล์ ZIP
2. อัปโหลดโฟลเดอร์โปรเจกต์เข้า GitHub repository
3. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
4. เลือก repository
5. Framework preset: None
6. Build command: เว้นว่าง
7. Build output directory: `public`
8. กด Deploy

## C. ผูก D1 กับ Pages
1. เปิดโปรเจกต์ Pages → Settings → Bindings
2. Add → D1 database
3. Variable name ใส่ `DB` (ต้องตรงตัวพิมพ์ใหญ่)
4. เลือกฐานข้อมูล D1 ที่ต้องการใช้
5. Save แล้ว Deploy ใหม่

ไฟล์ `wrangler.toml` มีตัวอย่างการตั้งค่าไว้ แต่ค่า `database_id` เป็น placeholder เพื่อไม่ให้เดา ID ของบัญชีคุณ
หากใช้ Dashboard binding อย่างเดียว สามารถลบ/ไม่ใช้ `wrangler.toml` หรือแก้ให้ตรงกับค่าจริงก่อนใช้ Wrangler CLI

## D. ทดสอบ
- เปิดเว็บ Pages URL
- ถ้า D1 ผูกถูกต้อง จะอ่านข้อมูลจาก `/api/games`
- เปิด `/api/health` เพื่อตรวจสอบการเชื่อมต่อ
- หากเห็นข้อความ DB_NOT_CONFIGURED ให้ตรวจสอบ Binding ชื่อ `DB` และ Deploy ใหม่

## E. เพิ่มข้อมูลกิจกรรม/แพตช์
ตาราง `events` เก็บ:
- `game_id`: รหัสเกมจากตาราง games
- `title`: ชื่อกิจกรรมหรือประกาศ
- `event_type`: `event`, `patch`, `maintenance`, `banner`, `reset`
- `region`: เช่น `SEA`, `Asia`, `Global`
- `starts_at`, `ends_at`: วันเวลา ISO เช่น `2026-11-15T03:00:00Z`
- `source_url`: ลิงก์ประกาศที่ตรวจสอบได้
- `source_name`: ชื่อแหล่งข้อมูล
- `verified_at`: เวลาที่ตรวจสอบแหล่งข้อมูลล่าสุด
- `status`: `scheduled`, `active`, `ended`, `unconfirmed`

เพิ่มข้อมูลด้วย SQL ใน D1 Console หรือพัฒนา Admin API เพิ่มเติม
ตัวอย่าง (เปลี่ยน game_id ให้ตรงกับข้อมูลจริง):
```sql
INSERT INTO events
(game_id,title,event_type,region,starts_at,ends_at,source_url,source_name,verified_at,status)
VALUES
(1,'ตัวอย่างประกาศที่ยืนยันแล้ว','patch','SEA',
 '2026-11-15T03:00:00Z','2026-11-15T05:00:00Z',
 'https://example.com/official-announcement','Official source',
 '2026-11-01T00:00:00Z','scheduled');
```
อย่าใช้ตัวอย่างข้างบนเป็นประกาศจริง ต้องเปลี่ยนเป็นเวลาที่ตรวจสอบจากต้นทางแล้ว

## F. อัปเดตข้อมูลอัตโนมัติ
โครงการนี้เตรียมโครงสร้างฐานข้อมูลและ API แต่ยังไม่ได้ตั้งตัวดึงข้อมูลอัตโนมัติครบทุกเกม เพราะไม่มีแหล่ง API มาตรฐานเดียวที่ครอบคลุมทุกเกม
เมื่อเลือกเกม/แหล่งข้อมูลจริง ค่อยเพิ่มตัวเชื่อมที่เหมาะสม เช่น official API, official news RSS/JSON หรือ parser เฉพาะเว็บไซต์ โดยควรบันทึก source URL และ verified_at ทุกครั้ง
สำหรับงานตามรอบเวลา ให้ใช้ Worker แยกที่มี Cron Trigger แล้วเขียนผลลง D1 หรือเรียก endpoint ที่ป้องกันด้วย secret ห้ามเปิด endpoint สำหรับเขียนข้อมูลให้ทุกคนเรียกได้โดยไม่มีการยืนยันตัวตน

## โครงสร้าง
- `public/index.html` — หน้าเว็บ
- `public/styles.css` — รูปแบบ
- `public/app.js` — ค้นหา, countdown, เรียก API
- `functions/api/health.js` — ตรวจสอบ D1
- `functions/api/games.js` — รายชื่อเกมและกิจกรรม
- `functions/api/events.js` — อ่าน/เพิ่ม/แก้ไข/ลบกิจกรรม (เขียนต้องตั้ง `ADMIN_TOKEN`)
- `schema.sql` — สร้างตาราง
- `wrangler.toml` — ตัวอย่าง config (ต้องใส่ D1 ID จริงก่อนใช้ Wrangler)
