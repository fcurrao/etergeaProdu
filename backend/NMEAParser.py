from datetime import datetime, timezone
from time import sleep

class NMEAParser:
    
    def parse(self, pair):
        try:
            ret = {'valid': False}
            GPGGA = {'valid': False}
            GPRMC = {'valid': False} 

            if pair.get('GPGGA') is not None:
                GPGGA = self._parse_gpgga(pair['GPGGA'].split(","))
            
            if pair.get('GPRMC') is not None:
                GPRMC = self._parse_gprmc(pair['GPRMC'].split(","))

            if GPRMC.get('valid'):
                ret.update( {
                    'valid': True,
                    'latitude': GPGGA['latitude'],
                    'longitude': GPGGA['longitude'],
                    'speed': GPRMC['speed'],
                    'curso': GPRMC['curso'],
                    'timestamp': GPRMC['timestamp']
                } )
            
            if GPGGA.get('valid'):
                ret.update( {
                    'valid': True,
                    'precision': GPGGA['precision'],
                    'numSatellites': GPGGA['numSatelites'],
                    'latitude': GPGGA['latitude'],
                    'longitude': GPGGA['longitude'],
                    'height': GPGGA['height'],
                    'timestamp': GPGGA['timestamp']
                } )
            
            return ret

        except Exception as err:
            print(f"Unexpected {err=}, {type(err)=}")
            return {'valid': False}

    def _to_dec(self, value):
        hh = int(value / 100) * 100
        value = hh / 100.0 + ((value - hh) / 60)
        return value

    def _parse_gpgga(self, parts):
        if len(parts) >= 15 and parts[8] != "":
            
            latitude = self._to_dec(float(parts[2]))
            if parts[3] in "SW":
                latitude = -latitude
            longitude = self._to_dec(float(parts[4]))
            if parts[5] in "SW":
                longitude = -longitude
            
            return {
                'valid': True,
                'precision': float(parts[8]),
                'numSatelites': int(parts[7]),
                'latitude': latitude,
                'longitude': longitude,
                'timestamp': self._parse_timestamp(parts[1]),
                'height': float(parts[9])
            }
        else: return {'valid': False}

    def _parse_gprmc(self, parts):
        
        if len(parts) >= 10 and parts[2] == "A":

            latitude = self._to_dec(float(parts[3]))
            if parts[4] in "SW":
                latitude = -latitude
            longitude = self._to_dec(float(parts[5]))
            if parts[6] in "SW":
                longitude = -longitude

            return {
            'valid': True,
            'latitude': latitude,
            'longitude': longitude,
            'speed': float(parts[7]) * 1.852 if parts[7] != "" else None,
            'curso': float(parts[8]) if parts[8] != "" else None,
            'timestamp': self._parse_timestamp(parts[1], parts[10])
            }
        else: return {'valid': False}

    def _parse_timestamp(self, timestamp, date_part=None):
        # Parse the time in HHMMSS.sss format
        try:
            hh = int(timestamp[0:2])
            mm = int(timestamp[2:4])
            ss = int(timestamp[4:6])
            sss = int(timestamp[7:])
            if date_part is None or len(date_part) != 6:
                return datetime.now(timezone.utc).replace(
                    hour=hh, minute=mm, second=ss, microsecond=sss * 1000
                ).astimezone()
            else:
                mo = int(date_part[0:2])
                dd = int(date_part[2:4])
                yy = int(date_part[4:6]) + 2000
                return datetime.now(timezone.utc).replace(
                    year=yy, month=mo, date=dd,
                    hour=hh, minute=mm, second=ss, microsecond=sss * 1000
                ).astimezone()
        except ValueError:
            raise
            # return None