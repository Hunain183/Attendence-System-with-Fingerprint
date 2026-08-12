# Quick Start - Production Deployment

## ⚡ 5-Minute Setup for Render + Vercel

### Prerequisites
- GitHub account with code pushed
- Render account (render.com)
- Vercel account (vercel.com)
- Generated strong passwords and keys

---

## Step 1: Deploy Backend to Render (3 minutes)

### 1.1 Create PostgreSQL Database
```
Render Dashboard → New → PostgreSQL
- Name: attendance-system-db
- Database: attendance_db
- Username: attendance_user
- Copy Internal Database URL
```

### 1.2 Create Web Service
```
Render Dashboard → New → Web Service
- Connect GitHub repository
- Name: attendance-system-backend
- Environment: Python 3
- Build Command: pip install -r requirements.txt
- Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
- Region: Choose closest
```

### 1.3 Add Environment Variables
```
Go to Web Service Settings → Environment Variables

Add these:
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/attendance_db
SECRET_KEY=[generate: python -c "import secrets; print(secrets.token_urlsafe(32))"]
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
DEVICE_API_KEY=[generate same as SECRET_KEY]
ENCRYPTION_KEY=[32-char string]
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[your-secure-password]
FRONTEND_URL=https://your-project.vercel.app  [Set after Vercel deploy]
SERVER_HOST=0.0.0.0
ENVIRONMENT=production
```

### 1.4 Deploy
```
Click "Deploy" → Wait 3-5 minutes
Test: curl https://your-backend.onrender.com/health
```

### 1.5 Initialize Database
```
Click "Shell" in Render dashboard
$ cd /app
$ python init_db_production.py
$ python create_demo_admin.py
```

---

## Step 2: Deploy Frontend to Vercel (2 minutes)

### 2.1 Create Project
```
Vercel Dashboard → Add New → Project
- Import GitHub repository
- Framework: React
- Root Directory: frontend
- Build: npm run build
- Output: dist
```

### 2.2 Add Environment Variable
```
Project Settings → Environment Variables

Add:
Key: VITE_API_URL
Value: https://your-backend.onrender.com
Environment: Production
```

### 2.3 Deploy
```
Click "Deploy" → Wait 2-3 minutes
Test: https://your-project.vercel.app
```

---

## Step 3: Update Backend CORS

Go back to Render:
```
Settings → Environment Variables
Update FRONTEND_URL = https://your-project.vercel.app
Click "Save Changes"
Click "Manual Deploy" or "Restart"
```

---

## ✅ Verify Deployment

### Test 1: Health Check
```bash
curl https://your-backend.onrender.com/health
# Expected: {"status": "healthy", ...}
```

### Test 2: Frontend Access
```
Open: https://your-project.vercel.app
Should see: Login page
```

### Test 3: Login
```
Username: demo_admin (if created)
Password: change_me_123
Should see: Dashboard
```

### Test 4: API Connection
```bash
# Login and get token
curl -X POST https://your-backend.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}'

# Use token to access employees
curl https://your-backend.onrender.com/employees \
  -H "Authorization: Bearer <token>"
```

---

## 🔑 Generate Secure Keys

```bash
# SECRET_KEY (32 characters minimum)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# DEVICE_API_KEY (same as above)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# ENCRYPTION_KEY (exactly 32 characters)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Or use online generator:
- https://generate-random.org/encryption-key-generator

---

## ⚠️ Important Reminders

- ✅ Change `ADMIN_PASSWORD` from default
- ✅ Generate strong `SECRET_KEY`
- ✅ Never commit `.env` files
- ✅ Use HTTPS only (Render and Vercel provide this)
- ✅ Update `FRONTEND_URL` after Vercel deployment
- ✅ Test database connection in Render shell
- ✅ Monitor logs for errors
- ✅ Delete demo data before production use

---

## 📋 Checklist

- [ ] GitHub code pushed
- [ ] Render PostgreSQL created
- [ ] Render Web Service created
- [ ] Environment variables set on Render
- [ ] Database initialized and populated
- [ ] Backend health check working
- [ ] Vercel project created
- [ ] Vercel environment variables set
- [ ] Frontend build successful
- [ ] Frontend access working
- [ ] Login test successful
- [ ] API request test successful
- [ ] CORS updated with frontend URL
- [ ] Demo admin created
- [ ] Admin password changed
- [ ] Monitoring alerts set up

---

## 🆘 Troubleshooting

### Backend Won't Deploy
```
1. Check Render logs
2. Verify DATABASE_URL format
3. Ensure requirements.txt has all dependencies
4. Check Python version compatibility
```

### CORS Error
```
1. Verify FRONTEND_URL environment variable
2. Should be exact Vercel URL
3. Redeploy backend after changing
4. Check browser console for actual error
```

### Database Connection Failed
```
1. Verify DATABASE_URL is correct
2. Check PostgreSQL service status in Render
3. Test connection in Render Shell:
   psql postgresql://user:pass@host:port/dbname
```

### Login Fails
```
1. Verify ADMIN_PASSWORD
2. Check if demo data created
3. Try with demo_admin/change_me_123
4. Check database has users table
```

### Frontend Can't Call API
```
1. Verify VITE_API_URL in Vercel
2. Should not have /api at end
3. Should be: https://your-backend.onrender.com
4. Redeploy frontend after changing
```

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

---

## 🚀 Next Steps

1. **Initial Testing**
   - Create real admin account
   - Delete demo data
   - Add real employee data

2. **Customization**
   - Update company information
   - Configure shift settings
   - Set salary rates

3. **Integration**
   - Connect fingerprint devices
   - Configure API keys
   - Set up device routes

4. **Monitoring**
   - Set up error alerts
   - Monitor database size
   - Track usage metrics

---

## Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- PostgreSQL Docs: https://www.postgresql.org/docs
