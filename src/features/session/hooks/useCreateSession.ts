import { useMutation } from "@tanstack/react-query"
import { createSession } from "../services"

export function useCreateSession() {
  return useMutation({ mutationFn: createSession })
}
