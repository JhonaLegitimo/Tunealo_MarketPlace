import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Ya existente - usado por AuthService.signUp()
  async create(createUserInput: CreateUserInput) {
    const { password, ...user } = createUserInput;
    const hashedPassword = await hash(password);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        ...user,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserInput: UpdateUserInput, currentUserId: number, currentUserRole: string) {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Autorización: solo el propio usuario o ADMIN
    if (currentUserId !== id && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updateData: any = { ...updateUserInput };

    // Si se actualiza password, hashearlo
    if (updateUserInput.password) {
      updateData.password = await hash(updateUserInput.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    // Verificar que existe
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return true;
  }
}
