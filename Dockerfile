# Node.js 20 base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy application files
COPY server.js .
COPY index.html .
COPY app.js .
COPY styles.css .

# Expose server port
EXPOSE 5050

# Start server
CMD ["node", "server.js"]
