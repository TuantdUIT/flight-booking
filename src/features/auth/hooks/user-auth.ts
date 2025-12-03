import { useRouter } from "next/navigation";
import { authClient } from "../../../core/lib/auth/client";
import { isSessionValid } from "../utils/session";

export function useAuth() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const isAuthenticated = isSessionValid(session);
	if (isAuthenticated) {
		router.push("/auth/signin");
	}

	return { session, isAuthenticated };
}
