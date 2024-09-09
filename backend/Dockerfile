# backend/Dockerfile

FROM python:3.8-slim-bullseye

# Instalar dependencias necesarias
RUN apt-get update && \
    apt-get install -y iputils-ping bash zstd libcap2 libpcap0.8 && \
    apt-get install -y --no-install-recommends \
    git make gcc autoconf automake libc-dev libzstd-dev linux-libc-dev libssl-dev libcap-dev libpcap-dev patch && \
    mkdir -p /src/ && \
    git clone --depth 1 https://github.com/ntop/n2n.git /src/n2n --branch 3.1.0 && \
    cd /src/n2n && \
    ./autogen.sh && \
    ./configure && \
    make -j$(nproc) && \
    make install && \
    rm -rf /src/n2n && \
    apt-get remove -y --purge \
    git make gcc autoconf automake libc-dev libzstd-dev linux-libc-dev libssl-dev libcap-dev libpcap-dev patch && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Valor por defecto para la variable de entorno
# ENV ENVIRONMENT production

# Copia el script de inicio
COPY start.sh /app/start.sh
# Asegura que el script tenga permisos de ejecución
RUN chmod +x /app/start.sh

EXPOSE 5000

# Usa el script de inicio como comando por defecto
CMD ["/app/start.sh"]
