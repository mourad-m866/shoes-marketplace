import { type SchemaTypeDefinition } from 'sanity'

import { activationRequest } from './activationRequest'
import { exhibition } from './exhibition'
import { shoe } from './shoe'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [exhibition, shoe, activationRequest],
}
