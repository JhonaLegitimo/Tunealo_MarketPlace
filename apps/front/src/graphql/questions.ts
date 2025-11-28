import { gql } from "@apollo/client";

export const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(createQuestionInput: $input) {
      id
      content
      createdAt
      answer
      author {
        id
        name
      }
    }
  }
`;

export const ANSWER_QUESTION = gql`
  mutation AnswerQuestion($input: UpdateQuestionInput!) {
    answerQuestion(updateQuestionInput: $input) {
      id
      answer
    }
  }
`;

export const EDIT_QUESTION = gql`
  mutation EditQuestion($input: EditQuestionInput!) {
    editQuestion(editQuestionInput: $input) {
      id
      content
    }
  }
`;

export const DELETE_QUESTION = gql`
  mutation DeleteQuestion($id: Int!) {
    removeQuestion(id: $id) {
      id
    }
  }
`;

export const GET_QUESTIONS_BY_PRODUCT = gql`
  query GetQuestionsByProduct($productId: Int!) {
    questionsByProduct(productId: $productId) {
      id
      content
      answer
      createdAt
      author {
        id
        name
      }
    }
  }
`;

export const GET_QUESTIONS_BY_SELLER = gql`
  query GetQuestionsBySeller($sellerId: Int!) {
    questionsBySeller(sellerId: $sellerId) {
      id
      content
      answer
      createdAt
      product {
        title
        images {
          url
        }
      }
      author {
        name
      }
    }
  }
`;
