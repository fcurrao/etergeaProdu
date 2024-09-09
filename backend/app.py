from flask import Flask, request, jsonify
from flask_cors import CORS
from NMEAParser import NMEAParser
from dotenv import load_dotenv
import paramiko
import json
import time
import os
from functools import wraps
import jwt
import datetime
import concurrent.futures

load_dotenv()

app = Flask(__name__)

hostname = os.getenv('HOSTNAME')
port = os.getenv('PORT')
username = os.getenv('USERNAME')
password = os.getenv('PASSWORD')

# Usar la SECRET_KEY desde el .env
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

USERS = {
    'admin': os.getenv('ADMIN_PASSWORD'),
    'user': os.getenv('USER_PASSWORD')
}

script_path = '/usr/local/bin/'

scriptsDict = {'GPS': 'simpleGPS.py', 'GPRS': 'simpleGPRS.py', 'PM': 'simplePM.py'}

scriptPreReset = 'preReset.py'

CORS(app)

def extract_error_message(errors):
    """
    Función para extraer el mensaje de la excepción de la salida de stderr
    """
    lines = errors.strip().split('\n')
    
    # Buscar la línea que contiene el mensaje de la excepción
    for line in lines:
        if 'Exception:' in line:
            # Devolver solo el mensaje después de 'Exception:'
            return line.split('Exception:')[-1].strip()
    
    # Si no se encuentra, devolver todo el mensaje de error
    return errors


def ejecutar_comando(hostname, comando, max_retries=3, retry_delay=2, background=False):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    attempt = 0
    while attempt < max_retries:
        try:
            client.connect(ip_by_ETERGEA(hostname), port=port, username=username, password=password)

            stdin, stdout, stderr = client.exec_command(comando)
            
            if background:
                # Si el comando es en segundo plano, cierra stdin y evita esperar a que termine
                stdin.close()
                stdout.channel.recv_exit_status()
                output = ""
                errors = ""
            else:
                # Si el comando no es en segundo plano, espera a que termine y captura la salida
                output = stdout.read().decode('utf-8')
                errors = stderr.read().decode('utf-8')

                if errors:
                    # Extrae solo el mensaje de la excepción
                    errors = extract_error_message(errors)
                    raise Exception(errors)

            return output, errors
        
        except Exception as e:
            attempt += 1
            if attempt >= max_retries:
                return None, f"Error después de {max_retries} intentos: {str(e)}"
            time.sleep(retry_delay)  # Espera un momento antes de reintentar

        finally:
            # Cerrar la conexión SSH en cada intento
            client.close()



def ejecutar_script_remoto(hostname, script_name):

    # asumo que todos los scripts deben devolver outputs
    result, error_message = ejecutar_comando(hostname, f'python3 {script_path+script_name}')

    if result is not None:
        return json.loads(result), None
    else: return None, error_message
    

def parse_gps(modemsDict):
    nmeaParser = NMEAParser()

    for modem, data in modemsDict.items():

        modemsDict[modem]["antena"] = False

        # Diccionario para almacenar pares de GPGGA y GPRMC
        pairs = {}

        if data['error'] is not None: continue
        # Procesar cada línea del array
        for line in data['data']:
            parts = line.split(',')

            time = parts[1]
            if parts[3] == '': continue # en GPGA es n o s y GPRMC creo que latitud
            if time not in pairs:
                pairs[time] = {"GPGGA": None, "GPRMC": None}
            
            if line.startswith("$GPGGA"):
                pairs[time]["GPGGA"] = line
            elif line.startswith("$GPRMC"):
                pairs[time]["GPRMC"] = line
        
        for time in pairs:
            pairs[time] = nmeaParser.parse(pairs[time])
        
        #Si el modem esta conectado y no trae datos la antena esta desconectada
        if not pairs:
            modemsDict[modem]["data"] = None
        else:
            modemsDict[modem]["data"] = pairs
            modemsDict[modem]["antena"] = True
    
    return modemsDict

def is_valid(GPSData):
    # Inicializar contadores
    count_numSatellites = 0
    count_precision = 0

    # Inicializar variables para encontrar la clave con numSatellites > 3 y precision más baja
    min_precision = float('inf')
    best_value = {'valid': False}

    for key, value in GPSData.items():
        # Verificar numSatellites > 2
        if value.get('numSatellites', 0) > 2:
            count_numSatellites += 1
        
        # Verificar precision < 3
        if value.get('precision', float('inf')) < 3:
            count_precision += 1
        
        # Encontrar la clave con numSatellites > 3 y precision más alta
        if value.get('numSatellites', 0) > 3 and value.get('precision', float('inf')) < min_precision:
            min_precision = value['precision']
            best_value = value
    
    best_value.update({'valid': count_numSatellites >= 3 and count_precision >= 3})
    
    return best_value

def process_gps(gpsOutput):
    GPSstatus = parse_gps(gpsOutput)

    for modem, modemData in GPSstatus.items():
        if modemData["data"] is not None:
            modemData["data"] = is_valid(modemData["data"])
    
    return GPSstatus

