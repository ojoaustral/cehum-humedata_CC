import { ParameterIdType } from "./parameters"

export interface NewVariablePost {
  name: string; // new variable name
  location_name: string; // location name
  location_id: string; // location id
  formula: string; // formula of new variable
  params: ParameterIdType[]; // array of parameters included in the new variable
}

export interface NewVariableGet {
  id: string; // new variable ID
  name: string; // new variable name
  locationId: string; // location id
  formula: string; // formula of new variable
  params: string[]; // array of parameters included in the new variable
  createdAt: Date;
  updatedAt: Date;
}

export interface NewVariableUpdate {
  variable_id: string;
  location_id: string;
  name?: string; // new variable name
  formula?: string; // formula of new variable
  params?: ParameterIdType[]; // array of parameters included in the new variable
}