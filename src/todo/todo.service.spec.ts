import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TodoService } from './todo.service';
import { OrderByEnum } from '../../constants/orderBy.enum';
import { QueryDto } from './dto/query.dto';
import { BadRequestException, NotAcceptableException, NotFoundException } from '@nestjs/common';

describe('TodoService', () => {
  let service: TodoService;
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create todo', async () => {
    const todo = {title: 'do task'};
    const userId = 1;

    prisma.todo.create = jest.fn().mockResolvedValue(todo);

    const result = await service.create(todo, userId);

    expect(prisma.todo.create).toHaveBeenCalled()
    expect(result).toEqual(todo);
  });

  it('should apply queryDto properties correctly', async () => {
    const mockTodos = [
      { id: 1, userId: 1, completed: true, createdAt: new Date() },
    ];

    prisma.todo.findMany = jest.fn().mockResolvedValue(mockTodos);

    const queryDto: QueryDto = { orderBy: OrderByEnum.ASC, completed: true };

    const result = await service.getAll(1, queryDto);

    expect(prisma.todo.findMany).toHaveBeenCalledWith({
      where: { userId: 1, completed: true },
      orderBy: { createdAt: 'asc' },
    });

    expect(result).toEqual(mockTodos);
  });

  it('find todo by id success', async () => {
    const mockTodo = { id:1, title: 'do task' };
    prisma.todo.findUnique = jest.fn().mockResolvedValue(mockTodo);

    const result = await service.findById(mockTodo.id);

    expect(prisma.todo.findUnique).toHaveBeenCalledWith({where: { id: mockTodo.id } });
    expect(result).toEqual(mockTodo);
  });

  it('find todo by id fail', async () => {
    const todoId = 1;
    prisma.todo.findUnique = jest.fn().mockResolvedValue(null);

    await expect(service.findById(todoId)).rejects.toThrow(NotFoundException);
  });

  it('should update todo successfully', async () => {
    const todoId = 1;
    const userId = 2;
    const mockTodo = {
      id: todoId, userId,
      title: 'old title',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updateDto = { title: 'new title' };
    const updatedTodo = { ...mockTodo, ...updateDto };

    jest.spyOn(service, 'findById').mockResolvedValue(mockTodo);
    prisma.todo.update = jest.fn().mockResolvedValue(updatedTodo);

    const result = await service.update(todoId, updateDto, userId);

    expect(service.findById).toHaveBeenCalledWith(todoId);
    expect(prisma.todo.update).toHaveBeenCalledWith({
      where: { id: todoId },
      data: updateDto,
    });
    expect(result).toEqual(updatedTodo);
  });

    it('should update todo successfully', async () => {
    const todoId = 1;
    const userId = 2;
    const mockTodo = {
      id: todoId,
      userId,
      title: 'old title',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updateDto = { title: 'new title' };
    const updatedTodo = { ...mockTodo, ...updateDto };

    jest.spyOn(service, 'findById').mockResolvedValue(mockTodo);
    prisma.todo.update = jest.fn().mockResolvedValue(updatedTodo);

    const result = await service.update(todoId, updateDto, userId);

    expect(service.findById).toHaveBeenCalledWith(todoId);
    expect(prisma.todo.update).toHaveBeenCalledWith({
      where: { id: todoId },
      data: updateDto,
    });
    expect(result).toEqual(updatedTodo);
  });

  // ??
  it('should throw BadRequestException if user does not own the todo', async () => {
    const todoId = 1;
    const userId = 2;
    const mockTodo = {
      id: todoId,
      userId: 1,
      title: 'old title',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updateDto = { title: 'updated title' };

      jest.spyOn(service, 'findById').mockResolvedValue(mockTodo);

      await expect(service.update(todoId, updateDto, userId)).rejects.toThrow(
        new BadRequestException(`You don't have permission`),
      );

      expect(service.findById).toHaveBeenCalledWith(todoId);
      expect(prisma.todo.update).not.toHaveBeenCalled();
    });
});
