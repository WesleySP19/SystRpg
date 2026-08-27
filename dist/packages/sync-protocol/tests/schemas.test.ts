import { describe, it, expect } from 'vitest';
import { EntityMoveEventSchema, RequestEntityMoveSchema, SessionIdSchema } from '../src/schemas.js';

describe('Sync Protocol Schemas', () => {
  it('should validate a correct SessionId', () => {
    const valid = 'session:123e4567-e89b-12d3-a456-426614174000';
    expect(SessionIdSchema.parse(valid)).toBe(valid);
  });

  it('should reject an invalid SessionId', () => {
    const invalid = 'campaign:1234';
    expect(() => SessionIdSchema.parse(invalid)).toThrow();
  });

  it('should validate EntityMoveEvent', () => {
    const event = {
      meta: {
        sessionId: 'session:1234',
        timestamp: 1620000000,
      },
      payload: {
        entityId: 'token_1',
        position: { x: 10, y: 15 },
        animate: true,
      },
    };

    const parsed = EntityMoveEventSchema.parse(event);
    expect(parsed.payload.position.z).toBe(0); // tests default
  });

  it('should validate RequestEntityMove', () => {
    const request = {
      meta: {
        sessionId: 'session:uuid-1234',
      },
      payload: {
        entityId: 'token_1',
        targetPosition: { x: 5, y: 5 },
      },
    };

    const parsed = RequestEntityMoveSchema.parse(request);
    expect(parsed.payload.targetPosition.x).toBe(5);
  });
});
