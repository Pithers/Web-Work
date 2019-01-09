FROM python
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN apt-get install nodejs npm
RUN npm install -g sass-lint
RUN npm install -g htmlhint
RUN npm install -g jshint
