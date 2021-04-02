import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Stops {
  readonly id: string;
  readonly huntsID?: string;
  readonly Label?: string;
  readonly JSONData?: string;
  constructor(init: ModelInit<Stops>);
  static copyOf(source: Stops, mutator: (draft: MutableModel<Stops>) => MutableModel<Stops> | void): Stops;
}

export declare class Users {
  readonly id: string;
  readonly Name?: string;
  readonly UserEmail?: string;
  readonly Hunts?: (Hunts | null)[];
  constructor(init: ModelInit<Users>);
  static copyOf(source: Users, mutator: (draft: MutableModel<Users>) => MutableModel<Users> | void): Users;
}

export declare class Hunts {
  readonly id: string;
  readonly Description?: string;
  readonly usersID?: string;
  readonly Stops?: (Stops | null)[];
  constructor(init: ModelInit<Hunts>);
  static copyOf(source: Hunts, mutator: (draft: MutableModel<Hunts>) => MutableModel<Hunts> | void): Hunts;
}