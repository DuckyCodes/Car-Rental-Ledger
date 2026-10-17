import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const receiptDir = path.join(dataDir, 'receipts');
fs.mkdirSync(receiptDir, { recursive: true });
const db = new Database(path.join(dataDir, 'rental-ledger.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS cars (identification INTEGER PRIMARY KEY, name TEXT NOT NULL, make_model TEXT DEFAULT '', year INTEGER, purchase_date TEXT, purchase_price REAL DEFAULT 0, current_value REAL DEFAULT 0, odometer_km REAL DEFAULT 0, depreciation_per_km REAL DEFAULT 0.15, notes TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS rentals (identification INTEGER PRIMARY KEY, vehicle_identification INTEGER NOT NULL REFERENCES cars(identification) ON DELETE CASCADE, renter TEXT DEFAULT '', start_date TEXT NOT NULL, end_date TEXT NOT NULL, start_km REAL DEFAULT 0, end_km REAL DEFAULT 0, daily_rate REAL DEFAULT 0, extra_km_rate REAL DEFAULT 0, included_km_per_day REAL DEFAULT 0, extra_km_revenue REAL DEFAULT 0, other_revenue REAL DEFAULT 0, notes TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS expenses (identification INTEGER PRIMARY KEY, vehicle_identification INTEGER REFERENCES cars(identification) ON DELETE SET NULL, rental_identification INTEGER REFERENCES rentals(identification) ON DELETE SET NULL, date TEXT NOT NULL, category TEXT NOT NULL, description TEXT DEFAULT '', amount REAL NOT NULL DEFAULT 0, treatment TEXT NOT NULL DEFAULT 'operating', receipt_path TEXT DEFAULT '', notes TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS valuations (identification INTEGER PRIMARY KEY, vehicle_identification INTEGER NOT NULL REFERENCES cars(identification) ON DELETE CASCADE, date TEXT NOT NULL, odometer_km REAL DEFAULT 0, market_value REAL NOT NULL DEFAULT 0, notes TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
const rentalColumns = db.prepare('PRAGMA table_info(rentals)').all() as {name:string}[];
if (!rentalColumns.some(column => column.name === 'manually_entered_total_kilometres')) db.exec('ALTER TABLE rentals ADD COLUMN manually_entered_total_kilometres REAL NOT NULL DEFAULT 0');
if (!rentalColumns.some(column => column.name === 'commercial_insurance_used')) db.exec('ALTER TABLE rentals ADD COLUMN commercial_insurance_used INTEGER NOT NULL DEFAULT 0');
 for (const [name, definition] of [['booking_source',"TEXT NOT NULL DEFAULT 'Direct'"],['turo_gross_income','REAL NOT NULL DEFAULT 0'],['turo_discount','REAL NOT NULL DEFAULT 0'],['turo_fee','REAL NOT NULL DEFAULT 0'],['turo_provincial_sales_tax','REAL NOT NULL DEFAULT 0'],['turo_goods_services_tax','REAL NOT NULL DEFAULT 0'],['on_trip_charging_fee','REAL NOT NULL DEFAULT 0'],['other_platform_fee','REAL NOT NULL DEFAULT 0'],['damage_fee','REAL NOT NULL DEFAULT 0'],['admin_fee','REAL NOT NULL DEFAULT 0'],['cleaning_fee','REAL NOT NULL DEFAULT 0'],['deposit_collected','REAL NOT NULL DEFAULT 0'],['deposit_returned','REAL NOT NULL DEFAULT 0']] as const) {
  if (!rentalColumns.some(column => column.name === name)) db.exec(`ALTER TABLE rentals ADD COLUMN ${name} ${definition}`);
}
const expenseColumns = db.prepare('PRAGMA table_info(expenses)').all() as {name:string}[];
if (!expenseColumns.some(column => column.name === 'recurring_monthly')) db.exec('ALTER TABLE expenses ADD COLUMN recurring_monthly INTEGER NOT NULL DEFAULT 0');
const carColumns = db.prepare('PRAGMA table_info(cars)').all() as {name:string}[];
if (!carColumns.some(column => column.name === 'depreciation_model')) db.exec("ALTER TABLE cars ADD COLUMN depreciation_model TEXT NOT NULL DEFAULT 'mileage'");
if (!carColumns.some(column => column.name === 'annual_decline_rate')) db.exec('ALTER TABLE cars ADD COLUMN annual_decline_rate REAL NOT NULL DEFAULT 0.2');
if (!carColumns.some(column => column.name === 'residual_value')) db.exec('ALTER TABLE cars ADD COLUMN residual_value REAL NOT NULL DEFAULT 0');
if (!carColumns.some(column => column.name === 'personal_insurance_monthly')) db.exec('ALTER TABLE cars ADD COLUMN personal_insurance_monthly REAL NOT NULL DEFAULT 0');
if (!carColumns.some(column => column.name === 'commercial_insurance_daily')) db.exec('ALTER TABLE cars ADD COLUMN commercial_insurance_daily REAL NOT NULL DEFAULT 0');
if (!carColumns.some(column => column.name === 'loan_original_amount')) db.exec('ALTER TABLE cars ADD COLUMN loan_original_amount REAL NOT NULL DEFAULT 0');
if (!carColumns.some(column => column.name === 'loan_annual_interest_rate')) db.exec('ALTER TABLE cars ADD COLUMN loan_annual_interest_rate REAL NOT NULL DEFAULT 0');
if (!carColumns.some(column => column.name === 'loan_term_months')) db.exec('ALTER TABLE cars ADD COLUMN loan_term_months INTEGER NOT NULL DEFAULT 0');
if (!carColumns.some(column => column.name === 'loan_start_date')) db.exec('ALTER TABLE cars ADD COLUMN loan_start_date TEXT DEFAULT NULL');
const legacyColumns:Record<string,string[]> = { cars: ['id'], rentals: ['id','car_id','vehicle_id'], expenses: ['id','car_id','vehicle_id','rental_id'], valuations: ['id','car_id','vehicle_id'] };
for (const [table, columnsToRename] of Object.entries(legacyColumns)) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[];
  for (const oldColumn of columnsToRename) {
    const newColumn = oldColumn === 'id' ? 'identification' : (oldColumn === 'car_id' || oldColumn === 'vehicle_id') ? 'vehicle_identification' : 'rental_identification';
    if (columns.some(column => column.name === oldColumn) && !columns.some(column => column.name === newColumn)) db.exec(`ALTER TABLE ${table} RENAME COLUMN ${oldColumn} TO ${newColumn}`);
  }
}
const app = express(); app.use(cors()); app.use(express.json({ limit: '15mb' }));
const allowed = new Set(['cars','rentals','expenses','valuations']);
app.get('/api/:table', (req,res) => { const t=req.params.table; if(!allowed.has(t)) return res.status(404).json({error:'Not found'}); const rows=db.prepare(`SELECT * FROM ${t} ORDER BY identification DESC`).all(); res.json(rows); });
app.post('/api/:table', (req,res) => { const t=req.params.table; if(!allowed.has(t)) return res.status(404).json({error:'Not found'}); const body=req.body ?? {}; const cols=Object.keys(body).filter(k=>/^[a-z_]+$/.test(k)); if(!cols.length) return res.status(400).json({error:'No fields'}); try { const stmt=db.prepare(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${cols.map(c=>`@${c}`).join(',')})`); const result=stmt.run(body); res.json(db.prepare(`SELECT * FROM ${t} WHERE identification=?`).get(result.lastInsertRowid)); } catch(e:any) { res.status(400).json({error:e.message}); } });
app.put('/api/:table/:identification', (req,res) => { const t=req.params.table; if(!allowed.has(t)) return res.status(404).json({error:'Not found'}); const body=req.body ?? {}; const cols=Object.keys(body).filter(k=>/^[a-z_]+$/.test(k)); try { db.prepare(`UPDATE ${t} SET ${cols.map(c=>`${c}=@${c}`).join(',')} WHERE identification=@identification`).run({...body,identification:Number(req.params.identification)}); res.json(db.prepare(`SELECT * FROM ${t} WHERE identification=?`).get(Number(req.params.identification))); } catch(e:any) {res.status(400).json({error:e.message});} });
app.delete('/api/:table/:identification', (req,res) => { const t=req.params.table; if(!allowed.has(t)) return res.status(404).json({error:'Not found'}); const row:any=db.prepare(`SELECT * FROM ${t} WHERE identification=?`).get(Number(req.params.identification)); if(row?.receipt_path) { try { fs.unlinkSync(path.join(root,row.receipt_path)); } catch {} } db.prepare(`DELETE FROM ${t} WHERE identification=?`).run(Number(req.params.identification)); res.json({ok:true}); });
app.post('/api/receipt', (req,res) => { const {name,data}=req.body ?? {}; if(typeof data!=='string'||!data.startsWith('data:')) return res.status(400).json({error:'Invalid receipt'}); const match=data.match(/^data:([^;]+);base64,(.+)$/); if(!match) return res.status(400).json({error:'Invalid file data'}); const ext=({ 'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp' } as Record<string,string>)[match[1]]; if(!ext) return res.status(400).json({error:'Use PDF, JPG, PNG, or WEBP receipts'}); const safe=String(name||'receipt').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,80); const filename=`${Date.now()}-${safe}.${ext}`; fs.writeFileSync(path.join(receiptDir,filename),Buffer.from(match[2],'base64')); res.json({path:`data/receipts/${filename}`}); });
app.get('/api/receipt/:filename', (req,res) => { const f=path.basename(req.params.filename); const full=path.join(receiptDir,f); if(!fs.existsSync(full)) return res.sendStatus(404); res.sendFile(full); });
app.get('/api/backup', (_req,res) => { const tables=['cars','rentals','expenses','valuations']; const out:any={exportedAt:new Date().toISOString(),version:1}; for(const t of tables) out[t]=db.prepare(`SELECT * FROM ${t}`).all(); res.setHeader('Content-Disposition','attachment; filename="rental-ledger-backup.json"'); res.json(out); });
app.post('/api/restore', (req,res) => { const input=req.body; if(!input || !Array.isArray(input.cars)||!Array.isArray(input.rentals)||!Array.isArray(input.expenses)||!Array.isArray(input.valuations)) return res.status(400).json({error:'Invalid backup file'}); const restore=db.transaction(()=>{ for(const t of ['expenses','rentals','valuations','cars']) db.prepare(`DELETE FROM ${t}`).run(); const inserts:any={cars:db.prepare('INSERT INTO cars (identification,name,make_model,year,purchase_date,purchase_price,current_value,odometer_km,depreciation_per_km,depreciation_model,annual_decline_rate,residual_value,personal_insurance_monthly,commercial_insurance_daily,loan_original_amount,loan_annual_interest_rate,loan_term_months,loan_start_date,notes) VALUES (@identification,@name,@make_model,@year,@purchase_date,@purchase_price,@current_value,@odometer_km,@depreciation_per_km,@depreciation_model,@annual_decline_rate,@residual_value,@personal_insurance_monthly,@commercial_insurance_daily,@loan_original_amount,@loan_annual_interest_rate,@loan_term_months,@loan_start_date,@notes)'),rentals:db.prepare('INSERT INTO rentals (identification,vehicle_identification,renter,start_date,end_date,start_km,end_km,daily_rate,extra_km_rate,included_km_per_day,extra_km_revenue,other_revenue,notes) VALUES (@identification,@vehicle_identification,@renter,@start_date,@end_date,@start_km,@end_km,@daily_rate,@extra_km_rate,@included_km_per_day,@extra_km_revenue,@other_revenue,@notes)'),expenses:db.prepare('INSERT INTO expenses (identification,vehicle_identification,rental_identification,date,category,description,amount,treatment,receipt_path,notes) VALUES (@identification,@vehicle_identification,@rental_identification,@date,@category,@description,@amount,@treatment,@receipt_path,@notes)'),valuations:db.prepare('INSERT INTO valuations (identification,vehicle_identification,date,odometer_km,market_value,notes) VALUES (@identification,@vehicle_identification,@date,@odometer_km,@market_value,@notes)')}; for(const t of ['cars','rentals','expenses','valuations']) for(const row of input[t]) inserts[t].run(row); }); try { restore(); res.json({ok:true}); } catch(e:any) {res.status(400).json({error:e.message});} });
app.get('/api/health', (_req,res)=>res.json({ok:true}));
const dist=path.join(root,'dist'); if(fs.existsSync(dist)){app.use(express.static(dist)); app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));}
const port=Number(process.env.PORT||8787); app.listen(port,'127.0.0.1',()=>console.log(`Rental Ledger API: http://127.0.0.1:${port}`));
