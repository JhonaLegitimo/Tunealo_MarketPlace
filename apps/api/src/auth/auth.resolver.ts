import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/signin.input';
import { AuthResponse } from './entities/auth-response.entity';
import { Public } from './decorators/public.decorator';
import { CreateUserInput } from 'src/user/dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async signIn(@Args('signInInput') signInInput: SignInInput): Promise<AuthResponse> {
    return this.authService.signIn(signInInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async signUp(@Args('createUserInput') createUserInput: CreateUserInput): Promise<AuthResponse> {
    return this.authService.signUp(createUserInput);
  }
}
