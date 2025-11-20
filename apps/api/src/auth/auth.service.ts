import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInInput } from './dto/signin.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { verify, hash } from 'argon2';
import { User } from '@prisma/client';
import { JwtPayload } from './strategies/jwt.strategy';
import { AuthResponse } from './entities/auth-response.entity';
import { CreateUserInput } from 'src/user/dto/create-user.input';

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async validateLocalUser({email, password}: SignInInput) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) throw new UnauthorizedException("User not Found");

        const passwordMatched = await verify(user.password, password);

        if (!passwordMatched) throw new UnauthorizedException("Invalid Credentials!");

        return user;
    }

    generateToken(user: User): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }

    async signIn(signInInput: SignInInput): Promise<AuthResponse> {
        const user = await this.validateLocalUser(signInInput);
        const accessToken = this.generateToken(user);

        return {
            accessToken,
            user: {
                ...user,
                avatar: user.avatar ?? undefined,
            },
        };
    }

    async signUp(createUserInput: CreateUserInput): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserInput.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // Hash password
        const hashedPassword = await hash(createUserInput.password);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                ...createUserInput,
                password: hashedPassword,
            },
        });

        // Generate token
        const accessToken = this.generateToken(user);

        return {
            accessToken,
            user: {
                ...user,
                avatar: user.avatar ?? undefined,
            },
        };
    }
}
