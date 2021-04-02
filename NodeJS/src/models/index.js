// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Stops, Users, Hunts } = initSchema(schema);

export {
  Stops,
  Users,
  Hunts
};