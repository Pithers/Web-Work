FROM python
ENV PYTHONUNBUFFERED 1
ENV TERM xterm-256color
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
CMD ["python", "-u", "main.py"]

