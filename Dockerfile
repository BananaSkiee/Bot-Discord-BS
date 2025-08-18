# Gunakan Node.js versi 18
FROM node:22

# Set direktori kerja
WORKDIR /app

# Copy package.json & package-lock.json dulu
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua source code
COPY . .

# Expose port Express
EXPOSE 8080

# Command untuk jalanin bot
CMD ["npm", "start"]
