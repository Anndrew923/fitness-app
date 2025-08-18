import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import fs from 'fs';

const rules = fs.readFileSync('firebase-security-rules.txt', 'utf8');

let testEnv;
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-ultimate-physique',
    firestore: { rules },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('rules', () => {
  test('users: only owner can write, others can read', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();
    const usersAlice = alice.collection('users').doc('alice');
    await assertSucceeds(usersAlice.set({ userId: 'alice', nickname: 'A' }));
    await assertFails(
      bob.collection('users').doc('alice').update({ nickname: 'B' })
    );
    await assertSucceeds(bob.collection('users').doc('alice').get());
  });

  test('communityPosts: non-author can only update likes/comments', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();
    const postRef = alice.collection('communityPosts').doc('p1');
    await assertSucceeds(
      postRef.set({ userId: 'alice', text: 'hi', likes: [], comments: [] })
    );
    await assertFails(
      bob.collection('communityPosts').doc('p1').update({ text: 'hack' })
    );
    await assertSucceeds(
      bob
        .collection('communityPosts')
        .doc('p1')
        .update({ likes: ['bob'] })
    );
  });
});
