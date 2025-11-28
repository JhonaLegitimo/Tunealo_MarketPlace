import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';

@Injectable()
export class QuestionService {
    constructor(private prisma: PrismaService) { }

    create(createQuestionInput: CreateQuestionInput, authorId: number) {
        console.log("Service: create", createQuestionInput, authorId)
        return this.prisma.question.create({
            data: {
                ...createQuestionInput,
                authorId,
            },
            include: {
                author: true,
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
    }

    async findAllByProduct(productId: number) {
        console.log("Service: findAllByProduct", productId)
        const questions = await this.prisma.question.findMany({
            where: { productId },
            include: {
                author: true,
                product: {
                    include: {
                        images: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log("Service: found questions", questions.length)
        return questions;
    }

    findAllBySeller(sellerId: number) {
        return this.prisma.question.findMany({
            where: {
                product: {
                    sellerId: sellerId,
                },
            },
            include: {
                author: true,
                product: {
                    include: {
                        images: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    update(id: number, updateQuestionInput: UpdateQuestionInput) {
        return this.prisma.question.update({
            where: { id },
            data: {
                answer: updateQuestionInput.answer,
            },
            include: {
                author: true,
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
    }

    async edit(id: number, content: string, userId: number) {
        const question = await this.prisma.question.findUnique({ where: { id } });
        if (!question || question.authorId !== userId) {
            throw new Error("No autorizado o pregunta no encontrada");
        }
        return this.prisma.question.update({
            where: { id },
            data: { content },
            include: {
                author: true,
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
    }

    async remove(id: number, userId: number) {
        const question = await this.prisma.question.findUnique({ where: { id } });
        if (!question || question.authorId !== userId) {
            throw new Error("No autorizado o pregunta no encontrada");
        }
        return this.prisma.question.delete({
            where: { id },
        });
    }
}
