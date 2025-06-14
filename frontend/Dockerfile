
FROM node:18-alpine


ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


WORKDIR /app


COPY codes/package*.json ./


RUN npm ci


COPY codes/ .


RUN npm run build


EXPOSE 3000


CMD ["npm", "start"] 