FROM node:4.1.2-onbuild

#Pull Latest Code From Repo
ADD . /

#Install global forever module
RUN npm install forever -g

#minify js
RUN npm install gulp -g
RUN gulp compress

#Expose port and run app
EXPOSE 3000

CMD ["forever", "./app.js"]
