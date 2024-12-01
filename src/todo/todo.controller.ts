import { Controller, Get, Post, Body, Req, UseGuards, Query, Patch, Param, ParseIntPipe, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from '@prisma/client';
import { QueryDto } from './dto/query.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTodoDto: CreateTodoDto, @Req() req): Promise<Todo> {
    return this.todoService.create(createTodoDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Req() req, @Query() queryDto: QueryDto): Promise<Todo[]> {
    return this.todoService.getAll(req.user.id, queryDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', new ParseIntPipe()) id: number, @Body() updateTodoDto: UpdateTodoDto, @Req() req): Promise<Todo> {
    return this.todoService.update(id, updateTodoDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAllDone(@Req() req): Promise<void> {
    return this.todoService.deleteAllDone(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', new ParseIntPipe()) id: number, @Req() req): Promise<void> {
    return this.todoService.delete(id, req.user.id);
  }
}
