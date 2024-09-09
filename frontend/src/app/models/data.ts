
export interface Data {
  status: string;
  name: string;
  isLoading: boolean;
  isResetFail: boolean;
  isInMap: boolean;
  dataMap: {};
  checked: boolean;
  date: string; 
  isFail: boolean; 
  isLoader: boolean;
  reset_modem: boolean;
  data:{
    GPS: {
    status: string;
    error: string;
    devices: {
      [key: string]: {
        puerto: string;
        status: string;
        data: {
          lat: string;
          long: string;
          date: string;
          time: string;
        } | null;
      };
    };
  };
  GPRS: {
    status: string;
    error: string | null;
    interfaces: {
      [key: string]: {
        is_up: boolean;
        has_internet: boolean;
        can_resolve_dns: boolean;
      };
    };
  };
  PM: {
  data:{
    lowBattery: boolean;
    mainPower: boolean;
  };
  message: string;
  status:string;
}
  bootDate: string;
}
}
