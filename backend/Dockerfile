FROM node:20-alpine

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy backend source code
COPY . .

# Copy templates for report generation
COPY templates/ ./templates/

# Copy uploads (seed data: avatars, documents)
COPY uploads/ ./uploads/

# Create uploads subdirectories if they don't exist
RUN mkdir -p uploads/avatars/staffs uploads/avatars/students uploads/avatars/fund uploads/avatars/donor uploads/documents uploads/proofs

# HF Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.js"]
