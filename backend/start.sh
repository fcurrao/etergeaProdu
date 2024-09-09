#!/bin/bash

echo "Iniciando VPN..." >> /app/start.log
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Entorno productivo" >> /app/start.log
    nohup edge -d geo-tren -c geo-tren -p 4441 -l 200.80.131.217:4440 -l 190.12.101.222:4440 -f -E -z1 -k Aangaiy7PhahPh5eofaech8d -a static:10.16.0.63/16 >> /app/start.log 2>&1 &
elif [ "$ENVIRONMENT" = "test" ]; then
    echo "Entorno de testing" >> /app/start.log
    nohup edge -d geo-tren -c geo-tren -p 4441 -l 200.80.131.217:4440 -l 190.12.101.222:4440 -f -E -z1 -k Aangaiy7PhahPh5eofaech8d -a static:10.16.0.62/16 >> /app/start.log 2>&1 &
else
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
fi

echo "Esperando 10 segundos para que la VPN se establezca..." >> /app/start.log
sleep 10

echo "Iniciando aplicación Flask..." >> /app/start.log
python app.py