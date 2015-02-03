FROM ubuntu:14.04

# Install dependencies
RUN apt-get update -y

# Clear out node js naming conflict for ubuntu
RUN apt-get --purge remove node
RUN apt-get --purge remove nodejs

#install app dependencies
RUN apt-get install -y nodejs npm git git-core 

#Symbolic Node link
RUN ln -s /usr/bin/nodejs /usr/bin/node

#Pull Latest Code From Repo
ADD . /

#Set working directory
WORKDIR /src/

#Set NPM Repo location
RUN npm config set registry http://registry.npmjs.org/

#Install node modules
RUN npm install

#Expose port and run app
EXPOSE 3000

CMD ["node", "./app.js"]
