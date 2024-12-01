import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from '@prisma/client';
import { QueryDto } from './dto/query.dto';
import { OrderByEnum } from '../../constants/orderBy.enum';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId): Promise<Todo> {
    return this.prisma.todo.create({
      data: { title: createTodoDto.title, userId },
    });
  }

  async getAll(userId: number, queryDto?: QueryDto): Promise<Todo[]> {
    const orderBy = queryDto.orderBy || OrderByEnum.DESC;

    const todos = await this.prisma.todo.findMany({
      where: { userId, completed: queryDto?.completed },
      orderBy: { createdAt: orderBy },
    });
    
    return todos;
  }

  async findById(id: number): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      throw new NotFoundException('Todo not Found');
    }

    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number): Promise<Todo> {
    const todo = await this.findById(id);
    
    if (todo.userId !== userId) {
      throw new BadRequestException(`You don't have permission`);
    }

    const updateTodo = await this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });

    return updateTodo;
  }

  async deleteAllDone(userId: number): Promise<void> {
    await this.prisma.todo.deleteMany({ where: { userId, completed: true } });
  }

  async delete(id: number, userId: number): Promise<void> {
    const todo = await this.findById(id);
    
    if (todo.userId !== userId) {
      throw new BadRequestException(`You don't have permission`);
    }

    await this.prisma.todo.delete({ where: { id }});
  }
}
