import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { AuthGuard } from '@nestjs/passport';
import { Todo } from '@prisma/client';
import { QueryDto } from './dto/query.dto';
import { OrderByEnum } from '../../constants/orderBy.enum';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodoController', () => {
  let controller: TodoController;

  const mockTodoService = {
    create: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    deleteAllDone: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: mockTodoService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a todo', async () => {
    const mockData: CreateTodoDto = { title: 'test' };
    const mockUserId = 1;
    const mockTodo: Todo = {
      id: 1,
      title: 'test',
      userId: mockUserId,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockTodoService, 'create').mockResolvedValue(mockTodo);

    const result = await controller.create(mockData, { user: { id: mockUserId } });

    expect(mockTodoService.create).toHaveBeenCalledWith(mockData, mockUserId);
    expect(result).toEqual(mockTodo);
  });

  it('should get all with query', async () => {
    const mockTodo: Todo = {
      id: 1,
      title: 'test',
      userId: 2,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockQuery: QueryDto = {
      completed: false,
      orderBy: OrderByEnum.ASC
    }
    const mockUserId = 2;
    const mockReq = { user: { id: mockUserId } }
    const mockTodos: Todo[] = [mockTodo]
    jest.spyOn(mockTodoService, 'getAll').mockResolvedValue(mockTodos);

    const result = await controller.getAll(mockReq, mockQuery);

    expect(mockTodoService.getAll).toHaveBeenCalledWith(mockUserId, mockQuery);
    expect(result).toEqual(mockTodos);
  });

  it('should get all without query', async () => {
    const mockTodo: Todo = {
      id: 1,
      title: 'test',
      userId: 2,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockUserId = 2;
    const mockReq = { user: { id: mockUserId } }
    const mockTodos: Todo[] = [mockTodo]
    jest.spyOn(mockTodoService, 'getAll').mockResolvedValue(mockTodos);

    const result = await controller.getAll(mockReq, null);

    expect(mockTodoService.getAll).toHaveBeenCalledWith(mockUserId, null);
    expect(result).toEqual(mockTodos);
  });

  it('should update todo', async () => {
    const mockTodoId = 1;
    const mockTodo: Todo = {
      id: mockTodoId,
      title: 'test',
      userId: 2,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockUpdateTodoDto: UpdateTodoDto = {
      title: 'new title',
    };
    const mockUpdated = { ...mockTodo, ...mockUpdateTodoDto };
    const mockUserId = 2;
    const mockReq = { user: { id: mockUserId } };
  
    jest.spyOn(mockTodoService, 'update').mockResolvedValue(mockUpdated);
  
    const result = await controller.update(mockTodoId, mockUpdateTodoDto, mockReq);
  
    expect(mockTodoService.update).toHaveBeenCalledWith(mockTodoId, mockUpdateTodoDto, mockUserId);
  
    expect(result).toEqual(mockUpdated);
  });

  it('should delete all done todos', async () => {
    const mockDeletedCount = { count: 5 };
    const mockUserId = 2;
    const mockReq = { user: { id: mockUserId } };
  
    jest.spyOn(mockTodoService, 'deleteAllDone').mockResolvedValue(mockDeletedCount);

    const result = await controller.deleteAllDone(mockReq);

    expect(mockTodoService.deleteAllDone).toHaveBeenCalledWith(mockUserId);

    expect(result).toEqual(mockDeletedCount);
  });

  it('should delete todo by id', async () => {
    const mockTodoId = 1;
    const mockTodo: Todo = {
      id: mockTodoId,
      title: 'test',
      userId: 2,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockUserId = 2;
    const mockReq = { user: { id: mockUserId } };
  
    jest.spyOn(mockTodoService, 'delete').mockResolvedValue(mockTodo);
  
    const result = await controller.delete(mockTodoId, mockReq);
  
    expect(mockTodoService.delete).toHaveBeenCalledWith(mockTodoId, mockUserId);
  
    expect(result).toEqual(mockTodo);
  });
});
