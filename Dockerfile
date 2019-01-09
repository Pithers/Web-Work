FROM python
FROM node
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN npm install -g sass-lint
RUN npm install -g htmlhint
RUN npm install -g jshint
