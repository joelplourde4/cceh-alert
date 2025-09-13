FROM node:20-alpine
WORKDIR /app

# Create data directory & set permissions
RUN mkdir -p /app/data
RUN chmod 777 /app/data

COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "npm run-script start"]