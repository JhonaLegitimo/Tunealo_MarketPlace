import { gql } from "@apollo/client";

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: Int!, $role: Role!) {
    updateUser(updateUserInput: { id: $id, role: $role }) {
      id
      role
    }
  }
`;
