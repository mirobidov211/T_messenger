#!/usr/bin/env bash
set -o errexit

# 1. Django talablarini o'rnatish
cd backend
pip install -r requirements.txt

# 2. React ni o'rnatish va build qilish
cd ../frontend
npm install
npm run build

# 3. Django bazasini yangilash va statik fayllarni yig'ish
cd ../backend
python manage.py migrate
python manage.py collectstatic --no-input