"use client";

import { GET_USERS } from "@/graphql/queries";
import { User } from "@/types/graphql";
import { useQuery } from "@apollo/client";

export function useUsers() {
  const { data, loading, error, refetch } = useQuery(GET_USERS);

  const users: User[] = data?.users || [];
  return {
    users,
    loading,
    error,
    refetch,
  };
}
