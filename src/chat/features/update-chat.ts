import { debounce } from "../../shared/helpers/debounce";
import { userProvider } from "../../user/user.svelte";

export function debouncedUpdateChat(chatId: string, data: FormData) {
  const debouncedUpdate = debounce(async () => {
    await userProvider.updateChat(chatId, data);
  }, 500);

  return debouncedUpdate;
}
