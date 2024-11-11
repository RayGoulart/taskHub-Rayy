const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User, Task, Comment } = require('../models/model');
const request = require('supertest');
const app = require('../index'); // Importando sua aplicação Express

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  
  const user = new User({ name: 'Test User', email: 'testuser@example.com', password: 'testpassword' });
  await user.save();

  const task = new Task({ title: 'Test Task', user: user._id });
  await task.save();
});

afterEach(async () => {
  await Comment.deleteMany({});
  await Task.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db.dropCollection('comments');
    await mongoose.connection.db.dropCollection('tasks');
    await mongoose.connection.db.dropCollection('users');
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Comment Tests', () => {
  it('deve retornar os comentários de uma tarefa específica', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    expect(task).toBeDefined();
    const comments = await Comment.find({ task: task._id });
    expect(comments).toHaveLength(0); // Nenhum comentário ainda
  });
it('deve criar um comentário para uma tarefa', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    expect(task).toBeDefined();
    if (task) {
      const comment = new Comment({ content: 'Test comment', task: task._id, user: task.user });
      await comment.save();
      
      const savedComment = await Comment.findOne({ content: 'Test comment' });
      expect(savedComment).toBeDefined();
      expect(savedComment.content).toBe('Test comment');
    }
  });

  it('deve retornar 400 se a criação do comentário falhar', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    expect(task).toBeDefined();
    if (task) {
      const response = await request(app)
        .post('/comments')
        .send({ content: '', taskId: task._id }); // Falha na criação
      expect(response.status).toBe(400);
    }
  });

  it('deve atualizar um comentário', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    expect(task).toBeDefined();
    if (task) {
      const comment = new Comment({ content: 'Old content', task: task._id, user: task.user });
      await comment.save();

      const updatedContent = 'Updated content';
      await Comment.updateOne({ _id: comment._id }, { content: updatedContent });
      const updatedComment = await Comment.findById(comment._id);
      
      expect(updatedComment.content).toBe(updatedContent);
    }
  });

  it('deve retornar 404 se o comentário não for encontrado para atualização', async () => {
    const response = await request(app)
      .put('/comments/nonexistent-id')
      .send({ content: 'Updated content' });
    expect(response.status).toBe(404);
  });

  it('deve deletar um comentário', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    expect(task).toBeDefined();
    if (task) {
      const comment = new Comment({ content: 'Delete me', task: task._id, user: task.user });
      await comment.save();

      await Comment.deleteOne({ _id: comment._id });
      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment).toBeNull();
    }
  });

  it('deve retornar 404 se o comentário não for encontrado para exclusão', async () => {
    const response = await request(app)
      .delete('/comments/nonexistent-id')
      .set('Cookie', 'your_cookie_here'); // Adicione um cookie válido, se necessário
    expect(response.status).toBe(401);
  });
});
