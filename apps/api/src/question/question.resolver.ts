import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { EditQuestionInput } from './dto/edit-question.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Question)
export class QuestionResolver {
    constructor(private readonly questionService: QuestionService) { }

    @Mutation(() => Question)
    @UseGuards(JwtAuthGuard)
    createQuestion(
        @Args('createQuestionInput') createQuestionInput: CreateQuestionInput,
        @Context() context,
    ) {
        console.log("Resolver: createQuestion", createQuestionInput)
        return this.questionService.create(createQuestionInput, context.req.user.id);
    }

    @Query(() => [Question], { name: 'questionsByProduct' })
    findAllByProduct(@Args('productId', { type: () => Int }) productId: number) {
        console.log("Resolver: findAllByProduct", productId)
        return this.questionService.findAllByProduct(productId);
    }

    @Query(() => [Question], { name: 'questionsBySeller' })
    @UseGuards(JwtAuthGuard)
    findAllBySeller(@Args('sellerId', { type: () => Int }) sellerId: number) {
        return this.questionService.findAllBySeller(sellerId);
    }

    @Mutation(() => Question)
    @UseGuards(JwtAuthGuard)
    answerQuestion(@Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput) {
        return this.questionService.update(updateQuestionInput.id, updateQuestionInput);
    }

    @Mutation(() => Question)
    @UseGuards(JwtAuthGuard)
    editQuestion(
        @Args('editQuestionInput') editQuestionInput: EditQuestionInput,
        @Context() context,
    ) {
        return this.questionService.edit(editQuestionInput.id, editQuestionInput.content, context.req.user.id);
    }

    @Mutation(() => Question)
    @UseGuards(JwtAuthGuard)
    removeQuestion(
        @Args('id', { type: () => Int }) id: number,
        @Context() context,
    ) {
        return this.questionService.remove(id, context.req.user.id);
    }
}
