FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
PYTHONUNBUFFERED=1\ 
PORT=8080\ 
XDG_CACHE_HOME=/app/model_cache

WORKDIR /app

RUN apt-get update && apt-get install -y \
ffmpeg \
gcc \
&& rm -rf /var/lib/apt/lists/*


COPY requirements.txt .

RUN pip install --upgrade pip && \
pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
pip install --no-cache-dir -r requirements.txt


RUN mkdir -p downloads logs vectorstore model_cache

RUN python -c "import whisper; whisper.load_model('small')"
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
