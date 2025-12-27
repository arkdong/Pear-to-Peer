# Start with node base image
FROM node:18-alpine AS frontend

WORKDIR /react-app

COPY ./package.json ./package-lock.json ./

RUN npm ci

COPY . .

#WORKDIR /react-app/app

RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to start npm server
CMD ["npm", "start"]