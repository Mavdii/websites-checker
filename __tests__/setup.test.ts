/**
 * Basic setup test to verify testing infrastructure
 */
describe('Project Setup', () => {
  it('should have a working test environment', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const message: string = 'TypeScript is working';
    expect(message).toBe('TypeScript is working');
  });

  it('should support async/await', async () => {
    const promise = Promise.resolve('async works');
    const result = await promise;
    expect(result).toBe('async works');
  });
});