def process_pm(pmOutput):
    return {k: v == '1' for k, v in pmOutput.items()}

def process_gprs(gprsOutput):
    for key, subdict in gprsOutput.items():
        if isinstance(subdict, dict):
            gprsOutput[key] = all(subdict.values())
    return gprsOutput

def process_output(output, source):
    if source == 'GPS': return process_gps(output)
    elif source == 'GPRS': return process_gprs(output)
    elif source == 'PM': return process_pm(output)

    raise Exception(f"Falla en procesado de datos.")

def response_from_script(output, errors):
    if not errors:
        return {'status': 'success', 'data': output, 'message': 'OK'}, 200
    else:
        return {'status': 'error', 'error': errors}, 500

def ip_by_ETERGEA(idETERGEA):
    return f"10.16.{ ((idETERGEA) // 256) }.{ ((idETERGEA) % 256)}"

def restart_embedded_device(hostname, reset_modem):
    comando = f'nohup python3 {script_path}simpleReset.py > /usr/local/bin/simpleReset.log 2>&1 &'

    result, error_message = ejecutar_comando(hostname, f'nohup python3 {script_path}simpleReset.py &', background=True)

    if result is not None:
        return jsonify({"status": "Ok", "data": result}), 200
    else:
        return jsonify({"status": "error", "errors": ["Error al reiniciar el dispositivo."]}), 500

def handle_status(id, status_type):
    script = scriptsDict[status_type]
    output, errors = ejecutar_script_remoto(id, script)

    # Manejar el caso donde output es None
    if output:
        output = process_output(output, status_type)

    res, status = response_from_script(output, errors)
    return jsonify(res), status

# Decorador para verificar el token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Verificar si el token está en el encabezado de la solicitud
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decodificar el token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['user']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        # return f(current_user, *args, **kwargs)
        return f(*args, **kwargs) # por ahora ningun api necesita el current_user

    return decorated

@app.route('/login', methods=['POST'])
def login():
    auth = request.json

    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401

    username = auth.get('username')
    password = auth.get('password')

    if username in USERS and password == USERS[username]:
        # Genera el JWT
        token = jwt.encode({
            'user': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'token': token})

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/reset/<int:idETERGEA>', methods=['POST'])
def restart_device(idETERGEA):
    reset_modem = request.form.get('reset_modem', default=True, type=bool)
    return restart_embedded_device(idETERGEA, reset_modem)

@app.route('/PMstatus/<int:idETERGEA>', methods=['GET'])
@token_required
def pmStatus(idETERGEA):
    return handle_status(idETERGEA, 'PM')

@app.route('/GPSstatus/<int:idETERGEA>', methods=['GET'])
@token_required
def GPSStatus(idETERGEA):
    return handle_status(idETERGEA, 'GPS')

@app.route('/GPRSstatus/<int:idETERGEA>', methods=['GET'])
@token_required
def GPRSStatus(idETERGEA):
    return handle_status(idETERGEA, 'GPRS')

@app.route('/status/<int:idETERGEA>', methods=['GET'])
@token_required
def status(idETERGEA):

    retDict = {}
    data = {}

    def run_script(id, script, x):
        try:
            output, error = ejecutar_script_remoto(id, script)
            
            if output:
                output = process_output(output, x)
            
            res, res_status = response_from_script(output, error)
            return res  # Retorna el identificador y el resultado
        except Exception as err:
            return {'status': 'error', 'error': str(err)}
    
    def get_boot_date():
        try:
            output, error = ejecutar_comando(idETERGEA, 'who -b')
            
            if output:
                output = output.strip().split()
                return f"{output[-2]} {output[-1]}"
            else: return "Error al obtener la fecha"

        except Exception as err:
            return "Error al obtener la fecha"
        
    # Ejecutar los scripts en paralelo usando ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Crear un futuro para cada script
        futures = {executor.submit(run_script, idETERGEA, scriptsDict[x], x): x for x in scriptsDict}

        futures[executor.submit(get_boot_date)] = 'bootDate'

        for future in concurrent.futures.as_completed(futures):
            x = futures[future]  # Obtener la clave del diccionario 'futures' que se está completando
            result = future.result()  # Obtener el resultado del futuro
            data[x] = result

    error_count = sum(1 for item in data.values() if "error" in item)
    
    if error_count == 0:
        retDict['status'] = 'success'
        retDict['data'] = data
        retDict['message'] = 'Se obtuvieron correctamente los datos de todas las consultas.'
        status = 200
    elif error_count != len(scriptsDict):
        retDict['status'] = 'partial_success'
        retDict['data'] = data
        retDict['message'] = 'Algunas consultas se obtuvieron correctamente pero en una o mas se encontraron errores.'
        status = 207
    else:
        retDict['data'] = data
        retDict['status'] = 'error'
        retDict['message'] = 'Todas las consultas fallaron.'
        status = 500
        
    return jsonify(retDict), status

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
