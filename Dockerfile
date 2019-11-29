# Build Stage 1
# This build creates a staging docker image.
#
FROM node:12 AS appbuild
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY ./src ./src
COPY tsconfig.json ./
COPY NodeS7.d.ts ./
RUN npm run build

FROM node:12
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY --from=appbuild /usr/src/app/dist ./dist
COPY ./views ./views
COPY ./public ./public
COPY ./JavaGrapher ./JavaGrapher
COPY DataLoggingTeunissen.jar ./

EXPOSE 3000
CMD npm run start