# pull official base image
FROM node:16.4.2-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent

# add app
COPY . ./

# create optimized production build
RUN npm run build

# start app
CMD ["serve", "-n", "-s", "build", "-p", "3000"]
