set -o errexit

pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt

python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

# Frontend papkasiga o'tib build qilish
cd frontend
npm install
npm run build

# Asosiy ildiz papkaga (root) qaytish
cd ..

# Qaytadan backend papkasida migrate va collectstatic qilish
python backend/manage.py migrate
python backend/manage.py collectstatic --no-input