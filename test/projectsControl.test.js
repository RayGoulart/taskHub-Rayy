const { removeDuplicates } = require('../controllers/projectsControl');

describe('removeDuplicates', () => {
  test('remove objetos duplicados pelo _id', () => {
    const input = [{ _id: 1 }, { _id: 2 }, { _id: 1 }];
    const expectedOutput = [{ _id: 1 }, { _id: 2 }];
    expect(removeDuplicates(input)).toEqual(expectedOutput);
  });

  test('retorna o mesmo array se não houver duplicatas', () => {
    const input = [{ _id: 1 }, { _id: 2 }];
    expect(removeDuplicates(input)).toEqual(input);
  });

  test('retorna um array vazio se a entrada estiver vazia', () => {
    expect(removeDuplicates([])).toEqual([]);
  });
});
