import { useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
}

interface LoginResponse {
  status: string;
  user: User;
  token: string;
}

interface LoginError {
  status: string;
  message: string;
}

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://todolistapp-371334652902.europe-west1.run.app/api/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        setError(json.message || "Wystąpił błąd podczas logowania");
        return null;
      }

      const data = json as LoginResponse;

      localStorage.setItem("session", JSON.stringify(data));

      return data;
    } catch (err) {
      setError("Błąd połączenia z serwerem");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
