FROM python
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash
RUN apt-get install -y nodejs
RUN npm install -g sass-lint
RUN npm install -g htmlhint
RUN npm install -g jshint
