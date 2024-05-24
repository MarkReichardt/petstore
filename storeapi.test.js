const request = require('supertest');
const apiURL = 'https://petstore.swagger.io/v2';

const createPet = async (petData = {}) => {
  const response = await request(apiURL)
    .post('/pet')
    .send(petData)
    .expect(200);

  return response.body;
};

const deletePet = async (petId) => {
  const response = await request(apiURL)
    .delete(`/pet/${petId}`)
    .set('api_key', 'special-key');

  return response;
};

const findPetsByStatus = async (status) => {
  const response = await request(apiURL)
    .get('/pet/findByStatus')
    .query({ status })
    .expect(200);

  return response.body;
};

const findPetById = async (petId) => {
  const response = await request(apiURL)
    .get(`/pet/${petId}`);

  return response;
};

const updatePet = async (petId, petData) => {
  const response = await request(apiURL)
    .put(`/pet/${petId}`)
    .send(petData);

  return response;
};

describe('Pet Store API', () => {
  let petId;

  beforeEach(async () => {
    const newPet = {
      name: 'Fluffy',
      status: 'available'
    };

    const pet = await createPet(newPet);
    petId = pet.id;
  });

  describe('Creating pets', () => {
    it('should create a new pet when all required fields are provided', async () => {
      const newPet = {
        name: 'Fluffy',
        status: 'available'
      };

      const pet = await createPet(newPet);
      expect(pet).toEqual(expect.objectContaining(newPet));
    });

    it('should return a pet object with default values when pet data is empty', async () => {
      const pet = await createPet();
      expect(pet).toEqual(expect.objectContaining({
        id: expect.any(Number),
        photoUrls: [],
        tags: []
      }));
    });
  });

  describe('Deleting pets', () => {
    it('should return 404 when a non-existing ID is provided', async () => {
      const response = await deletePet(999999);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
    });

    it('should return 200 when a valid ID is provided', async () => {
      const response = await deletePet(petId);
      expect(response.status).toBe(200);
    });
  });

  describe('Finding Pets by status', () => {
    it('should find pets by status', async () => {
      const pets = await findPetsByStatus('available');
      expect(Array.isArray(pets)).toBe(true);
      pets.forEach(pet => {
        expect(pet.status).toBe('available');
      });
    });

    ['pending', 'sold'].forEach(status => {
      it(`should find pets with status ${status}`, async () => {
        const pets = await findPetsByStatus(status);
        expect(Array.isArray(pets)).toBe(true);
        pets.forEach(pet => {
          expect(pet.status).toBe(status);
        });
      });
    });

    it('should return an empty array for invalid status', async () => {
      const pets = await findPetsByStatus('invalid_status');
      expect(pets).toEqual(expect.arrayContaining([]));
    });
  });

  describe('Finding pets by ID', () => {
    it('should return 404 for non-existing ID', async () => {
      const response = await findPetById(999999);
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({ message: 'Pet not found' }));
    });

    it('should return an error for invalid ID', async () => {
      const response = await findPetById('invalid_id');
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({ message: 'java.lang.NumberFormatException: For input string: "invalid_id"' }));
    });

    it('should return 200 for existing ID', async () => {
      const response = await findPetById(petId);
      expect(response.status).toBe(200);
    });
  });

  describe('Updating pets', () => {
    it('should return 405 when a valid ID and data are provided', async () => {
      const response = await updatePet(petId, {
        name: 'UpdatedName',
        status: 'sold'
      });
      expect(response.status).toBe(405);
      expect(response.body).toEqual({});
    });

    it('should return 405 when a non-existing ID is provided', async () => {
      const response = await updatePet(999999, {
        name: 'UpdatedName',
        status: 'sold'
      });
      expect(response.status).toBe(405);
      expect(response.body).toEqual({});
    });

    it('should return 200 and the created pet when ID is not provided', async () => {
      const response = await updatePet('', {
        name: 'UpdatedName',
        status: 'sold'
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        name: 'UpdatedName',
        status: 'sold'
      }));
    });

    it('should return 200 when a valid ID and data are provided', async () => {
      const response = await updatePet(petId, {
        name: 'UpdatedName',
        status: 'sold'
      });
      expect(response.status).toBe(200);
    });
  });
});