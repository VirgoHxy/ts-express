# Define node js version
FROM node:12

# Move all file to /app directory
ADD . /app/

# Create app directory
WORKDIR /app

# Install dependencies
RUN npm install

# APP port
EXPOSE 3000

# CMD: node .
CMD ["node", "."]
