#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt

python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

# Frontendi yig'ish va static fayllarni ko'chirish qismlari...
# 2. React ni o'rnatish va build qilish
cd ../frontend
npm install
npm run build

# 3. Django bazasini yangilash va statik fayllarni yig'ish
cd ../backend
python manage.py migrate
python manage.py collectstatic --no-input