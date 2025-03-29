# containers/sentiment-analysis/Dockerfile
FROM python:3.9-slim

WORKDIR /app

RUN pip install --no-cache-dir nltk textblob pandas

COPY app.py .

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('vader_lexicon')"

CMD ["python", "app.py"]