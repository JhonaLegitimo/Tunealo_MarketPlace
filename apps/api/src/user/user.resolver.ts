import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { CurrentUser, CurrentUserData } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Resolver(() => User)
@UseGuards(RolesGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // Ya no se usa - ahora usamos signUp en AuthResolver
  // @Mutation(() => User)
  // async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
  //   return await this.userService.create(createUserInput);
  // }

  @Query(() => User, { name: 'me' })
  async getCurrentUser(@CurrentUser() user: CurrentUserData) {
    return this.userService.findOne(user.id);
  }

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Query(() => [User], { name: 'users' })
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.userService.update(
      updateUserInput.id,
      updateUserInput,
      currentUser.id,
      currentUser.role,
    );
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  async deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }
}
