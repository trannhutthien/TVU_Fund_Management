#!/bin/bash
set -e

echo "=== Deploying backend to HF Spaces ==="

cd "D:\TotNghiep\TVUDevelopmentFundManager\TVU_Fund_Management"

# 1. Save .env content
ENV_CONTENT=$(cat backend/.env)

# 2. Create orphan branch
git checkout --orphan hf-deploy
git rm -rf --cached . 2>/dev/null || true

# 3. Create root-level files for HF
cp backend/README.md README.md
cp backend/Dockerfile Dockerfile

# 4. Add everything
git add -f README.md Dockerfile
git add -f backend/.dockerignore backend/package.json backend/package-lock.json
git add -f backend/server.js
git add -f backend/config/ backend/middleware/ backend/controllers/ backend/models/ 
git add -f backend/routes/ backend/services/ backend/utils/ backend/templates/ backend/database/

# 5. Recreate .env and uploads in index
echo "$ENV_CONTENT" > backend/.env
git add -f backend/.env

mkdir -p backend/uploads/avatars/{staffs,students,fund,donor} backend/uploads/{documents,proofs,tintuc}
touch backend/uploads/.gitkeep
for d in backend/uploads/avatars/staffs backend/uploads/avatars/students backend/uploads/avatars/fund backend/uploads/avatars/donor backend/uploads/documents backend/uploads/proofs backend/uploads/tintuc; do
  touch "$d/.gitkeep"
done
git add -f backend/uploads/

# 6. Commit and push
git commit -m "HF deploy: fix cong no + lai phat"
git push -f https://huggingface.co/spaces/Nthien/tvu-fund-management hf-deploy:main

# 7. Switch back
git checkout -f main
git branch -D hf-deploy

# 8. Restore .env locally
echo "$ENV_CONTENT" > backend/.env

echo "=== Done ==="
