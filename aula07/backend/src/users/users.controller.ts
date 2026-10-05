import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list() {
    return {
      data: await this.usersService.listUsers(),
    };
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return {
      data: await this.usersService.updateStatus(id, dto.active),
    };
  }
}
