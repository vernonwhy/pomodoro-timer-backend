import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../models/users.model';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
            registerUser: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getUserDetails', () => {
    it('should return user details for given email', async () => {
      const email = 'test@example.com';

      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(mockUser);

      expect(await usersController.getUserDetails(email)).toEqual(mockUser);
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('registerUser', () => {
    it('should register a user with given email', async () => {
      const registerUserDto = { email: 'test@example.com' };

      jest.spyOn(usersService, 'registerUser').mockResolvedValue(mockUser);

      expect(await usersController.registerUser(registerUserDto)).toEqual(mockUser);
      expect(usersService.registerUser).toHaveBeenCalledWith(registerUserDto);
    });
  });
});
