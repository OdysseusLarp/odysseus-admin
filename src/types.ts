interface DataBlob {
  id: string;
  type: string;
  created_at: string;
  updated_at: string;
  version: number;
  [x: string]: any;
}
interface FleetBlob {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  [x: string]: any;
}
export interface State {
  dataBlobs: DataBlob[];
  fleetBlobs: FleetBlob[];
  info: {
    text: string;
    type: string;
  };
  backend: {
    uri: string;
    username?: string;
    password?: string;
    autoRefresh?: number;
  };
  dataBlobTypeChooser: {
    selectedType: string | null;
  };
}
