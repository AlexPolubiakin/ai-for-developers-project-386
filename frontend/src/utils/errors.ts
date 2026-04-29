import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

export function getErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response?.data;

    if (response?.errors?.length) {
      return response.errors.map((fieldError) => fieldError.message).join(", ");
    }

    if (response?.message) {
      return response.message;
    }
  }

  return "Не удалось выполнить запрос. Проверьте, что API доступен.";
}
