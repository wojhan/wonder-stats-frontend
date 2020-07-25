FROM node:12.0-alpine as builder

RUN mkdir /app
WORKDIR /app

# Copy app dependencies.
COPY app/package.json app/package-lock.json /app/app/

# Install app dependencies.
RUN npm install --prefix app

# Copy app files.
COPY . /app

# Build app
RUN npm run build --prefix app -- --output-path=./dist/out


FROM nginx:1.15.7-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy output directory from builder to nginx image.
COPY --from=builder /app/app/dist/out /usr/share/nginx/html

# Copy nginx configuration file.
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
