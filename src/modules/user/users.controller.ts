import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

export class RegisterUserDto {
  email: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('/:email')
  getUserDetails(@Param('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.registerUser(registerUserDto);
  }
}
